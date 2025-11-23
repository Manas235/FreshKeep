import React, { useState, useRef, useEffect } from 'react';
import { BotIcon, SendIcon, XIcon, MessageCircleIcon, MicIcon, LoaderIcon } from './Icons';
import { FoodItem } from '../types';
import { getChefChatResponse } from '../services/geminiService';

interface ChefChatProps {
  inventory: FoodItem[];
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const ChefChat: React.FC<ChefChatProps> = ({ inventory }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: "Hi! I'm Chef Bot. I see your pantry. How can I help you cook today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
      if (isOpen && inputRef.current) {
          inputRef.current.focus();
      }
  }, [isOpen]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsThinking(true);

    try {
        const history = messages.map(m => ({ role: m.role, text: m.text }));
        const responseText = await getChefChatResponse(inventory, text, history);
        
        const botMsg: Message = { 
            id: (Date.now() + 1).toString(), 
            role: 'model', 
            text: responseText 
        };
        setMessages(prev => [...prev, botMsg]);
    } catch (error) {
        const errorMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: "Oops, I dropped the pan! Something went wrong. Try again."
        };
        setMessages(prev => [...prev, errorMsg]);
    } finally {
        setIsThinking(false);
    }
  };

  const startVoiceInput = () => {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
          // @ts-ignore
          const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
          const recognition = new SpeechRecognition();
          recognition.lang = 'en-US';
          recognition.start();

          recognition.onresult = (event: any) => {
              const transcript = event.results[0][0].transcript;
              setInputValue(transcript);
              handleSendMessage(transcript);
          };

          recognition.onerror = (event: any) => {
              console.error("Speech recognition error", event.error);
          };
      } else {
          alert("Voice input is not supported in this browser.");
      }
  };

  const suggestionChips = [
      "What can I cook?",
      "What expires soon?",
      "Healthy snack idea",
      "Dinner under 30 mins"
  ];

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-40 bg-teal-600 hover:bg-teal-700 text-white p-4 rounded-full shadow-xl shadow-teal-200 transition-all transform hover:scale-110 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
        aria-label="Chat with Chef"
      >
        <MessageCircleIcon className="w-8 h-8" />
      </button>

      {/* Chat Interface */}
      <div className={`fixed bottom-6 right-6 z-50 w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden transition-all duration-300 origin-bottom-right flex flex-col ${isOpen ? 'scale-100 opacity-100 h-[500px]' : 'scale-0 opacity-0 h-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="bg-teal-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-full">
               <BotIcon className="w-5 h-5" />
            </div>
            <div>
                <h3 className="font-bold text-sm">Chef Bot</h3>
                <p className="text-xs text-teal-100">Powered by Gemini AI</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="hover:bg-teal-700 p-1 rounded-lg transition-colors">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-grow p-4 overflow-y-auto bg-stone-50 space-y-3 custom-scrollbar">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-teal-600 text-white rounded-tr-none' : 'bg-white text-stone-800 border border-stone-100 rounded-tl-none'}`}>
                        {msg.text}
                    </div>
                </div>
            ))}
            {isThinking && (
                 <div className="flex justify-start">
                    <div className="bg-white border border-stone-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1">
                        <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></span>
                        <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                        <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                 </div>
            )}
            <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        {messages.length < 3 && !isThinking && (
            <div className="px-4 py-2 bg-stone-50 flex gap-2 overflow-x-auto no-scrollbar">
                {suggestionChips.map(chip => (
                    <button 
                        key={chip} 
                        onClick={() => handleSendMessage(chip)}
                        className="flex-shrink-0 text-xs bg-white border border-teal-100 text-teal-700 px-3 py-1.5 rounded-full hover:bg-teal-50 transition-colors shadow-sm"
                    >
                        {chip}
                    </button>
                ))}
            </div>
        )}

        {/* Input Area */}
        <div className="p-3 bg-white border-t border-stone-100 flex items-center gap-2">
            <button 
                onClick={startVoiceInput}
                className="p-2 text-stone-400 hover:text-teal-600 hover:bg-stone-50 rounded-full transition-colors"
                title="Use Voice Input"
            >
                <MicIcon className="w-5 h-5" />
            </button>
            <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
                placeholder="Ask Chef Bot..."
                className="flex-grow bg-stone-100 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
            />
            <button 
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isThinking}
                className="p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
                <SendIcon className="w-4 h-4" />
            </button>
        </div>
      </div>
    </>
  );
};

export default ChefChat;