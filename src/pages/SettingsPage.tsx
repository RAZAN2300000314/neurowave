import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Settings, Sun, Moon, Globe, User, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getUserSettings, saveUserSettings } from '../services/firebase';
import type { Language } from '../types';

const LANGUAGES: { code: Language; label: string; native: string; dir: 'ltr' | 'rtl' }[] = [
  { code: 'en', label: 'English', native: 'English', dir: 'ltr' },
  { code: 'tr', label: 'Turkish', native: 'Türkçe', dir: 'ltr' },
  { code: 'ar', label: 'Arabic', native: 'العربية', dir: 'rtl' },
];

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState<Language>('en');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserSettings(user.uid).then((s) => {
      if (s) {
        setLanguage(s.language);
        setTheme(s.theme);
        i18n.changeLanguage(s.language);
        document.documentElement.dir = LANGUAGES.find((l) => l.code === s.language)?.dir ?? 'ltr';
      }
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await saveUserSettings(user.uid, { theme, language });
      i18n.changeLanguage(language);
      const lang = LANGUAGES.find((l) => l.code === language);
      document.documentElement.dir = lang?.dir ?? 'ltr';
      document.documentElement.lang = language;
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-neural-50 dark:bg-neural-900/30 border border-neural-100 dark:border-neural-800/50 flex items-center justify-center">
          <Settings className="w-4.5 h-4.5 text-neural-500" />
        </div>
        <h1 className="font-display text-xl font-bold text-gray-900 dark:text-white">
          {t('settingsTitle')}
        </h1>
      </div>

      {/* Account */}
      <section className="card p-5 space-y-4">
        <h2 className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest font-body">
          <User className="w-3.5 h-3.5" /> {t('account')}
        </h2>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-neural-400 to-pulse-500 flex items-center justify-center text-white text-sm font-bold">
            {(user?.displayName ?? user?.email ?? '?')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 font-body">
              {user?.displayName ?? 'User'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{user?.email}</p>
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="card p-5 space-y-4">
        <h2 className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest font-body">
          <Sun className="w-3.5 h-3.5" /> {t('appearance')}
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'light' as const, label: t('lightMode'), icon: Sun },
            { value: 'dark' as const, label: t('darkMode'), icon: Moon },
          ].map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                theme === value
                  ? 'border-neural-400 bg-neural-50 dark:bg-neural-900/30 text-neural-700 dark:text-neural-300'
                  : 'border-gray-100 dark:border-dark-600 hover:border-gray-200 dark:hover:border-dark-500 text-gray-600 dark:text-gray-400'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium font-body">{label}</span>
              {theme === value && (
                <CheckCircle className="w-4 h-4 text-neural-400 ml-auto" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Language */}
      <section className="card p-5 space-y-4">
        <h2 className="flex items-center gap-2 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest font-body">
          <Globe className="w-3.5 h-3.5" /> {t('language')}
        </h2>
        <div className="space-y-2">
          {LANGUAGES.map(({ code, label, native }) => (
            <button
              key={code}
              onClick={() => setLanguage(code)}
              className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                language === code
                  ? 'border-neural-400 bg-neural-50 dark:bg-neural-900/30'
                  : 'border-gray-100 dark:border-dark-600 hover:border-gray-200 dark:hover:border-dark-500'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-dark-600 flex items-center justify-center text-sm font-bold font-mono text-gray-600 dark:text-gray-300">
                {code.toUpperCase()}
              </div>
              <div>
                <p className={`text-sm font-medium font-body ${language === code ? 'text-neural-700 dark:text-neural-300' : 'text-gray-700 dark:text-gray-200'}`}>
                  {native}
                </p>
                <p className="text-xs text-gray-400 font-body">{label}</p>
              </div>
              {language === code && (
                <CheckCircle className="w-4 h-4 text-neural-400 ml-auto" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Save */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <span className="flex gap-0.5 items-end">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="wave-bar bg-white" style={{ height: '10px', animationDelay: `${i * 0.1}s` }} />
                ))}
              </span>
            </span>
          ) : (
            t('saveSettings')
          )}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-body animate-fade-in">
            <CheckCircle className="w-4 h-4" />
            {t('settingsSaved')}
          </span>
        )}
      </div>
    </div>
  );
}
