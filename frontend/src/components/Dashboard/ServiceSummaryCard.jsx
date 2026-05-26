import { Link } from 'react-router-dom';
import { SERVICE_COLORS } from '../../utils/colors';

const ServiceSummaryCard = ({ service, connected, title, subtitle, stats = [], icon: Icon, floatClass = '' }) => {
  const color = SERVICE_COLORS[service] || SERVICE_COLORS.github;

  return (
    <Link to={`/${service}`} className={`block group ${floatClass}`}>
      <div className="card-glass transition-all duration-300 group-hover:scale-[1.02] group-hover:border-white/20"
        style={{ borderRadius: 22, padding: 20 }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: color.bg, border: `1px solid ${color.border}` }}>
              <Icon className="w-4 h-4" style={{ color: color.text }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.92)' }}>{title}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{subtitle}</p>
            </div>
          </div>
          {connected
            ? <span className="badge-connected">Connected</span>
            : <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 999, background: 'transparent', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.15)', fontWeight: 500 }}>Connect</span>}
        </div>

        {connected && stats.length > 0 && (
          <div className={`grid gap-2 ${stats.length >= 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {stats.map(({ label, value }) => (
              <div key={label} className="text-center py-2 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-base font-bold truncate" style={{ color: 'rgba(255,255,255,0.92)' }}>{value}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {!connected && (
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Click to connect and see your data</p>
        )}
      </div>
    </Link>
  );
};

export default ServiceSummaryCard;
