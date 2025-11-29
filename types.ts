export enum ContentType {
    TEXT = 'TEXT',
    URL = 'URL',
    FILE = 'FILE'
  }
  
  export enum StudyStyle {
    SIMPLE = 'Simple',
    ADVANCED = 'Advanced',
    EXAM = 'Exam Focused',
    CREATIVE = 'Creative'
  }
  
  export enum OutputFormat {
    NOTES = 'Notes',
    FLASHCARDS = 'Flashcards',
    QUIZ = 'Quiz',
    VIDEO = 'AI Video'
  }
  
  export interface Flashcard {
    front: string;
    back: string;
  }
  
  export interface QuizQuestion {
    id: string;
    question: string;
    options: string[];
    answer: string;
    explanation: string;
  }
  
  export interface GeneratedContent {
    id: string;
    timestamp: number;
    title: string;
    originalInput: string;
    summary: string; // Markdown
    flashcards?: Flashcard[];
    quiz?: QuizQuestion[];
    videoUri?: string;
    type: OutputFormat;
    style: StudyStyle;
  }

  export interface User {
    name: string;
    email: string;
    avatar?: string;
    provider: 'google' | 'email';
  }

  export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    image?: string;
    timestamp: number;
  }
  
  // External Libraries
  declare global {
    interface Window {
      pdfjsLib: any;
      mammoth: any;
    }
  }