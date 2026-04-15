import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Send, Paperclip, Music, Image as ImageIcon, X, Plus, AlertCircle } from 'lucide-react';
import { nanoid } from '../utils/nanoid';
import { useAuth } from '../contexts/AuthContext';
import { sendMessage, analyzeBrainSignal } from '../services/api';
import {
  createChat,
  getChatById,
  addMessageToChat,
  saveFileUrls,
} from '../services/firebase';
import MessageBubble from '../components/chat/MessageBubble';
import TypingIndicator from '../components/chat/TypingIndicator';
import FileUpload from '../components/chat/FileUpload';
import type { Message, FileUrls } from '../types';

export default function ChatPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { chatId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentChatId, setCurrentChatId] = useState<string | null>(chatId ?? null);
  const [pendingUrls, setPendingUrls] = useState<FileUrls | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadType, setUploadType] = useState<'audio' | 'image'>('audio');

  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (chatId) {
      getChatById(chatId).then((chat) => {
        if (chat) setMessages(chat.messages ?? []);
      });
    }
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, []);

  const handleUploadComplete = (urls: FileUrls, file: File) => {
    setPendingUrls(urls);
    setPendingFile(file);
    setShowUpload(false);
  };

  const handleSend = async () => {
    if (!input.trim() && !pendingUrls) return;
    if (!user) return;

    setError('');

    const userMessage: Message = {
      id: nanoid(),
      role: 'user',
      content: input.trim() || (pendingFile ? `Yüklendi: ${pendingFile.name}` : 'Bu dosyayı analiz et'),
      timestamp: Date.now(),
      ...(pendingUrls ?? {}),
      fileName: pendingFile?.name,
      fileType: pendingFile
        ? pendingFile.type.startsWith('audio') ? 'audio' : 'image'
        : 'none',
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setPendingUrls(null);
    setPendingFile(null);
    setLoading(true);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    try {
      let cid = currentChatId;
      if (!cid) {
        cid = await createChat(user.uid, userMessage.content);
        setCurrentChatId(cid);
        navigate(`/chat/${cid}`, { replace: true });
      }

      if (userMessage.audioUrl || userMessage.spectrogramUrl) {
        await saveFileUrls(cid, userMessage.id, {
          audioUrl: userMessage.audioUrl,
          spectrogramUrl: userMessage.spectrogramUrl,
          inputUrl: userMessage.inputUrl,
        });
      }

      const history = newMessages.slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const aiResponse = userMessage.inputUrl
        ? await analyzeBrainSignal(
            {
              audioUrl: userMessage.audioUrl,
              spectrogramUrl: userMessage.spectrogramUrl,
              inputUrl: userMessage.inputUrl,
            },
            userMessage.content
          )
        : await sendMessage(userMessage.content, history);

      const aiMessage: Message = {
        id: nanoid(),
        role: 'assistant',
        content: aiResponse.text,
        timestamp: Date.now(),
        audioUrl: aiResponse.audioUrl || undefined,
        spectrogramUrl: aiResponse.spectrogramUrl || undefined,
      };

      const finalMessages = [...newMessages, aiMessage];
      setMessages(finalMessages);

      await addMessageToChat(cid, finalMessages);

      if (aiMessage.audioUrl || aiMessage.spectrogramUrl) {
        await saveFileUrls(cid, aiMessage.id, {
          audioUrl: aiMessage.audioUrl,
          spectrogramUrl: aiMessage.spectrogramUrl,
        });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Bir hata oluştu.';
      setError(msg);
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-gray-100 dark:border-dark-600 bg-white dark:bg-dark-800 shrink-0">
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-sm font-bold text-gray-900 dark:text-white truncate">
            {messages.length > 0 ? messages[0].content.slice(0, 50) : t('chat')}
          </h1>
          <p className="text-[10px] text-gray-400 font-mono mt-0.5">
            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
          </p>
        </div>
        <button
          onClick={() => {
            setMessages([]);
            setCurrentChatId(null);
            setError('');
            navigate('/chat', { replace: true });
          }}
          className="btn-ghost text-xs gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          {t('newChat')}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neural-400/20 to-pulse-500/20 border border-neural-200 dark:border-neural-800/50 flex items-center justify-center">
              <div className="flex gap-0.5 items-end">
                {[10, 16, 12, 18, 14].map((h, i) => (
                  <div
                    key={i}
                    className="w-1.5 rounded-full bg-neural-400 wave-bar"
                    style={{ height: `${h}px`, animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">
                {t('homeTitle')}
              </h2>
              <p className="text-sm text-gray-400 dark:text-gray-500 font-body mt-1 max-w-xs">
                {t('homeSubtitle')}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setUploadType('audio'); setShowUpload(true); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-500 text-xs text-gray-600 dark:text-gray-400 hover:border-neural-300 hover:text-neural-600 dark:hover:text-neural-300 transition-colors"
              >
                <Music className="w-3.5 h-3.5" /> {t('uploadAudio')}
              </button>
              <button
                onClick={() => { setUploadType('image'); setShowUpload(true); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-500 text-xs text-gray-600 dark:text-gray-400 hover:border-neural-300 hover:text-neural-600 dark:hover:text-neural-300 transition-colors"
              >
                <ImageIcon className="w-3.5 h-3.5" /> {t('uploadImage')}
              </button>
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {loading && <TypingIndicator />}

        {/* Hata mesajı */}
        {error && (
          <div className="flex items-start gap-3 animate-slide-up">
            <div className="w-7 h-7 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0 mt-1">
              <AlertCircle className="w-3.5 h-3.5 text-red-500" />
            </div>
            <div className="flex-1 px-4 py-3 rounded-2xl rounded-tl-sm bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 text-sm text-red-600 dark:text-red-400 font-body whitespace-pre-line">
              {error}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Dosya yükleme paneli */}
      {showUpload && (
        <div className="px-4 py-3 border-t border-gray-100 dark:border-dark-600 bg-gray-50 dark:bg-dark-800/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex gap-1">
              <button
                onClick={() => setUploadType('audio')}
                className={`px-3 py-1 rounded text-xs font-body transition-colors ${
                  uploadType === 'audio'
                    ? 'bg-neural-500 text-white'
                    : 'bg-gray-200 dark:bg-dark-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                <Music className="w-3 h-3 inline mr-1" /> Audio
              </button>
              <button
                onClick={() => setUploadType('image')}
                className={`px-3 py-1 rounded text-xs font-body transition-colors ${
                  uploadType === 'image'
                    ? 'bg-neural-500 text-white'
                    : 'bg-gray-200 dark:bg-dark-600 text-gray-600 dark:text-gray-400'
                }`}
              >
                <ImageIcon className="w-3 h-3 inline mr-1" /> Image
              </button>
            </div>
            <button
              onClick={() => setShowUpload(false)}
              className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <FileUpload type={uploadType} onUploadComplete={handleUploadComplete} />
        </div>
      )}

      {/* Bekleyen dosya */}
      {pendingFile && !showUpload && (
        <div className="px-4 py-2 border-t border-gray-100 dark:border-dark-600 bg-neural-50 dark:bg-neural-900/20">
          <div className="flex items-center gap-2 text-xs text-neural-700 dark:text-neural-300">
            <Paperclip className="w-3.5 h-3.5" />
            <span className="flex-1 truncate font-body">{pendingFile.name}</span>
            <button onClick={() => { setPendingFile(null); setPendingUrls(null); }}>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-4 border-t border-gray-100 dark:border-dark-600 bg-white dark:bg-dark-800 shrink-0">
        <div className="flex items-end gap-3 max-w-3xl mx-auto">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className={`p-2.5 rounded-lg border transition-colors shrink-0 mb-0.5 ${
              showUpload
                ? 'bg-neural-500 border-neural-500 text-white'
                : 'border-gray-200 dark:border-dark-500 text-gray-400 hover:border-neural-300 hover:text-neural-500'
            }`}
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); resizeTextarea(); }}
              onKeyDown={handleKeyDown}
              placeholder={t('typeMessage')}
              rows={1}
              disabled={loading}
              className="input-field resize-none py-2.5 min-h-[44px] max-h-[140px]"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={loading || (!input.trim() && !pendingUrls)}
            className="p-2.5 rounded-lg bg-neural-500 hover:bg-neural-400 disabled:opacity-40 disabled:cursor-not-allowed text-white transition-colors shrink-0 mb-0.5 shadow-md shadow-neural-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}