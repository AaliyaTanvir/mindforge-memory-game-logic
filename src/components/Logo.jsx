import { Link } from 'react-router-dom';

// Logo mark used on auth pages and landing.
export default function Logo({ size = 'md', withText = true }) {
  const dims = { sm: 'w-8 h-8', md: 'w-10 h-10', lg: 'w-14 h-14' };
  const iconSize = { sm: 18, md: 22, lg: 30 };
  const textSize = { sm: 'text-lg', md: 'text-xl', lg: 'text-3xl' };

  return (
    <Link to="/" className="inline-flex items-center gap-2.5">
      <div
        className={`${dims[size]} rounded-2xl gradient-btn flex items-center justify-center shadow-lg shadow-accent-purple/30`}
        style={{ boxShadow: '0 8px 30px rgba(139,92,246,0.35)' }}
      >
        <svg width={iconSize[size]} height={iconSize[size]} viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3c-1.5 0-2.8.7-3.7 1.8C7.5 4.3 6.3 4 5 4 2.8 4 1 5.8 1 8c0 1.2.5 2.3 1.4 3C1.5 11.7 1 12.8 1 14c0 2.2 1.8 4 4 4 1.3 0 2.5-.5 3.3-1.3C9.2 17.8 10.5 18.5 12 18.5s2.8-.7 3.7-1.8c.8.8 2 1.3 3.3 1.3 2.2 0 4-1.8 4-4 0-1.2-.5-2.3-1.4-3 .9-.7 1.4-1.8 1.4-3 0-2.2-1.8-4-4-4-1.3 0-2.5.3-3.3 1.2C14.8 3.7 13.5 3 12 3Z"
            fill="white"
            fillOpacity="0.95"
          />
          <path d="M9 11h6M12 8v6" stroke="#a855f7" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </div>
      {withText && (
        <span className={`font-display ${textSize[size]} font-bold gradient-text`}>MindForge</span>
      )}
    </Link>
  );
}
