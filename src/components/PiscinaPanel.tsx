import { useState } from 'react';
import type { Piscina } from '../models/types';
import { useCamaroneraStore } from '../store/useCamaroneraStore';
import InfoTip from './InfoTip';

const etiquetaFase: Record<Piscina['faseCultivo'], string> = {
  siembra: 'Siembra',
  crecimiento: 'Crecimiento',
  engorde: 'Engorde',
  cosecha: 'Cosecha',
};

function Dato({ label, value, unit, info }: { label: string; value: string | number; unit?: string; info: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-panel-border/60 py-2">
      <InfoTip text={info}>
        <span className="text-xs text-ink-500">{label}</span>
      </InfoTip>
      <span className="font-mono text-sm text-ink-100">
        {value}
        {unit && <span className="ml-1 text-ink-500">{unit}</span>}
      </span>
    </div>
  );
}

export default function PiscinaPanel({ piscina }: { piscina: Piscina | null }) {
  const setModo = useCamaroneraStore((s) => s.setModo);
  const eliminarAireador = useCamaroneraStore((s) => s.eliminarAireador);
  const renombrarPiscina = useCamaroneraStore((s) => s.renombrarPiscina);
  const cambiarEstadoAireador = useCamaroneraStore((s) => s.cambiarEstadoAireador);
  const cambiarEstadoTodosAireadores = useCamaroneraStore((s) => s.cambiarEstadoTodosAireadores);

  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nombreTemp, setNombreTemp] = useState('');

  if (!piscina) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg border border-panel-border bg-panel p-6 text-center text-sm text-ink-500">
        Selecciona una piscina en el mapa para ver sus parámetros
      </div>
    );
  }

  const { ambientales, productivos, aireacion } = piscina;

  const guardarNombre = () => {
    if (nombreTemp.trim()) renombrarPiscina(piscina.id, nombreTemp.trim());
    setEditandoNombre(false);
  };

  return (
    <div className="h-full overflow-y-auto rounded-lg border border-panel-border bg-panel p-5">
      <div className="mb-4 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          {editandoNombre ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={nombreTemp}
                onChange={(e) => setNombreTemp(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && guardarNombre()}
                className="w-full rounded border border-water-500 bg-deep-800 px-1.5 py-0.5 font-display text-sm text-ink-100 focus:outline-none"
              />
              <button onClick={guardarNombre} className="text-xs text-water-400 hover:text-water-300">
                ✓
              </button>
              <button onClick={() => setEditandoNombre(false)} className="text-xs text-ink-500 hover:text-alert">
                ✕
              </button>
            </div>
          ) : (
            <h2
              className="cursor-pointer font-display text-lg font-semibold text-ink-100 hover:text-water-400"
              onClick={() => {
                setNombreTemp(piscina.nombre);
                setEditandoNombre(true);
              }}
              title="Clic para renombrar"
            >
              {piscina.nombre} <span className="text-xs text-ink-700">✎</span>
            </h2>
          )}
          <p className="text-xs text-ink-500">
            {etiquetaFase[piscina.faseCultivo]} · día {piscina.diaCiclo} · {piscina.areaHa} ha
          </p>
        </div>
        <span
          className={`ml-2 shrink-0 rounded px-2 py-0.5 text-[11px] font-medium ${
            piscina.estadoEquipo === 'ok'
              ? 'bg-water-600/15 text-water-400'
              : piscina.estadoEquipo === 'advertencia'
                ? 'bg-warn/15 text-warn'
                : 'bg-alert/15 text-alert'
          }`}
        >
          {piscina.estadoEquipo === 'ok' ? 'Normal' : piscina.estadoEquipo === 'advertencia' ? 'Advertencia' : 'Falla'}
        </span>
      </div>

      <section className="mb-4">
        <h3 className="mb-1 font-display text-xs font-semibold uppercase tracking-wide text-water-500">
          Ambientales
        </h3>
        <Dato
          label="Temperatura del agua"
          value={ambientales.temperatura}
          unit="°C"
          info="Temperatura del AGUA de la piscina (no del aire). Es distinta a la del clima de arriba. Afecta el metabolismo del camarón y cuánta cantidad de oxígeno puede disolver el agua: agua más caliente retiene menos oxígeno."
        />
        <Dato
          label="Salinidad"
          value={ambientales.salinidad}
          unit="ppt"
          info="Concentración de sal en el agua, en partes por mil. El camarón blanco tolera un rango amplio (~5-35 ppt), pero cambios bruscos generan estrés."
        />
        <Dato
          label="pH"
          value={ambientales.ph}
          info="Acidez/alcalinidad del agua. Rango ideal para camarón: 7.5-8.5. Fuera de ese rango afecta la muda y la absorción de minerales."
        />
        <Dato
          label="Oxígeno disuelto"
          value={ambientales.oxigeno}
          unit="mg/L"
          info="Oxígeno disponible en el agua para el camarón. Por debajo de ~3-4 mg/L hay estrés; por debajo de 2 mg/L hay riesgo de mortalidad. Es el parámetro que más depende de la aireación."
        />
        <Dato
          label="Turbidez"
          value={ambientales.turbidez}
          unit="cm"
          info="Profundidad del disco Secchi: hasta dónde se ve el agua. Indica densidad de plancton/algas. Muy transparente (>60cm) o muy turbia (<20cm) son señales de alerta."
        />
      </section>

      <section className="mb-4">
        <h3 className="mb-1 font-display text-xs font-semibold uppercase tracking-wide text-water-500">
          Productivos
        </h3>
        <Dato
          label="Densidad"
          value={productivos.densidad}
          unit="cam/m²"
          info="Cuántos camarones se sembraron por metro cuadrado. Mayor densidad = más producción potencial pero más riesgo (menos oxígeno por camarón, más competencia por alimento)."
        />
        <Dato
          label="Peso promedio"
          value={productivos.peso}
          unit="g"
          info="Peso promedio actual de un camarón en esta piscina, estimado por muestreo. Va subiendo con los días de cultivo."
        />
        <Dato
          label="Biomasa"
          value={productivos.biomasa}
          unit="kg"
          info="Peso total estimado de todos los camarones vivos en la piscina (peso promedio × población estimada). Es la base para calcular cuánto alimento dar."
        />
        <Dato
          label="Alimento/día"
          value={productivos.alimento}
          unit="kg"
          info="Cantidad de balanceado que se está dando por día en esta piscina."
        />
        <Dato
          label="FCR"
          value={productivos.fcr}
          info="Factor de Conversión Alimenticia: kg de alimento necesarios para producir 1 kg de camarón. Más bajo = más eficiente (valores típicos 1.0-1.6)."
        />
        <Dato
          label="Supervivencia"
          value={productivos.supervivencia}
          unit="%"
          info="Porcentaje de camarones sembrados que siguen vivos hoy, estimado. 100% menos la mortalidad acumulada."
        />
      </section>

      <section className="mb-4">
        <h3 className="mb-1 font-display text-xs font-semibold uppercase tracking-wide text-water-500">
          Aireación
        </h3>
        <Dato
          label="Aireadores"
          value={aireacion.numeroAireadores}
          info="Número de aireadores asignados a esta piscina (se actualiza solo al agregar/quitar aireadores en el mapa)."
        />
        <Dato label="HP c/u" value={aireacion.hpPorAireador} info="Potencia de cada motor de aireador, en caballos de fuerza." />
        <Dato
          label="Horario"
          value={aireacion.horario}
          info="Franja horaria en que los aireadores están programados para operar."
        />
        <Dato
          label="Consumo eléctrico"
          value={aireacion.consumoElectrico}
          unit="kWh/día"
          info="Energía eléctrica que consume la aireación de esta piscina por día — clave para calcular el costo operativo."
        />
        <Dato
          label="Eficiencia"
          value={aireacion.eficiencia}
          unit="%"
          info="Qué tan bien está funcionando el sistema de aireación respecto a su capacidad nominal (paletas, motor, distribución del oxígeno)."
        />
      </section>

      <section>
        <div className="mb-1 flex items-center justify-between">
          <h3 className="font-display text-xs font-semibold uppercase tracking-wide text-water-500">
            Aireadores ({piscina.aireadores.length})
          </h3>
          <button
            onClick={() => setModo('agregar-aireador')}
            className="rounded border border-panel-border px-2 py-0.5 text-[11px] text-ink-300 hover:border-water-500 hover:text-water-400"
          >
            + Agregar
          </button>
        </div>

        {piscina.aireadores.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            <button
              onClick={() => cambiarEstadoTodosAireadores(piscina.id, 'ok')}
              className="rounded border border-water-600/40 px-2 py-0.5 text-[11px] text-water-400 hover:bg-water-600/10"
            >
              Encender todos
            </button>
            <button
              onClick={() => cambiarEstadoTodosAireadores(piscina.id, 'advertencia')}
              className="rounded border border-panel-border px-2 py-0.5 text-[11px] text-ink-300 hover:border-ink-500"
            >
              Apagar todos
            </button>
            <button
              onClick={() => cambiarEstadoTodosAireadores(piscina.id, 'falla')}
              className="rounded border border-alert/40 px-2 py-0.5 text-[11px] text-alert hover:bg-alert/10"
            >
              Simular alarma (todos)
            </button>
            <button
              onClick={() => setModo('mover-aireador')}
              className="rounded border border-panel-border px-2 py-0.5 text-[11px] text-ink-300 hover:border-water-500 hover:text-water-400"
            >
              Mover
            </button>
          </div>
        )}

        {piscina.aireadores.length === 0 ? (
          <p className="py-2 text-xs text-ink-500">Sin aireadores colocados todavía.</p>
        ) : (
          <ul className="space-y-1.5">
            {piscina.aireadores.map((a, i) => (
              <li key={a.id} className="rounded border border-panel-border/60 px-2 py-1.5 text-xs">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-ink-300">
                    Aireador {i + 1} · {a.hp} HP
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                      a.estado === 'ok'
                        ? 'bg-water-600/15 text-water-400'
                        : a.estado === 'advertencia'
                          ? 'bg-ink-700/30 text-ink-300'
                          : 'bg-alert/15 text-alert'
                    }`}
                  >
                    {a.estado === 'ok' ? 'Operando' : a.estado === 'advertencia' ? 'Apagado' : 'Alarma'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {a.estado === 'falla' ? (
                    <button
                      onClick={() => cambiarEstadoAireador(piscina.id, a.id, 'advertencia')}
                      className="rounded border border-panel-border px-1.5 py-0.5 text-[11px] text-ink-300 hover:border-water-500"
                    >
                      Restablecer guardamotor
                    </button>
                  ) : a.estado === 'ok' ? (
                    <button
                      onClick={() => cambiarEstadoAireador(piscina.id, a.id, 'advertencia')}
                      className="rounded border border-panel-border px-1.5 py-0.5 text-[11px] text-ink-300 hover:border-ink-500"
                    >
                      Apagar
                    </button>
                  ) : (
                    <button
                      onClick={() => cambiarEstadoAireador(piscina.id, a.id, 'ok')}
                      className="rounded border border-water-600/40 px-1.5 py-0.5 text-[11px] text-water-400 hover:bg-water-600/10"
                    >
                      Encender
                    </button>
                  )}
                  {a.estado !== 'falla' && (
                    <button
                      onClick={() => cambiarEstadoAireador(piscina.id, a.id, 'falla')}
                      className="rounded border border-alert/40 px-1.5 py-0.5 text-[11px] text-alert hover:bg-alert/10"
                    >
                      Simular alarma
                    </button>
                  )}
                  <button
                    onClick={() => eliminarAireador(piscina.id, a.id)}
                    className="ml-auto text-[11px] text-ink-500 hover:text-alert"
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
