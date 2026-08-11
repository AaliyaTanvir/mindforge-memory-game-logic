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
    <div className="flex items-center justify-between py-3 border-b border-slate-200/40 dark:border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        {Icon && <Icon size={18} className="text-slate-400" />}
        <div>
          <p className="font-medium text-sm">{label}</p>
          {description && <p className="text-xs text-slate-400">{description}</p>}
        </div>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${checked ? 'gradient-btn' : 'bg-slate-300 dark:bg-slate-700'}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : ''}`}
        />
      </button>
    </div>
  );
}

export default function Settings() {
  const { profile, signOut } = useAuth();
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold flex items-center gap-2">
          <SettingsIcon className="text-slate-500" /> Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Customize your MindForge experience.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Appearance */}
        <GlassCard className="p-6">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Sun size={18} className="text-amber-500" /> Appearance
          </h2>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${theme === 'light' ? 'border-accent-purple bg-accent-purple/10' : 'border-slate-200 dark:border-slate-700'}`}
            >
              <Sun size={22} className="text-amber-500" />
              <span className="text-sm font-medium">Light</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${theme === 'dark' ? 'border-accent-purple bg-accent-purple/10' : 'border-slate-200 dark:border-slate-700'}`}
            >
              <Moon size={22} className="text-accent-blue" />
              <span className="text-sm font-medium">Dark</span>
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
        <GlassCard className="p-6">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Bell size={18} className="text-accent-blue" /> Notifications
          </h2>
          <Toggle icon={Bell} label="Push notifications" description="Daily challenge reminders" checked={notifications} onChange={setNotifications} />
          <Toggle icon={Volume2} label="Sound effects" description="Play sounds on game events" checked={sounds} onChange={setSounds} />
        </GlassCard>

        {/* Account */}
        <GlassCard className="p-6">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <User size={18} className="text-accent-purple" /> Account
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">Username</span><span className="font-medium">{profile?.username || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Email</span><span className="font-medium">{profile?.email || '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Member since</span><span className="font-medium">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '-'}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Level</span><span className="font-medium">{profile?.level || 1}</span></div>
          </div>
          <div className="mt-4">
            <Button variant="danger" onClick={handleSignOut}>
              <LogOut size={16} /> Sign out
            </Button>
          </div>
        </GlassCard>

        {/* Privacy */}
        <GlassCard className="p-6">
          <h2 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
            <Shield size={18} className="text-emerald-500" /> Privacy
          </h2>
          <Toggle icon={Globe} label="Show on leaderboard" description="Appear in global rankings" checked={true} onChange={() => toast.info('Leaderboard visibility is always on in this demo')} />
          <Toggle icon={User} label="Public profile" description="Let others view your profile" checked={true} onChange={() => toast.info('Profile visibility is always on in this demo')} />
        </GlassCard>
      </div>
    </div>
  );
}
