import React, { useState, useEffect } from 'react';
import { CloudSun, BookOpen, Lightbulb, Cake, RefreshCw, Send, Bot, Settings, Rocket } from 'lucide-react';
import { fetchWeatherData } from './services/weatherService';
import { generateDailyContent } from './services/geminiService';
import { sendTelegramMessage } from './services/telegramService';
import { PostCard } from './components/PostCard';
import { SettingsModal } from './components/SettingsModal';
import { PostItem, TelegramConfig } from './types';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Telegram Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [telegramConfig, setTelegramConfig] = useState<TelegramConfig>({ botToken: '', chatId: '' });

  const FOOTER_TEXT = "\n\n📣 @magistr_guliston sahifasini kuzatishda davom eting!";

  useEffect(() => {
    const savedConfig = localStorage.getItem('telegramConfig');
    if (savedConfig) {
      setTelegramConfig(JSON.parse(savedConfig));
    }
  }, []);

  const handleSaveConfig = (config: TelegramConfig) => {
    setTelegramConfig(config);
    localStorage.setItem('telegramConfig', JSON.stringify(config));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setPosts([]);

    const today = new Date();
    const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
    const dateStr = `${today.getDate()}-${months[today.getMonth()]}`;

    try {
      const [weatherData, aiContent] = await Promise.all([
        fetchWeatherData(),
        generateDailyContent(dateStr)
      ]);

      const newPosts: PostItem[] = [
        {
          id: 'weather',
          title: 'Ob-havo',
          icon: <CloudSun size={20} />,
          content: weatherData.originalText,
          isSent: false,
          isSending: false
        },
        {
          id: 'education',
          title: 'Ta’lim fakti',
          icon: <BookOpen size={20} />,
          content: `📚 **Ta’lim fakti:**\n\n${aiContent.educationFact}${FOOTER_TEXT}`,
          isSent: false,
          isSending: false
        },
        {
          id: 'motivation',
          title: 'Motivatsiya',
          icon: <Lightbulb size={20} />,
          content: `💡 **Motivatsiya:**\n\n${aiContent.motivation}${FOOTER_TEXT}`,
          isSent: false,
          isSending: false
        },

        {
          id: 'birthdays',
          title: 'Tavallud topganlar',
          icon: <Cake size={20} />,
          content: `🎂 **Bugun tavallud topganlar:**\n\n${aiContent.birthdays}${FOOTER_TEXT}`,
          isSent: false,
          isSending: false
        }
      ];

      setPosts(newPosts);

    } catch (err) {
      console.error(err);
      setError("Ma'lumotlarni yuklashda xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendToTelegram = async (id: string, content: string) => {
    if (!telegramConfig.botToken || !telegramConfig.chatId) {
      setIsSettingsOpen(true);
      alert("Iltimos, avval Telegram sozlamalarini kiriting.");
      return;
    }

    setPosts(currentPosts => 
      currentPosts.map(post => post.id === id ? { ...post, isSending: true } : post)
    );

    try {
      await sendTelegramMessage(telegramConfig.botToken, telegramConfig.chatId, content);
      
      setPosts(currentPosts => 
        currentPosts.map(post => post.id === id ? { ...post, isSending: false, isSent: true } : post)
      );
    } catch (err: any) {
      console.error("Send error:", err);
      alert(`Xatolik: ${err.message}`);
      setPosts(currentPosts => 
        currentPosts.map(post => post.id === id ? { ...post, isSending: false } : post)
      );
    }
  };

  const handleSendAll = async () => {
    if (!telegramConfig.botToken || !telegramConfig.chatId) {
      setIsSettingsOpen(true);
      return;
    }

    if (!window.confirm("Barcha postlarni ketma-ket kanalga yuborishni tasdiqlaysizmi?")) return;

    for (const post of posts) {
      if (!post.isSent) {
        await handleSendToTelegram(post.id, post.content);
        // Small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveConfig}
        initialConfig={telegramConfig}
      />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <Bot size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-800 leading-tight">Magistr Content</h1>
              <p className="text-xs text-slate-500 font-medium">Telegram Post Generator</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Telegram Sozlamalari"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm
                ${loading 
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md active:scale-95'
                }`}
            >
              {loading ? (
                <RefreshCw className="animate-spin" size={18} />
              ) : (
                <Rocket size={18} />
              )}
              <span className="hidden sm:inline">{loading ? 'Yaratilmoqda...' : 'Generatsiya'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 md:py-8 space-y-6">
        
        {/* Intro State */}
        {posts.length === 0 && !loading && !error && (
          <div className="text-center py-20 px-4">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bot className="text-blue-500" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Xush kelibsiz!</h2>
            <p className="text-slate-500 max-w-md mx-auto">
              Kunlik kontentni yaratish uchun "Generatsiya" tugmasini bosing. 
              Sun'iy intellekt va ob-havo ma'lumotlari birlashtirilib, 5 ta tayyor post yaratiladi.
            </p>
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="mt-6 text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-1 mx-auto"
            >
              <Settings size={16} /> Telegram botni sozlash
            </button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
            <div className="bg-red-100 p-1.5 rounded-full">!</div>
            <p>{error}</p>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-xl h-40 border border-slate-200 p-4 space-y-3">
                <div className="h-6 bg-slate-100 rounded w-1/3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-slate-100 rounded w-full"></div>
                  <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                  <div className="h-4 bg-slate-100 rounded w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results Grid */}
        {posts.length > 0 && (
          <div className="flex justify-end mb-2">
             <button 
               onClick={handleSendAll}
               className="text-sm font-medium text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
             >
               <Send size={16} /> Barchasini yuborish
             </button>
          </div>
        )}

        <div className="space-y-6 pb-12">
          {posts.map((post) => {
            let colorClass = 'bg-blue-500';
            if (post.id === 'weather') colorClass = 'bg-sky-500';
            if (post.id === 'education') colorClass = 'bg-indigo-500';
            if (post.id === 'motivation') colorClass = 'bg-amber-500';
            if (post.id === 'history') colorClass = 'bg-emerald-500';
            if (post.id === 'birthdays') colorClass = 'bg-rose-500';

            return (
              <PostCard
                key={post.id}
                id={post.id}
                title={post.title}
                content={post.content}
                icon={post.icon}
                colorClass={colorClass}
                onSend={handleSendToTelegram}
                isSending={post.isSending}
                isSent={post.isSent}
              />
            );
          })}
        </div>
      </main>
      
      {/* Simple Footer */}
      <footer className="text-center py-6 text-slate-400 text-sm border-t border-slate-100">
        &copy; {new Date().getFullYear()} Magistr AI Assistant
      </footer>
    </div>
  );
};

export default App;
