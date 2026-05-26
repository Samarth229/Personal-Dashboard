import { PieChart as RePieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#16a34a', '#d97706', '#c2410c', '#0f766e', '#60a5fa', '#a78bfa', '#f87171'];

const CustomTooltip = ({ active, payload, unit }) => {
  if (!active || !payload?.length) return null;
  const { name, value } = payload[0];
  return (
    <div style={{ background: 'rgba(15,15,25,0.9)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 10, padding: '6px 12px' }}>
      <p className="text-xs">
        <span style={{ color: '#fff', fontWeight: 600 }}>{name}</span>
        <span style={{ color: 'rgba(255,255,255,0.55)' }}> — {value}{unit ?? ''}</span>
      </p>
    </div>
  );
};

const PieChartComponent = ({ data, dataKey = 'value', nameKey = 'name', height = 200, unit = '%', hideLegend = false }) => (
  <ResponsiveContainer width="100%" height={height}>
    <RePieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
      <Pie
        data={data}
        dataKey={dataKey}
        nameKey={nameKey}
        cx="50%"
        cy={hideLegend ? '50%' : '45%'}
        outerRadius={hideLegend ? '72%' : 55}
        innerRadius={hideLegend ? '30%' : 20}
        paddingAngle={3}
      >
        {data.map((_, i) => (
          <Cell key={i} fill={COLORS[i % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip content={<CustomTooltip unit={unit} />} />
      {!hideLegend && (
        <Legend
          iconType="circle"
          iconSize={7}
          wrapperStyle={{ fontSize: '11px', paddingTop: '4px' }}
          formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.45)' }}>{value}</span>}
        />
      )}
    </RePieChart>
  </ResponsiveContainer>
);

export default PieChartComponent;
