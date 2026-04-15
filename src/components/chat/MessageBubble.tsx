import { Brain, User, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import AudioPlayer from './AudioPlayer';
import type { Message } from '../../types';

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
  const { t } = useTranslation();
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-1 ${
          isUser
            ? 'bg-gray-200 dark:bg-dark-600'
            : 'bg-gradient-to-br from-neural-400 to-pulse-500'
        }`}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
        ) : (
          <Brain className="w-3.5 h-3.5 text-white" />
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-col gap-2 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono px-1">
          {isUser ? t('you') : t('ai')}
        </span>

        {/* Text bubble */}
        <div
          className={`px-4 py-3 rounded-2xl text-sm font-body leading-relaxed ${
            isUser
              ? 'bg-neural-500 text-white rounded-tr-sm'
              : 'bg-white dark:bg-dark-700 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-dark-600 rounded-tl-sm'
          }`}
        >
          {message.content}
        </div>

        {/* File attachment indicator */}
        {message.inputUrl && (
          <a
            href={message.inputUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-dark-600 text-xs text-gray-500 dark:text-gray-400 hover:text-neural-500 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            {message.fileName ?? 'Uploaded file'}
          </a>
        )}

        {/* Spectrogram */}
        {message.spectrogramUrl && (
          <div className="w-full rounded-xl overflow-hidden border border-gray-100 dark:border-dark-600 bg-gray-50 dark:bg-dark-700">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-dark-600">
              <ImageIcon className="w-3.5 h-3.5 text-neural-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 font-body flex-1">
                {t('spectrogram')}
              </span>
              <a
                href={message.spectrogramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-neural-400 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            {message.spectrogramUrl.includes('MOCK') || message.spectrogramUrl.includes('onedrive.live.com') ? (
              <div className="p-3">
                <div className="text-[10px] font-mono text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-dark-600 rounded px-2 py-1.5 truncate">
                  {message.spectrogramUrl}
                </div>
                {/* Fake spectrogram visualization */}
                <div className="mt-2 h-16 rounded overflow-hidden flex items-end gap-px">
                  {Array.from({ length: 60 }, (_, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        height: `${20 + Math.sin(i * 0.4) * 15 + Math.random() * 30}%`,
                        background: `hsl(${195 + i * 2}, 70%, ${40 + Math.sin(i * 0.3) * 20}%)`,
                        opacity: 0.8,
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <img
                src={message.spectrogramUrl}
                alt="Spectrogram"
                className="w-full object-cover"
              />
            )}
          </div>
        )}

        {/* Audio player */}
        {message.audioUrl && (
          <div className="w-full min-w-[280px]">
            <AudioPlayer url={message.audioUrl} />
          </div>
        )}

        <span className="text-[10px] text-gray-300 dark:text-gray-600 font-mono px-1">
          {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
}
