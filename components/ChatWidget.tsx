import React, { useState, useEffect, useRef } from 'react';
import { Chat } from '@google/genai';
import { ChatMessage } from '../types';
import { getTutorChat, generateImageFromText } from '../services/geminiService';
import { Send, X, MessageSquare, Loader2, Sparkles, Bot, User as UserIcon, Image as ImageIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Props {
  context: string;
}

export const ChatWidget: React.FC<Props> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hi! I'm your AI Tutor. I've read your notes. Ask me anything, or ask me to generate diagrams!",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session when context changes
    if (context) {
      chatSessionRef.current = getTutorChat(context);
      setMessages([{
        id: 'welcome',
        role: 'model',
        text: "Hi! I'm your AI Tutor. I've read your notes. Ask me anything, or ask me to generate diagrams!",
        timestamp: Date.now()
      }]);
    }
  }, [context]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      
      // Handle Function Calls (Image Generation)
      const functionCalls = result.functionCalls;
      
      if (functionCalls && functionCalls.length > 0) {
          for (const call of functionCalls) {
              if (call.name === 'generateImage') {
                  const prompt = call.args['prompt'] as string;
                  
                  // Add a temporary "Generating..." message or just let the loader spin
                  // We'll proceed to generate content
                  
                  try {
                      const imageUri = await generateImageFromText(prompt);
                      
                      // 1. Send success back to model
                      await chatSessionRef.current.sendMessage({
                        message: [
                          {
                              functionResponse: {
                                  name: 'generateImage',
                                  response: { result: "Image generated successfully and displayed to user." }
                              }
                          }
                        ]
                      });

                      // 2. Display image to user
                      const imageMsg: ChatMessage = {
                          id: Date.now().toString(),
                          role: 'model',
                          text: `I've generated an image for: ${prompt}`,
                          image: imageUri,
                          timestamp: Date.now()
                      };
                      setMessages(prev => [...prev, imageMsg]);

                  } catch (err) {
                      console.error("Image generation failed", err);
                      const errorMsg: ChatMessage = {
                          id: Date.now().toString(),
                          role: 'model',
                          text: "Sorry, I couldn't generate that image right now.",
                          timestamp: Date.now()
                      };
                      setMessages(prev => [...prev, errorMsg]);
                  }
              }
          }
      } else {
          // Normal Text Response
          const responseText = result.text;
          const botMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: responseText || "I'm having trouble thinking right now. Try again?",
            timestamp: Date.now()
          };
          setMessages(prev => [...prev, botMsg]);
      }

    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "Sorry, I encountered an error. Please try again.",
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-[90vw] md:w-96 h-[500px] bg-white/80 dark:bg-black/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
          
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-brand-600 to-cyan-600 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2 text-white">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">AI Tutor</h3>
                <p className="text-xs text-brand-100 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/10">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div 
                  className={`max-w-[85%] rounded-2xl p-3.5 text-sm shadow-sm leading-relaxed ${
                    msg.role === 'user' 
                    ? 'bg-brand-600 text-white rounded-tr-none' 
                    : 'bg-white dark:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-white/5 rounded-tl-none'
                  }`}
                >
                  {msg.role === 'model' ? (
                     <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/20 prose-pre:rounded-lg">
                        <ReactMarkdown 
                            components={{
                                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />
                            }}
                        >
                            {msg.text}
                        </ReactMarkdown>
                     </div>
                  ) : (
                    msg.text
                  )}
                </div>
                
                {/* Render Generated Image if present */}
                {msg.image && (
                    <div className="mt-2 max-w-[85%] rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-md">
                        <img src={msg.image} alt="Generated content" className="w-full h-auto" />
                        <div className="bg-black/5 dark:bg-white/5 p-2 text-xs text-slate-500 flex items-center gap-1">
                            <ImageIcon size={12} /> AI Generated
                        </div>
                    </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                 <div className="bg-white dark:bg-white/10 p-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-white/5 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-brand-500" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">Thinking...</span>
                 </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-3 bg-white/50 dark:bg-black/20 border-t border-slate-200 dark:border-white/5 shrink-0 backdrop-blur-sm">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a doubt or request a diagram..."
                className="w-full pl-4 pr-12 py-3 bg-slate-100 dark:bg-white/5 border border-transparent focus:border-brand-500/50 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:outline-none text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 transition"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:hover:bg-brand-500 transition shadow-lg shadow-brand-500/20"
              >
                <Send size={16} />
              </button>
            </div>
          </form>

        </div>
      )}

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-5 py-4 rounded-full font-bold shadow-2xl transition-all transform hover:scale-105 active:scale-95 group border border-white/10 backdrop-blur-md ${
            isOpen 
            ? 'bg-slate-800 dark:bg-white/10 text-white' 
            : 'bg-gradient-to-r from-brand-600 to-cyan-600 text-white hover:shadow-brand-500/40'
        }`}
      >
        {isOpen ? (
            <X size={24} />
        ) : (
            <>
                <MessageSquare size={24} className="group-hover:rotate-12 transition-transform" />
                <span>Ask AI Tutor</span>
            </>
        )}
      </button>

    </div>
  );
};
