import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs shadow-xl"
      style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="font-semibold text-white">{payload[0].value?.toLocaleString()}{unit ?? ''}</p>
    </div>
  );
};

const AreaChartComponent = ({
  data, dataKey = 'value', xKey = 'date',
  color = '#16a34a', height = 160, unit = '', gradient = true,
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
      <defs>
        <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.3} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
      <XAxis dataKey={xKey} tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fontSize: 10, fill: '#6b7280' }} axisLine={false} tickLine={false} />
      <Tooltip content={<CustomTooltip unit={unit} />} />
      <Area
        type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2}
        fill={gradient ? `url(#grad-${color.replace('#', '')})` : 'none'}
        dot={false} activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
      />
    </AreaChart>
  </ResponsiveContainer>
);

export default AreaChartComponent;
