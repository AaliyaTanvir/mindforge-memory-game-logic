import { useState } from 'react';
import { Settings as SettingsIcon, Sun, Moon, Bell, Volume2, Globe, Shield, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import Button from '../components/Button';

function Toggle({ checked, onChange, label, description, icon: Icon }) {
  return (
    <div className="flex items-center justify-between py-2.5 sm:py-3 border-b border-slate-200/40 dark:border-white/5 last:border-0 gap-3">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {Icon && <Icon size={18} className="text-slate-400 shrink-0" />}
        <div className="min-w-0">
          <p className="font-medium text-xs sm:text-sm truncate">{label}</p>
          {description && <p className="text-[11px] sm:text-xs text-slate-400 truncate">{description}</p>}
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 sm:w-12 h-6 rounded-full transition-colors shrink-0 ${checked ? 'gradient-btn' : 'bg-slate-300 dark:bg-slate-700'}`}
        aria-label={label}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5 sm:translate-x-6' : ''}`}
        />
      </button>
    </div>
  );
}

export default function Settings() {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme, setTheme } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    navigate('/login');
  };

  const username = profile?.username || user?.user_metadata?.username || user?.email?.split('@')[0] || 'Player';
  const email = profile?.email || user?.email || '-';
  const createdDate = profile?.created_at || user?.created_at;
  const memberSince = createdDate ? new Date(createdDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Today';

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold flex items-center gap-2">
          <SettingsIcon className="text-slate-500 shrink-0" /> Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1">Customize your MindForge experience.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Appearance */}
        <GlassCard className="p-4 sm:p-6">
          <h2 className="font-display text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <Sun size={18} className="text-amber-500 shrink-0" /> Appearance
          </h2>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-3 sm:mb-4">
            <button
              onClick={() => setTheme('light')}
              className={`p-3 sm:p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 sm:gap-2 ${theme === 'light' ? 'border-accent-purple bg-accent-purple/10' : 'border-slate-200 dark:border-slate-700'}`}
            >
              <Sun size={20} className="text-amber-500" />
              <span className="text-xs sm:text-sm font-medium">Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-3 sm:p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1.5 sm:gap-2 ${theme === 'dark' ? 'border-accent-purple bg-accent-purple/10' : 'border-slate-200 dark:border-slate-700'}`}
            >
              <Moon size={20} className="text-accent-blue" />
              <span className="text-xs sm:text-sm font-medium">Dark</span>
            </button>
          </div>
          <Toggle
            icon={SettingsIcon}
            label="Reduced motion"
            description="Minimize animations across the app"
            checked={reducedMotion}
            onChange={(v) => { setReducedMotion(v); toast.info(v ? 'Reduced motion on' : 'Reduced motion off'); }}
          />
        </GlassCard>

        {/* Notifications & sound */}
        <GlassCard className="p-4 sm:p-6">
          <h2 className="font-display text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <Bell size={18} className="text-accent-blue shrink-0" /> Notifications
          </h2>
          <Toggle icon={Bell} label="Push notifications" description="Daily challenge reminders" checked={notifications} onChange={setNotifications} />
          <Toggle icon={Volume2} label="Sound effects" description="Play sounds on game events" checked={sounds} onChange={setSounds} />
        </GlassCard>

        {/* Account */}
        <GlassCard className="p-4 sm:p-6">
          <h2 className="font-display text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <User size={18} className="text-accent-purple shrink-0" /> Account
          </h2>
          <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
            <div className="flex justify-between items-center"><span className="text-slate-400">Username</span><span className="font-medium truncate ml-2">{username}</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-400">Email</span><span className="font-medium truncate ml-2">{email}</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-400">Member since</span><span className="font-medium ml-2">{memberSince}</span></div>
            <div className="flex justify-between items-center"><span className="text-slate-400">Level</span><span className="font-medium ml-2">{profile?.level || 1}</span></div>
          </div>
          <div className="mt-4">
            <Button variant="danger" size="sm" onClick={handleSignOut} className="w-full sm:w-auto">
              <LogOut size={15} /> Sign out
            </Button>
          </div>
        </GlassCard>

        {/* Privacy */}
        <GlassCard className="p-4 sm:p-6">
          <h2 className="font-display text-base sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
            <Shield size={18} className="text-emerald-500 shrink-0" /> Privacy
          </h2>
          <Toggle icon={Globe} label="Show on leaderboard" description="Appear in global rankings" checked={true} onChange={() => toast.info('Leaderboard visibility is always on in this demo')} />
          <Toggle icon={User} label="Public profile" description="Let others view your profile" checked={true} onChange={() => toast.info('Profile visibility is always on in this demo')} />
        </GlassCard>
      </div>
    </div>
  );
}
