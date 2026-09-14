import { useEffect, useRef } from 'react';
import { useCamaroneraStore } from '../store/useCamaroneraStore';
import { estaEnHorario } from '../lib/horario';

const REVISION_MS = 15_000; // cada 15s revisa si algún horario acaba de cruzar su hora de inicio/fin

/**
 * No renderiza nada — corre en segundo plano mientras la app está abierta.
 * Por cada piscina, compara "¿debería estar encendida según su horario ahora
 * mismo?" contra lo que estaba hace 15s. Si acaba de pasar de NO a SÍ,
 * dispara el encendido secuencial (mismo que el botón manual). Si pasó de SÍ
 * a NO, apaga todo de una vez (apagar no necesita secuencia).
 *
 * Nota importante: esto solo funciona mientras la pestaña del navegador está
 * abierta — es un reloj de software, no un PLC. Si cierras la app, no hay
 * quien encienda nada a la hora programada.
 */
export default function VigiaHorario() {
  const camaronera = useCamaroneraStore((s) => s.camaronera);
  const encenderSecuencial = useCamaroneraStore((s) => s.encenderSecuencial);
  const cambiarEstadoTodosAireadores = useCamaroneraStore((s) => s.cambiarEstadoTodosAireadores);
  const estadoPrevio = useRef<Record<string, boolean>>({});

  useEffect(() => {
    const revisar = () => {
      const ahora = new Date();
      const { piscinas } = useCamaroneraStore.getState().camaronera;
      for (const p of piscinas) {
        if (p.aireadores.length === 0) continue;
        const deberiaEstarEncendida = estaEnHorario(p.aireacion.horario, ahora);
        const estabaAntes = estadoPrevio.current[p.id];
        if (estabaAntes === undefined) {
          estadoPrevio.current[p.id] = deberiaEstarEncendida; // primera lectura: solo se registra, no dispara
          continue;
        }
        if (!estabaAntes && deberiaEstarEncendida) {
          encenderSecuencial(p.id); // cruzó la hora de inicio: encendido secuencial
        } else if (estabaAntes && !deberiaEstarEncendida) {
          cambiarEstadoTodosAireadores(p.id, 'advertencia'); // cruzó la hora de fin: apaga todo de una vez
        }
        estadoPrevio.current[p.id] = deberiaEstarEncendida;
      }
    };

    revisar();
    const intervalo = setInterval(revisar, REVISION_MS);
    return () => clearInterval(intervalo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camaronera.piscinas.length]); // se re-arma si se agregan/quitan piscinas

  return null;
}
