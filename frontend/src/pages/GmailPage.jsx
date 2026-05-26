import { Link } from 'react-router-dom';
import DashboardLayout from '../components/Shared/DashboardLayout';
import { useGmail } from '../hooks/useServiceData';
import { CardSkeleton } from '../components/Shared/Loading';
import { fmtNumber } from '../utils/formatters';
import { SERVICE_COLORS } from '../utils/colors';
import { GmailScene } from '../components/Three/ServiceScenes';

const C = SERVICE_COLORS.gmail;
const T = { primary: 'rgba(255,255,255,0.92)', secondary: 'rgba(255,255,255,0.6)', muted: 'rgba(255,255,255,0.4)' };

const GmailPage = () => {
  const { data, isLoading } = useGmail();
  const stats      = data?.stats;
  const topSenders = data?.topSenders || [];

  return (
    <DashboardLayout scene={<GmailScene />}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium mb-1" style={{ color: C.text }}>Email overview</p>
          <h1 className="text-3xl font-bold text-white tracking-tight" style={{ letterSpacing: '-0.03em', textShadow: '0 2px 16px rgba(0,0,0,0.6)' }}>
            Gmail
          </h1>
        </div>
        {stats
          ? <span className="badge-connected">Connected</span>
          : <Link to="/settings" className="btn-primary text-xs px-4 py-2">Connect</Link>}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4"><CardSkeleton /><CardSkeleton /></div>
      ) : !stats ? (
        <div className="mt-10 flex flex-col items-center justify-center text-center gap-4">
          <p className="font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Gmail not connected</p>
          <Link to="/settings" className="btn-primary text-sm">Connect in Settings →</Link>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <BigStat label="Unread"         value={fmtNumber(stats.unreadCount)}    accent={C.text} floatClass="float-1" />
            <BigStat label="Total messages" value={fmtNumber(stats.totalMessages)}                  floatClass="float-2" />
            <BigStat label="Top senders"    value={topSenders.length}                               floatClass="float-3" />
            <BigStat label="Inbox health"   value={stats.unreadCount > 100 ? '⚠️' : '✓'}           floatClass="float-4" />
          </div>

          {topSenders.length > 0 && (
            <div className="card-glass float-5">
              <p className="section-title">Top Senders</p>
              <div className="space-y-2.5">
                {topSenders.slice(0, 10).map((sender, i) => {
                  const pct = Math.round((sender.count / topSenders[0].count) * 100);
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
                        style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.text }}>
                        {sender.email?.[0]?.toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate" style={{ color: T.secondary }}>{sender.email}</p>
                        <div className="mt-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: C.primary }} />
                        </div>
                      </div>
                      <span className="text-xs flex-shrink-0" style={{ color: T.muted }}>{sender.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

const BigStat = ({ label, value, accent, floatClass = '' }) => (
  <div className={`card-glass text-center ${floatClass}`} style={{ padding: 20 }}>
    <p className="text-2xl font-bold" style={{ color: accent || 'rgba(255,255,255,0.92)' }}>{value}</p>
    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
  </div>
);

export default GmailPage;
