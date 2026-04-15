import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Brain, MessageSquarePlus, Activity, Zap, ChevronRight, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserChats } from '../services/firebase';
import type { Chat } from '../types';

export default function HomePage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentChats, setRecentChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserChats(user.uid)
      .then((chats) => setRecentChats(chats.slice(0, 5)))
      .finally(() => setLoading(false));
  }, [user]);

  const stats = [
    { label: 'EEG Analyses', value: recentChats.length, icon: Activity, color: 'text-neural-400' },
    { label: 'Signal Patterns', value: '12', icon: Brain, color: 'text-pulse-400' },
    { label: 'Avg. Accuracy', value: '94%', icon: Zap, color: 'text-emerald-400' },
  ];

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-dark-900 via-dark-800 to-neural-950 p-8 text-white">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(14,165,233,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.4) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute top-4 right-8 flex gap-1 items-end opacity-40">
          {[14, 22, 18, 28, 20, 25, 16, 30, 18, 24].map((h, i) => (
            <div
              key={i}
              className="w-1 rounded-full bg-neural-400 wave-bar"
              style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
        <div className="relative space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neural-500/20 border border-neural-400/30 text-neural-300 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-neural-400 animate-pulse" />
            SYSTEM ACTIVE
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">
            {t('homeTitle')}
          </h1>
          <p className="text-gray-400 font-body text-sm max-w-md leading-relaxed">
            {t('homeSubtitle')}
          </p>
          <button
            onClick={() => navigate('/chat')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-neural-500 hover:bg-neural-400 text-white text-sm font-medium transition-all shadow-lg shadow-neural-500/30 hover:shadow-neural-400/40"
          >
            <MessageSquarePlus className="w-4 h-4" />
            {t('startAnalysis')}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 space-y-2">
            <Icon className={`w-5 h-5 ${color}`} />
            <p className="font-display text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 font-body">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent chats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-sm font-bold text-gray-900 dark:text-white tracking-wide uppercase">
            {t('recentChats')}
          </h2>
          <button
            onClick={() => navigate('/history')}
            className="text-xs text-neural-500 hover:text-neural-400 flex items-center gap-1 transition-colors"
          >
            View all <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-3 bg-gray-100 dark:bg-dark-600 rounded w-3/4 mb-2" />
                <div className="h-2 bg-gray-100 dark:bg-dark-600 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : recentChats.length === 0 ? (
          <div className="card p-8 text-center">
            <Brain className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400 font-body">{t('noChats')}</p>
            <button
              onClick={() => navigate('/chat')}
              className="mt-4 btn-primary text-xs"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              {t('startAnalysis')}
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => navigate(`/chat/${chat.id}`)}
                className="card w-full p-4 text-left hover:border-neural-200 dark:hover:border-neural-800/60 transition-all group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-neural-600 dark:group-hover:text-neural-300 transition-colors">
                      {chat.title}
                    </p>
                    {chat.previewText && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate font-body">
                        {chat.previewText}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 shrink-0 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {new Date(chat.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
