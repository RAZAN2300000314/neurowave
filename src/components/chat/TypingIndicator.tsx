import { Brain } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function TypingIndicator() {
  const { t } = useTranslation();
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-neural-400 to-pulse-500 flex items-center justify-center shrink-0 mt-1">
        <Brain className="w-3.5 h-3.5 text-white" />
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-gray-400 font-mono px-1">{t('ai')}</span>
        <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-white dark:bg-dark-700 border border-gray-100 dark:border-dark-600 flex items-center gap-2">
          <div className="flex gap-0.5 items-end">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className="wave-bar bg-neural-400"
                style={{ height: '14px', animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-body">{t('analyzing')}</span>
        </div>
      </div>
    </div>
  );
}
