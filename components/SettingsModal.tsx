import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { TelegramConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: TelegramConfig) => void;
  initialConfig: TelegramConfig;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave, initialConfig }) => {
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');

  useEffect(() => {
    if (isOpen) {
      setBotToken(initialConfig.botToken || '');
      setChatId(initialConfig.chatId || '');
    }
  }, [isOpen, initialConfig]);

  const handleSave = () => {
    onSave({ botToken, chatId });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-semibold text-slate-800 text-lg">Telegram Sozlamalari</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Bot Token</label>
            <input
              type="text"
              value={botToken}
              onChange={(e) => setBotToken(e.target.value)}
              placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">@BotFather orqali olingan token</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Kanal ID (Chat ID)</label>
            <input
              type="text"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="@kanal_nomi yoki -100123456789"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
            />
            <p className="text-xs text-slate-500 mt-1">Kanal username (@magistr_guliston) yoki ID raqami. Bot kanalga admin bo'lishi shart.</p>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            Bekor qilish
          </button>
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
          >
            <Save size={16} />
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
};
