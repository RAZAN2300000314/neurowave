import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Brain, Eye, EyeOff, Zap, Activity } from 'lucide-react';
import { loginWithEmail, registerWithEmail } from '../services/firebase';

export default function LoginPage() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, name);
      }
    } catch {
      setError(mode === 'login' ? t('loginError') : t('registerError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex dark:bg-dark-900 bg-gray-50 overflow-hidden">
      {/* Left panel – branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-dark-900 via-dark-800 to-neural-950 p-12 relative overflow-hidden">
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              'linear-gradient(rgba(14,165,233,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.3) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Glow blobs */}
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-neural-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-pulse-500/20 rounded-full blur-3xl" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neural-400 to-pulse-500 flex items-center justify-center shadow-lg glow-neural">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display text-lg font-bold text-white tracking-tight">
              NEURO<span className="text-gradient">WAVE</span>
            </span>
            <p className="text-[10px] text-neural-400 font-mono">BRAIN SIGNAL AI</p>
          </div>
        </div>

        {/* Center content */}
        <div className="relative space-y-6">
          <div className="flex gap-2 items-end">
            {[18, 28, 22, 35, 25, 30, 20, 32, 18, 26, 38, 22].map((h, i) => (
              <div
                key={i}
                className="w-1.5 rounded-full bg-neural-400 opacity-80 wave-bar"
                style={{ height: `${h}px`, animationDelay: `${i * 0.08}s` }}
              />
            ))}
          </div>

          <h1 className="font-display text-4xl font-bold text-white leading-tight">
            AI-Powered<br />
            <span className="text-gradient">Neural Analysis</span>
          </h1>
          <p className="text-gray-400 font-body text-base leading-relaxed max-w-xs">
            Upload EEG signals and brain activity recordings for real-time AI analysis with spectrograms and audio output.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2">
            {[
              { icon: Activity, label: 'EEG Analysis' },
              { icon: Zap, label: 'Real-time Processing' },
              { icon: Brain, label: 'Neural Patterns' },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-300 font-body"
              >
                <Icon className="w-3 h-3 text-neural-400" />
                {label}
              </span>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-gray-600 font-mono">
          © 2025 NeuroWave AI
        </p>
      </div>

      {/* Right panel – form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8 animate-fade-in">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neural-400 to-pulse-500 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-base font-bold text-gray-900 dark:text-white">
              NEURO<span className="text-gradient">WAVE</span>
            </span>
          </div>

          <div>
            <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-white">
              {mode === 'login' ? t('login') : t('register')}
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 font-body">
              {mode === 'login' ? t('noAccount') : t('hasAccount')}{' '}
              <button
                onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
                className="text-neural-500 hover:text-neural-400 font-medium underline underline-offset-2 transition-colors"
              >
                {mode === 'login' ? t('register') : t('login')}
              </button>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 font-body uppercase tracking-wide">
                  {t('name')}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="input-field"
                  placeholder="Dr. Jane Smith"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 font-body uppercase tracking-wide">
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                placeholder="you@lab.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5 font-body uppercase tracking-wide">
                {t('password')}
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="input-field pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/50 rounded-lg px-3 py-2 font-body">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary justify-center py-3 mt-2"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="flex gap-0.5 items-end">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="wave-bar bg-white"
                        style={{ height: '12px', animationDelay: `${i * 0.12}s` }}
                      />
                    ))}
                  </span>
                </span>
              ) : (
                mode === 'login' ? t('login') : t('register')
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
