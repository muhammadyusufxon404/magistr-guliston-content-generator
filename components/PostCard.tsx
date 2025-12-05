import React, { useState } from 'react';
import { Copy, Check, Send, Loader2 } from 'lucide-react';

interface PostCardProps {
  id: string;
  title: string;
  content: string;
  icon: React.ReactNode;
  colorClass: string;
  onSend?: (id: string, content: string) => void;
  isSending?: boolean;
  isSent?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  id,
  title, 
  content, 
  icon, 
  colorClass, 
  onSend,
  isSending,
  isSent
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-300 group">
      <div className={`px-4 py-3 border-b border-slate-100 flex items-center justify-between ${colorClass} bg-opacity-10`}>
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${colorClass} text-white`}>
            {icon}
          </div>
          <h3 className="font-semibold text-slate-800">{title}</h3>
        </div>
        
        <div className="flex items-center gap-2">
           <button
            onClick={() => onSend && onSend(id, content)}
            disabled={isSending || isSent}
            className={`flex items-center gap-1.5 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-md transition-all border
              ${isSent 
                ? 'bg-green-50 text-green-700 border-green-200' 
                : 'text-blue-600 border-blue-100 hover:bg-blue-50 bg-white'
              } ${isSending ? 'opacity-70 cursor-wait' : ''}`}
            title="Telegramga yuborish"
          >
            {isSending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isSent ? (
              <Check size={14} />
            ) : (
              <Send size={14} />
            )}
            <span className="hidden sm:inline">
              {isSending ? "Yuborilmoqda..." : isSent ? "Yuborildi" : "Kanalga yuborish"}
            </span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-slate-600 transition-colors p-1.5 rounded-md hover:bg-slate-100"
            title="Nusxa olish"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>
        </div>
      </div>
      
      <div className="p-4 bg-slate-50/50">
        <div className="prose prose-sm prose-slate max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-sm md:text-base leading-relaxed text-slate-700 bg-transparent border-none p-0 focus:outline-none resize-none w-full">
            {content}
          </pre>
        </div>
      </div>
    </div>
  );
};
