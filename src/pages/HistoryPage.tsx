import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { History, Trash2, ChevronRight, Clock, Brain } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserChats, deleteChat } from '../services/firebase';
import type { Chat } from '../types';

export default function HistoryPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getUserChats(user.uid)
      .then(setChats)
      .finally(() => setLoading(false));
  }, [user]);

  const handleDelete = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (!confirm(t('deleteConfirm'))) return;
    setDeleting(chatId);
    await deleteChat(chatId);
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    setDeleting(null);
  };

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    if (diffDays === 1) return 'Yesterday';
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-neural-50 dark:bg-neural-900/30 border border-neural-100 dark:border-neural-800/50 flex items-center justify-center">
          <History className="w-4.5 h-4.5 text-neural-500" />
        </div>
        <div>
          <h1 className="font-display text-xl font-bold text-gray-900 dark:text-white">
            {t('historyTitle')}
          </h1>
          <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mt-0.5">
            {chats.length} analyses stored
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-4 animate-pulse">
              <div className="h-3 bg-gray-100 dark:bg-dark-600 rounded w-2/3 mb-2.5" />
              <div className="h-2.5 bg-gray-100 dark:bg-dark-600 rounded w-1/2 mb-2" />
              <div className="h-2 bg-gray-100 dark:bg-dark-600 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : chats.length === 0 ? (
        <div className="card p-12 text-center space-y-4">
          <Brain className="w-10 h-10 text-gray-200 dark:text-gray-700 mx-auto" />
          <p className="text-sm text-gray-400 dark:text-gray-500 font-body">{t('noHistory')}</p>
          <button onClick={() => navigate('/chat')} className="btn-primary text-sm">
            Start First Analysis
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => navigate(`/chat/${chat.id}`)}
              className="card p-4 cursor-pointer hover:border-neural-200 dark:hover:border-neural-800/60 transition-all group flex items-start gap-4"
            >
              <div className="w-8 h-8 rounded-lg bg-neural-50 dark:bg-neural-900/20 border border-neural-100 dark:border-neural-800/40 flex items-center justify-center shrink-0 mt-0.5">
                <Brain className="w-4 h-4 text-neural-400" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-neural-600 dark:group-hover:text-neural-300 transition-colors">
                  {chat.title}
                </p>
                {chat.previewText && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 line-clamp-1 font-body">
                    {chat.previewText}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="flex items-center gap-1 text-[10px] text-gray-400 font-mono">
                    <Clock className="w-3 h-3" />
                    {formatDate(chat.updatedAt)}
                  </span>
                  <span className="text-[10px] text-gray-300 dark:text-gray-600 font-mono">
                    {chat.messages?.length ?? 0} msgs
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => handleDelete(e, chat.id)}
                  disabled={deleting === chat.id}
                  className="p-1.5 rounded-md text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-neural-400 transition-colors" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
