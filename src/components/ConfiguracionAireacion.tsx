import { useState } from 'react';
import { useCamaroneraStore } from '../store/useCamaroneraStore';
import InfoTip from './InfoTip';

const INTERVALOS = [2, 4, 8];

export default function ConfiguracionAireacion() {
  const horarioGeneral = useCamaroneraStore((s) => s.horarioGeneral);
  const aplicarHorarioATodas = useCamaroneraStore((s) => s.aplicarHorarioATodas);
  const intervaloSecuencialSeg = useCamaroneraStore((s) => s.intervaloSecuencialSeg);
  const setIntervaloSecuencial = useCamaroneraStore((s) => s.setIntervaloSecuencial);

  const [ini, fin] = horarioGeneral.split('-');
  const [iniLocal, setIniLocal] = useState(ini || '06:00');
  const [finLocal, setFinLocal] = useState(fin || '22:00');

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-panel-border bg-panel px-4 py-2 text-xs">
      <InfoTip text="Aplica el mismo horario de encendido a TODAS las piscinas de una vez. Para una piscina individual, edita su horario directamente en su panel (sección Aireación).">
        <span className="text-ink-500">Horario general</span>
      </InfoTip>
      <input
        type="time"
        value={iniLocal}
        onChange={(e) => setIniLocal(e.target.value)}
        className="rounded border border-panel-border bg-deep-800 px-1.5 py-0.5 font-mono text-ink-100 focus:outline-none focus:ring-1 focus:ring-water-500"
      />
      <span className="text-ink-500">–</span>
      <input
        type="time"
        value={finLocal}
        onChange={(e) => setFinLocal(e.target.value)}
        className="rounded border border-panel-border bg-deep-800 px-1.5 py-0.5 font-mono text-ink-100 focus:outline-none focus:ring-1 focus:ring-water-500"
      />
      <button
        onClick={() => aplicarHorarioATodas(`${iniLocal}-${finLocal}`)}
        className="rounded border border-water-600/40 px-2 py-0.5 text-water-400 hover:bg-water-600/10"
      >
        Aplicar a todas
      </button>

      <span className="mx-1 h-4 w-px bg-panel-border" />

      <InfoTip text="Pausa entre el encendido de cada aireador cuando se prenden varios a la vez (manual con 'Encender todos', o automático por horario). Evita el pico de corriente de arrancar todos los motores al mismo tiempo.">
        <span className="text-ink-500">Encendido secuencial cada</span>
      </InfoTip>
      <div className="flex gap-1">
        {INTERVALOS.map((s) => (
          <button
            key={s}
            onClick={() => setIntervaloSecuencial(s)}
            className={`rounded border px-2 py-0.5 ${
              intervaloSecuencialSeg === s
                ? 'border-water-500 bg-water-600/15 text-water-400'
                : 'border-panel-border text-ink-300 hover:border-ink-500'
            }`}
          >
            {s}s
          </button>
        ))}
      </div>
    </div>
  );
}
