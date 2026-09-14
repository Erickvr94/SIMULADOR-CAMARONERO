import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { PuntoHistorico } from '../models/types';

function MiniChart({
  data,
  dataKey,
  color,
  unidad,
}: {
  data: PuntoHistorico[];
  dataKey: keyof PuntoHistorico;
  color: string;
  unidad: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={110}>
      <LineChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
        <XAxis
          dataKey="dia"
          tick={{ fontSize: 10, fill: '#7C9992' }}
          stroke="#1E3733"
          label={{ value: 'día', position: 'insideBottomRight', fontSize: 9, fill: '#4A615C', offset: -2 }}
        />
        <YAxis tick={{ fontSize: 10, fill: '#7C9992' }} stroke="#1E3733" width={34} />
        <Tooltip
          contentStyle={{ background: '#0C1917', border: '1px solid #1E3733', borderRadius: 6, fontSize: 11 }}
          labelStyle={{ color: '#7C9992' }}
          formatter={(value: number) => [`${value} ${unidad}`, undefined]}
          labelFormatter={(d) => `Día ${d}`}
        />
        <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default function HistorialChart({ historial }: { historial: PuntoHistorico[] }) {
  if (historial.length < 2) {
    return (
      <p className="py-2 text-xs text-ink-500">
        Avanza al menos un par de días para empezar a ver la gráfica de avances.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="mb-0.5 text-[10px] uppercase tracking-wide text-ink-500">Peso promedio (g)</p>
        <MiniChart data={historial} dataKey="peso" color="#2DD4BF" unidad="g" />
      </div>
      <div>
        <p className="mb-0.5 text-[10px] uppercase tracking-wide text-ink-500">Oxígeno disuelto (mg/L)</p>
        <MiniChart data={historial} dataKey="oxigeno" color="#5EEAD4" unidad="mg/L" />
      </div>
      <div>
        <p className="mb-0.5 text-[10px] uppercase tracking-wide text-ink-500">Supervivencia (%)</p>
        <MiniChart data={historial} dataKey="supervivencia" color="#E8A33D" unidad="%" />
      </div>
    </div>
  );
}
