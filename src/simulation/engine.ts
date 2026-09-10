// Motor de simulación — se construye fase a fase a partir de aquí.
//
// Fase 2 (Ciclo de cultivo): avanzarUnDia(piscina) debe mover diaCiclo +1
//   y transicionar faseCultivo (siembra -> crecimiento -> engorde -> cosecha).
// Fase 3 (Biomasa): calcular biomasa a partir de población, peso y supervivencia.
// Fase 4 (Alimentación): alimento diario = f(biomasa, FCR objetivo).
// Fase 5 (Oxígeno): O2 simulado = f(temperatura, biomasa, hora, aireación).
// Fase 6 (Automatización): si O2 < umbral -> encender aireadores automáticamente.
// Fase 7 (Fallas): inyectar fallas aleatorias (aireador, PLC, sensor, comms)
//   y observar cómo se degrada la simulación.
// Fase 8 (Cosecha): consolidar métricas finales (peso, supervivencia, FCR, costo/ingreso).
//
// Este archivo se deja intencionalmente vacío de lógica en la Fase 1:
// el objetivo de este commit es solo el mapa y el modelo de datos.

import type { Piscina } from '../models/types';

export function avanzarUnDia(piscina: Piscina): Piscina {
  // TODO Fase 2
  return piscina;
}
