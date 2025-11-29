export const parseFile = async (file: File): Promise<string> => {
    const extension = file.name.split('.').pop()?.toLowerCase();
  
    if (extension === 'pdf') {
      return parsePDF(file);
    } else if (extension === 'docx') {
      return parseDocx(file);
    } else if (['txt', 'md'].includes(extension || '')) {
      return parseTextFile(file);
    } else {
      throw new Error(`Unsupported file type: .${extension}`);
    }
  };
  
  const parseTextFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };
  
  const parsePDF = async (file: File): Promise<string> => {
    if (!window.pdfjsLib) {
      throw new Error("PDF parser library not loaded.");
    }
    
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += `Page ${i}:\n${pageText}\n\n`;
    }
    return fullText;
  };
  
  const parseDocx = async (file: File): Promise<string> => {
    if (!window.mammoth) {
      throw new Error("DOCX parser library not loaded.");
    }
    const arrayBuffer = await file.arrayBuffer();
    const result = await window.mammoth.extractRawText({ arrayBuffer });
    return result.value;
  };