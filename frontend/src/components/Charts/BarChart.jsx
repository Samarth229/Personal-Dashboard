import { BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 text-xs shadow-xl"
      style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.1)' }}>
      <p className="text-gray-400 mb-1">{label}</p>
      <p className="font-semibold text-white">{payload[0].value?.toLocaleString()}</p>
    </div>
  );
};

const BarChartComponent = ({ data, dataKey, xKey = 'name', color = '#16a34a', height = 200 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <ReBarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
      <XAxis dataKey={xKey} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
      <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
      <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
      <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]}
        fillOpacity={0.85} />
    </ReBarChart>
  </ResponsiveContainer>
);

export default BarChartComponent;
