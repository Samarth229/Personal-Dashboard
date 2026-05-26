import { useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useSpotify, useGitHub, useGmail, useLetterboxd, useSteam, useRiot } from '../../hooks/useServiceData';
import ServiceSummaryCard from './ServiceSummaryCard';
import { fmtNumber } from '../../utils/formatters';

const SpotifyIcon  = ({ className, style }) => (<svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>);
const GitHubIcon   = ({ className, style }) => (<svg className={className} style={style} fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>);
const MailIcon     = ({ className, style }) => (<svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>);
const FilmIcon     = ({ className, style }) => (<svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>);
const GamepadIcon  = ({ className, style }) => (<svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a1 1 0 01-1-1V8a1 1 0 011-1h1a2 2 0 100-4H4a1 1 0 01-1-1V5a1 1 0 011-1h3a1 1 0 001-1z" /></svg>);
const SwordIcon    = ({ className, style }) => (<svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" /></svg>);

/* ─── Free-floating bounce physics ───────────────────────────────────── */
const CARD_W   = 280;
const CARD_H   = 122;
const GAP      = 8;   // minimum gap between cards
const SPD_MIN  = 0.07;
const SPD_MAX  = 0.14;

const FloatingField = ({ items }) => {
  const containerRef = useRef(null);
  const cardRefs     = useRef([]);
  const rafRef       = useRef(null);
  const stateRef     = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !items?.length) return;

    const N  = items.length;
    const cW = container.clientWidth;
    const cH = container.clientHeight;

    const randSpd = () => SPD_MIN + Math.random() * (SPD_MAX - SPD_MIN);

    // Spread initial positions in a loose grid so cards start separated
    stateRef.current = Array.from({ length: N }, (_, i) => {
      const cols = Math.ceil(Math.sqrt(N));
      const col  = i % cols;
      const row  = Math.floor(i / cols);
      const x    = (col + 0.5) * (cW / cols) - CARD_W / 2 + (Math.random() - 0.5) * 60;
      const y    = (row + 0.5) * (cH / Math.ceil(N / cols)) - CARD_H / 2 + (Math.random() - 0.5) * 60;
      const angle = Math.random() * Math.PI * 2;
      const spd   = randSpd();
      return {
        x: Math.max(0, Math.min(cW - CARD_W, x)),
        y: Math.max(0, Math.min(cH - CARD_H, y)),
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
      };
    });

    let lastTime   = performance.now();
    let nudgeAccum = 0;

    const tick = (now) => {
      const dt = Math.min(now - lastTime, 50);
      lastTime  = now;
      nudgeAccum += dt;
      const s  = stateRef.current;
      const W  = container.clientWidth;
      const H  = container.clientHeight;

      /* 1 — Occasional gentle direction nudge (keeps motion feeling random) */
      if (nudgeAccum > 4000) {
        nudgeAccum = 0;
        for (let i = 0; i < N; i++) {
          if (Math.random() < 0.5) {
            const spd   = Math.hypot(s[i].vx, s[i].vy);
            const angle = Math.atan2(s[i].vy, s[i].vx) + (Math.random() - 0.5) * Math.PI * 0.7;
            s[i].vx = Math.cos(angle) * spd;
            s[i].vy = Math.sin(angle) * spd;
          }
        }
      }

      /* 2 — Move */
      for (let i = 0; i < N; i++) {
        s[i].x += s[i].vx * dt;
        s[i].y += s[i].vy * dt;
      }

      /* 3 — Wall bounce */
      for (let i = 0; i < N; i++) {
        if (s[i].x < 0)        { s[i].x = 0;        s[i].vx =  Math.abs(s[i].vx); }
        if (s[i].x > W - CARD_W) { s[i].x = W - CARD_W; s[i].vx = -Math.abs(s[i].vx); }
        if (s[i].y < 0)        { s[i].y = 0;        s[i].vy =  Math.abs(s[i].vy); }
        if (s[i].y > H - CARD_H) { s[i].y = H - CARD_H; s[i].vy = -Math.abs(s[i].vy); }
      }

      /* 4 — Card–card elastic collision (swap velocity component on the
             collision axis; stateless so no buildup, no teleporting) */
      for (let pass = 0; pass < 3; pass++) {
        for (let i = 0; i < N; i++) {
          for (let j = i + 1; j < N; j++) {
            const ox = CARD_W + GAP - Math.abs(s[i].x - s[j].x);
            const oy = CARD_H + GAP - Math.abs(s[i].y - s[j].y);
            if (ox > 0 && oy > 0) {
              if (ox <= oy) {
                // Horizontal collision — separate + swap vx
                const half = ox / 2;
                if (s[i].x < s[j].x) { s[i].x -= half; s[j].x += half; }
                else                  { s[i].x += half; s[j].x -= half; }
                const tmp = s[i].vx; s[i].vx = s[j].vx; s[j].vx = tmp;
              } else {
                // Vertical collision — separate + swap vy
                const half = oy / 2;
                if (s[i].y < s[j].y) { s[i].y -= half; s[j].y += half; }
                else                  { s[i].y += half; s[j].y -= half; }
                const tmp = s[i].vy; s[i].vy = s[j].vy; s[j].vy = tmp;
              }
            }
          }
        }
      }

      /* 5 — Apply transforms */
      for (let i = 0; i < N; i++) {
        const el = cardRefs.current[i];
        if (el) el.style.transform = `translate(${Math.round(s[i].x)}px, ${Math.round(s[i].y)}px)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: 'calc(100vh - 130px)', minHeight: 520 }}>
      {items.map((item, i) => (
        <div
          key={i}
          ref={el => { cardRefs.current[i] = el; }}
          style={{ position: 'absolute', top: 0, left: 0, width: CARD_W, willChange: 'transform' }}
        >
          {item}
        </div>
      ))}
    </div>
  );
};

/* ─── Overview ─────────────────────────────────────────────────────────── */
const Overview = () => {
  const qc = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: sources = [] } = useQuery({
    queryKey: ['data-sources'],
    queryFn: () => api.get('/data-sources').then((r) => r.data.sources || []),
    staleTime: 30 * 1000,
  });

  const { data: spotify }    = useSpotify();
  const { data: github }     = useGitHub();
  const { data: gmail }      = useGmail();
  const { data: letterboxd } = useLetterboxd();
  const { data: steam }      = useSteam();
  const { data: riot }       = useRiot();

  useEffect(() => {
    const connected = searchParams.get('connected');
    if (connected) {
      ['data-sources','overview','spotify','github','gmail','letterboxd','steam','riot'].forEach(
        (key) => qc.invalidateQueries({ queryKey: [key] })
      );
      setSearchParams({}, { replace: true });
    }
  }, []);

  const isConnected    = (id) => sources.find((s) => s.source_name === id)?.is_enabled;
  const connectedCount = sources.filter((s) => s.is_enabled).length;

  const spotifyStats    = spotify?.topArtists?.length ? [{ label: 'Top artist', value: spotify.topArtists[0]?.name?.split(' ')[0] ?? '—' }, { label: 'Top tracks', value: spotify.topTracks?.length ?? 0 }] : [];
  const githubStats     = github?.profile   ? [{ label: 'Repos', value: github.profile.public_repos ?? 0 }, { label: 'Commits', value: github.contributions?.commitCount ?? 0 }] : [];
  const gmailStats      = gmail?.stats      ? [{ label: 'Unread', value: fmtNumber(gmail.stats.unreadCount) }, { label: 'Total', value: fmtNumber(gmail.stats.totalMessages) }] : [];
  const letterboxdStats = letterboxd?.stats ? [{ label: 'Films', value: letterboxd.stats.recentCount ?? 0 }, { label: 'Avg rating', value: letterboxd.stats.averageRating ?? '—' }] : [];
  const steamStats      = steam?.stats      ? [{ label: 'Games', value: steam.stats.totalGames ?? 0 }, { label: 'Hours', value: fmtNumber(steam.stats.totalPlaytimeHours) }] : [];
  const riotStats       = riot?.stats       ? [{ label: 'Rank', value: riot.stats.soloRank ?? 'Unranked' }, { label: 'Win rate', value: `${riot.stats.recentWinRate ?? 0}%` }] : [];

  const cards = [
    <ServiceSummaryCard service="spotify"    icon={SpotifyIcon} title="Spotify"    subtitle="Music"             connected={isConnected('spotify')}    stats={spotifyStats}    />,
    <ServiceSummaryCard service="github"     icon={GitHubIcon}  title="GitHub"     subtitle="Code activity"     connected={isConnected('github')}     stats={githubStats}     />,
    <ServiceSummaryCard service="gmail"      icon={MailIcon}    title="Gmail"      subtitle="Email"             connected={isConnected('gmail')}      stats={gmailStats}      />,
    <ServiceSummaryCard service="letterboxd" icon={FilmIcon}    title="Letterboxd" subtitle="Movies"            connected={isConnected('letterboxd')} stats={letterboxdStats} />,
    <ServiceSummaryCard service="steam"      icon={GamepadIcon} title="Steam"      subtitle="Gaming"            connected={isConnected('steam')}      stats={steamStats}      />,
    <ServiceSummaryCard service="riot"       icon={SwordIcon}   title="Riot Games" subtitle="League of Legends" connected={isConnected('riot')}       stats={riotStats}       />,
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-2 text-xs mb-3" style={{ color: '#aeaeb2' }}>
        <div className="w-1.5 h-1.5 rounded-full" style={{ background: connectedCount > 0 ? '#34c759' : '#d2d2d7' }} />
        {connectedCount} service{connectedCount !== 1 ? 's' : ''} connected
      </div>
      <FloatingField items={cards} />
    </div>
  );
};

export default Overview;
