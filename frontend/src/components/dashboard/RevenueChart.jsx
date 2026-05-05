'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MOCK = [
  { month: 'يناير', revenue: 1200 }, { month: 'فبراير', revenue: 1800 },
  { month: 'مارس',  revenue: 1400 }, { month: 'أبريل',  revenue: 2200 },
  { month: 'مايو',  revenue: 1900 }, { month: 'يونيو', revenue: 2800 },
  { month: 'يوليو', revenue: 3100 }, { month: 'أغسطس', revenue: 2700 },
];

export default function RevenueChart({ data = MOCK }) {
  return (
    <div className="ha-card p-4">
      <h6 style={{fontFamily:'Amiri,serif',fontSize:'1.15rem',marginBottom:20}}>
        <i className="bi bi-graph-up-arrow me-2 text-burgundy"/>الإيرادات الشهرية
      </h6>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{top:4,right:8,left:-10,bottom:0}}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#7A1C2E" stopOpacity={0.25}/>
              <stop offset="95%" stopColor="#7A1C2E" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(196,184,154,0.3)"/>
          <XAxis dataKey="month" tick={{fontSize:11,fill:'#6B5E52'}} axisLine={false} tickLine={false}/>
          <YAxis tick={{fontSize:11,fill:'#6B5E52'}} axisLine={false} tickLine={false}/>
          <Tooltip
            contentStyle={{borderRadius:10,border:'1px solid var(--gold-pale)',fontFamily:'Tajawal,sans-serif'}}
            formatter={(v) => [`${v} د.أ`, 'الإيراد']}
          />
          <Area type="monotone" dataKey="revenue" stroke="#7A1C2E" strokeWidth={2}
            fill="url(#revGrad)" dot={{fill:'#7A1C2E',r:3}} activeDot={{r:5}}/>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
