import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Props {
  url: string;
  label?: string;
}

export default function AudioPlayer({ url, label }: Props) {
  const { t } = useTranslation();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [canPlay, setCanPlay] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onLoaded = () => { setDuration(audio.duration); setCanPlay(true); };
    const onTime = () => setProgress(audio.currentTime);
    const onEnded = () => setPlaying(false);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setPlaying(!playing);
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = ratio * duration;
  };

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const isMockUrl = url.includes('MOCK') || url.includes('onedrive.live.com');

  return (
    <div className="rounded-lg bg-gray-50 dark:bg-dark-700 border border-gray-100 dark:border-dark-600 p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Volume2 className="w-3.5 h-3.5 text-neural-400 shrink-0" />
        <span className="text-xs font-medium text-gray-600 dark:text-gray-300 font-body flex-1">
          {label ?? t('audioPlayer')}
        </span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-neural-400 transition-colors"
          title="Open in OneDrive"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {isMockUrl ? (
        <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono bg-gray-100 dark:bg-dark-600 rounded px-2 py-1.5 truncate">
          {url}
        </div>
      ) : (
        <>
          <audio ref={audioRef} src={url} preload="metadata" />
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              disabled={!canPlay}
              className="w-7 h-7 rounded-full bg-neural-500 hover:bg-neural-400 disabled:opacity-40 flex items-center justify-center text-white transition-colors shrink-0"
            >
              {playing ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5" />}
            </button>

            <div className="flex-1 space-y-1">
              <div
                className="h-1.5 rounded-full bg-gray-200 dark:bg-dark-500 cursor-pointer overflow-hidden"
                onClick={seek}
              >
                <div
                  className="h-full rounded-full bg-neural-400 transition-all"
                  style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 font-mono">
                <span>{fmt(progress)}</span>
                <span>{duration ? fmt(duration) : '--:--'}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
