import { LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LineChartComponent = ({ data, dataKey, xKey = 'date', color = '#16a34a', height = 200 }) => (
  <ResponsiveContainer width="100%" height={height}>
    <ReLineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
      <XAxis dataKey={xKey} tick={{ fill: '#6b7280', fontSize: 12 }} />
      <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} width={40} />
      <Tooltip
        contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#f9fafb' }}
      />
      <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
    </ReLineChart>
  </ResponsiveContainer>
);

export default LineChartComponent;
