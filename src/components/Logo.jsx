import { Link } from 'react-router-dom';

// Logo mark used on auth pages and landing.
export default function Logo({ size = 'md', withText = true, to = '/' }) {
  const dims = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-14 h-14' };
  const textSize = { sm: 'text-lg', md: 'text-xl', lg: 'text-3xl' };

  return (
    <Link to={to} className="inline-flex items-center gap-2.5">
      <div
        className={`${dims[size]} rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-accent-purple/30 overflow-hidden`}
        style={{ boxShadow: '0 8px 30px rgba(139,92,246,0.35)' }}
      >
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
          <defs>
            <linearGradient id="mf-logo-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <filter id="mf-logo-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#8b5cf6" floodOpacity="0.4" />
            </filter>
          </defs>
          <rect width="64" height="64" rx="16" fill="url(#mf-logo-grad)" />
          <g filter="url(#mf-logo-glow)">
            <path
              d="M32 12c-3.8 0-7 1.8-9.2 4.5C20.8 15.3 17.8 14.5 14.5 14.5 9 14.5 4.5 19 4.5 24.5c0 3 1.2 5.8 3.5 7.5-2.3 1.8-3.5 4.5-3.5 7.5 0 5.5 4.5 10 10 10 3.3 0 6.3-.8 8.3-2 2.2 2.7 5.4 4.5 9.2 4.5s7-1.8 9.2-4.5c2 1.2 5 2 8.3 2 5.5 0 10-4.5 10-10 0-3-1.2-5.7-3.5-7.5 2.3-1.7 3.5-4.5 3.5-7.5 0-5.5-4.5-10-10-10-3.3 0-6.3.8-8.3 2C39 13.8 35.8 12 32 12Z"
              fill="#ffffff"
              fillOpacity="0.95"
            />
            <path
              d="M24 32h16M32 24v16"
              stroke="#8b5cf6"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="24" cy="32" r="2.2" fill="#3b82f6" />
            <circle cx="40" cy="32" r="2.2" fill="#ec4899" />
            <circle cx="32" cy="24" r="2.2" fill="#3b82f6" />
            <circle cx="32" cy="40" r="2.2" fill="#ec4899" />
          </g>
        </svg>
      </div>
      {withText && (
        <span className={`font-display ${textSize[size]} font-bold gradient-text`}>MindForge</span>
      )}
    </Link>
  );
}
