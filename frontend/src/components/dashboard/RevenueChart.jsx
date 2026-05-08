'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenueChart({ data = [] }) {
  const chartData = Array.isArray(data) ? data : [];
  const xKey = chartData[0]?.label ? 'label' : 'month';

  return (
    <div className="ha-card p-4">
      <h6 style={{ fontFamily: 'Amiri,serif', fontSize: '1.15rem', marginBottom: 20 }}>
        <i className="bi bi-graph-up-arrow me-2 text-burgundy" />
        الإيرادات الشهرية
      </h6>

      {chartData.length === 0 ? (
        <div className="d-flex align-items-center justify-content-center text-center" style={{ height: 220, color: 'var(--warm-gray)', fontSize: '0.9rem' }}>
          لا توجد بيانات كافية لعرض الرسم بعد
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7A1C2E" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#7A1C2E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,184,154,0.3)" />
            <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: '#6B5E52' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#6B5E52' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: 10, border: '1px solid var(--gold-pale)', fontFamily: 'Tajawal,sans-serif' }}
              formatter={(value) => [`${value} د.أ`, 'الإيراد']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#7A1C2E"
              strokeWidth={2}
              fill="url(#revGrad)"
              dot={{ fill: '#7A1C2E', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
