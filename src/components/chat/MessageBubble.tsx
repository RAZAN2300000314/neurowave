import { Brain, User, Image as ImageIcon, ExternalLink, Activity, BarChart3, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import AudioPlayer from './AudioPlayer';
import type { Message } from '../../types';

interface Props {
  message: Message;
}

// Color palette for the 5 EEG frequency bands
const BAND_COLORS: Record<string, string> = {
  delta: '#818cf8',
  theta: '#34d399',
  alpha: '#fbbf24',
  beta:  '#fb7185',
  gamma: '#c084fc',
};

const BAND_RANGES: Record<string, string> = {
  delta: '0.5-4 Hz',
  theta: '4-8 Hz',
  alpha: '8-12 Hz',
  beta:  '13-30 Hz',
  gamma: '30-45 Hz',
};

export default function MessageBubble({ message }: Props) {
  const { t } = useTranslation();
  const isUser = message.role === 'user';

  const bandData = message.bandPowers
    ? (['delta', 'theta', 'alpha', 'beta', 'gamma'] as const).map((k) => ({
        name: k,
        range: BAND_RANGES[k],
        value: message.bandPowers![k],
        fill: BAND_COLORS[k],
      }))
    : [];

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
          className={`px-4 py-3 rounded-2xl text-sm font-body leading-relaxed whitespace-pre-line ${
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

        {/* Classification badge */}
        {message.classification && (
          <div className="w-full rounded-xl border border-neural-200 dark:border-neural-800/50 bg-gradient-to-br from-neural-50 to-pulse-50 dark:from-neural-900/20 dark:to-pulse-900/20 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-3.5 h-3.5 text-neural-500" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 font-body">
                Classification ({message.classification.mode})
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-display font-bold text-neural-600 dark:text-neural-300">
                {message.classification.label}
              </span>
              <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                {(message.classification.confidence * 100).toFixed(1)}% confidence
              </span>
            </div>
            <div className="space-y-1">
              {message.classification.top_k.map((pred, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 w-5">
                    #{i + 1}
                  </span>
                  <span className="text-xs text-gray-700 dark:text-gray-300 w-24 truncate">
                    {pred.label}
                  </span>
                  <div className="flex-1 h-1.5 bg-gray-200 dark:bg-dark-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-neural-400 to-pulse-400 rounded-full transition-all"
                      style={{ width: `${pred.confidence * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-gray-500 dark:text-gray-400 w-10 text-right">
                    {(pred.confidence * 100).toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Frequency band powers bar chart */}
        {message.bandPowers && (
          <div className="w-full rounded-xl border border-gray-100 dark:border-dark-600 bg-white dark:bg-dark-700 p-3">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-3.5 h-3.5 text-neural-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 font-body">
                Frequency Band Powers (%)
              </span>
            </div>
            <div className="w-full h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bandData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={{ stroke: '#374151' }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#9ca3af' }}
                    tickLine={false}
                    axisLine={{ stroke: '#374151' }}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                    labelStyle={{ color: '#f3f4f6', fontWeight: 600 }}
                    formatter={(value) => [`${value}%`, 'Power'] as [string, string]}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {bandData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Waveform image */}
        {message.waveformUrl && (
          <div className="w-full rounded-xl overflow-hidden border border-gray-100 dark:border-dark-600 bg-gray-50 dark:bg-dark-700">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-dark-600">
              <Activity className="w-3.5 h-3.5 text-neural-400" />
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 font-body flex-1">
                Raw Waveform
              </span>
              <a
                href={message.waveformUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-neural-400 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <img
              src={message.waveformUrl}
              alt="Waveform"
              className="w-full object-cover"
            />
          </div>
        )}

        {/* Spectrogram (kept original fallback logic) */}
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
