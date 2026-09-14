// Motor de simulación día a día.
//
// Por qué esto existe: no hay ninguna API pública que dé oxígeno disuelto,
// pH o salinidad de una piscina específica — eso se simula con un modelo
// matemático, punto. Es el enfoque estándar en ingeniería acuícola: un
// "balance de masas" de oxígeno (entra por aireación y fotosíntesis, sale
// por consumo del camarón y de la materia orgánica del fondo).
//
// Todas las constantes de abajo son ajustables — no son "la verdad", son un
// punto de partida razonable. Si comparas contra tu camaronera real y ves
// que el oxígeno cae más rápido o más lento de lo que tú observas, ajusta
// CONFIG en consecuencia. Eso es precisamente el valor de tenerlas explícitas
// acá en vez de escondidas en una fórmula opaca.

import type { Piscina, PuntoHistorico } from '../models/types';
import { horasProgramadas } from '../lib/horario';

export const CONFIG = {
  // Crecimiento (modelo tipo von Bertalanffy: crece rápido al inicio, se
  // desacelera al acercarse a un peso máximo biológico práctico)
  pesoMaximoG: 26,
  tasaCrecimientoBase: 0.05, // fracción de (pesoMax - pesoActual) ganada por día, en condiciones ideales

  // Mortalidad
  mortalidadBaseDiaria: 0.0015, // 0.15%/día en condiciones normales (~83% supervivencia a 120 días)
  mortalidadPorEstresO2Diaria: 0.02, // % adicional por día cuando el oxígeno está en zona crítica
  mortalidadPorAsfixiaDiaria: 0.08, // % adicional por día cuando el oxígeno está en zona letal

  // Oxígeno disuelto (mg/L) — balance diario simplificado
  profundidadPiscinaM: 1.2, // supuesto estándar de piscina camaronera; ajusta si la tuya es distinta
  volumenReferenciaM3: 25920, // volumen de una piscina de referencia (2.16 ha × 1.2 m) — para escalar el aporte de HP
  o2Saturacion: 6.5, // mg/L máximo que el agua puede retener a esta temperatura/salinidad aprox.
  o2CriticoMgL: 3, // por debajo de esto hay estrés (crecimiento más lento, algo de mortalidad)
  o2LetalMgL: 1.5, // por debajo de esto la mortalidad se dispara
  produccionFotosintesisMgL: 1.1, // aporte diario neto de fitoplancton (simplificado a un promedio día/noche)
  consumoBasalMgL: 0.5, // consumo diario de fondo (materia orgánica, plancton respirando)
  consumoPorKgM3PorDia: 12, // mg/L/día que aporta 1 (kg de biomasa / m³ de agua) — a más densidad de camarón, más consumo
  aporteO2PorHpMgLdia: 0.35, // mg/L/día que aporta 1 HP de aireador funcionando en la piscina de referencia (a horario completo)
  kwPorHp: 0.746, // constante física: 1 HP = 0.746 kW, para el consumo eléctrico

  // Alimentación — tabla simplificada de tasa de alimentación diaria como % de biomasa,
  // más alta cuando el camarón es pequeño, baja según va creciendo (patrón real de manejo)
  tablaRacion: [
    { hastaG: 1, pct: 0.12 },
    { hastaG: 5, pct: 0.08 },
    { hastaG: 10, pct: 0.05 },
    { hastaG: 18, pct: 0.035 },
    { hastaG: Infinity, pct: 0.025 },
  ],

  // Límites de fase de cultivo por día (ajusta si tu ciclo real es más corto/largo)
  finSiembra: 7,
  finCrecimiento: 60,
  finEngorde: 100,
};

function volumenM3(p: Piscina): number {
  return p.areaHa * 10000 * CONFIG.profundidadPiscinaM;
}

function faseParaDia(dia: number): Piscina['faseCultivo'] {
  if (dia <= CONFIG.finSiembra) return 'siembra';
  if (dia <= CONFIG.finCrecimiento) return 'crecimiento';
  if (dia <= CONFIG.finEngorde) return 'engorde';
  return 'cosecha';
}

function racionPct(pesoG: number): number {
  return CONFIG.tablaRacion.find((r) => pesoG <= r.hastaG)?.pct ?? 0.025;
}

/** Un solo paso de un día: recalcula oxígeno, crecimiento, mortalidad, alimento, fase Y la sección de Aireación. */
export function avanzarUnDia(p: Piscina): Piscina {
  const vol = volumenM3(p);
  const diaCicloNuevo = p.diaCiclo + 1;
  const faseNueva = faseParaDia(diaCicloNuevo);

  // --- Aireación: esta es la ÚNICA fuente de verdad — los aireadores que colocaste
  // en el mapa, filtrados por si están realmente "Operando" hoy, y por el horario
  // configurado en la sección Aireación. El campo "numeroAireadores" y demás de esa
  // sección se recalculan abajo a partir de esto, en vez de vivir como números sueltos.
  const encendidos = p.aireadores.filter((a) => a.estado === 'ok');
  const hpEncendido = encendidos.reduce((s, a) => s + a.hp, 0);
  const horas = horasProgramadas(p.aireacion.horario);
  const fraccionDia = horas / 24;

  // --- Oxígeno disuelto: balance de masas del día ---
  // El aporte de HP se escala contra el tamaño de la piscina (misma potencia sube
  // menos el O2 en una piscina grande) y contra la fracción del día que están
  // programados para funcionar (el horario de la sección Aireación).
  const aporteAireacion =
    hpEncendido * CONFIG.aporteO2PorHpMgLdia * (CONFIG.volumenReferenciaM3 / vol) * fraccionDia;
  const densidadBiomasaKgM3 = p.productivos.biomasa / vol;
  const consumoBiomasa = densidadBiomasaKgM3 * CONFIG.consumoPorKgM3PorDia;
  // El agua caliente retiene menos oxígeno y el camarón consume más rápido con calor
  const factorTemperatura = 1 + Math.max(0, p.ambientales.temperatura - 28) * 0.06;

  let oxigenoNuevo =
    p.ambientales.oxigeno +
    CONFIG.produccionFotosintesisMgL +
    aporteAireacion -
    CONFIG.consumoBasalMgL -
    consumoBiomasa * factorTemperatura;
  oxigenoNuevo = Math.max(0, Math.min(CONFIG.o2Saturacion, oxigenoNuevo));

  const enEstresO2 = oxigenoNuevo < CONFIG.o2CriticoMgL;
  const enAsfixia = oxigenoNuevo < CONFIG.o2LetalMgL;

  // Si la piscina ya no tiene población viva, no hay nada más que simular:
  // se congelan peso/biomasa/alimento y solo avanza el día y el oxígeno.
  if (p.productivos.supervivencia <= 0) {
    const congelada: Piscina = {
      ...p,
      diaCiclo: diaCicloNuevo,
      faseCultivo: faseNueva,
      ambientales: { ...p.ambientales, oxigeno: Number(oxigenoNuevo.toFixed(2)) },
      productivos: { ...p.productivos, alimento: 0 },
      aireacion: {
        ...p.aireacion,
        numeroAireadores: p.aireadores.length,
        eficiencia: p.aireadores.length ? Math.round((encendidos.length / p.aireadores.length) * 100) : 0,
        consumoElectrico: Number((hpEncendido * CONFIG.kwPorHp * horas).toFixed(1)),
        oxigenacion: Number((aporteAireacion / 24).toFixed(2)),
      },
      estadoEquipo: 'falla',
    };
    const puntoCero: PuntoHistorico = {
      dia: diaCicloNuevo,
      peso: congelada.productivos.peso,
      biomasa: 0,
      oxigeno: congelada.ambientales.oxigeno,
      temperatura: congelada.ambientales.temperatura,
      supervivencia: 0,
      alimento: 0,
    };
    return { ...congelada, historial: [...p.historial, puntoCero] };
  }

  // --- Crecimiento (más lento si hay estrés de oxígeno) ---
  const factorCrecimiento = enAsfixia ? 0.15 : enEstresO2 ? 0.5 : 1;
  const pesoNuevo =
    p.productivos.peso + (CONFIG.pesoMaximoG - p.productivos.peso) * CONFIG.tasaCrecimientoBase * factorCrecimiento;

  // --- Mortalidad ---
  let mortalidadHoyPct = CONFIG.mortalidadBaseDiaria;
  if (enAsfixia) mortalidadHoyPct += CONFIG.mortalidadPorAsfixiaDiaria;
  else if (enEstresO2) mortalidadHoyPct += CONFIG.mortalidadPorEstresO2Diaria;
  const supervivenciaNueva = Math.max(0, p.productivos.supervivencia - mortalidadHoyPct * 100);

  // --- Biomasa y alimentación ---
  const poblacionNueva = p.productivos.densidad * p.areaHa * 10000 * (supervivenciaNueva / 100);
  const biomasaNuevaKg = (pesoNuevo * poblacionNueva) / 1000;
  const alimentoNuevo = faseNueva === 'cosecha' ? 0 : Number((biomasaNuevaKg * racionPct(pesoNuevo)).toFixed(1));

  const piscinaActualizada: Piscina = {
    ...p,
    diaCiclo: diaCicloNuevo,
    faseCultivo: faseNueva,
    ambientales: { ...p.ambientales, oxigeno: Number(oxigenoNuevo.toFixed(2)) },
    productivos: {
      ...p.productivos,
      peso: Number(pesoNuevo.toFixed(3)),
      biomasa: Number(biomasaNuevaKg.toFixed(1)),
      alimento: alimentoNuevo,
      supervivencia: Number(supervivenciaNueva.toFixed(2)),
      mortalidad: Number((100 - supervivenciaNueva).toFixed(2)),
    },
    // La sección Aireación deja de ser un bloque de números sueltos: se recalcula
    // cada día a partir de los aireadores reales colocados en el mapa.
    aireacion: {
      ...p.aireacion,
      numeroAireadores: p.aireadores.length,
      eficiencia: p.aireadores.length ? Math.round((encendidos.length / p.aireadores.length) * 100) : 0,
      consumoElectrico: Number((hpEncendido * CONFIG.kwPorHp * horas).toFixed(1)),
      oxigenacion: Number((aporteAireacion / 24).toFixed(2)),
    },
    estadoEquipo: enAsfixia ? 'falla' : enEstresO2 ? 'advertencia' : 'ok',
  };

  const punto: PuntoHistorico = {
    dia: diaCicloNuevo,
    peso: piscinaActualizada.productivos.peso,
    biomasa: piscinaActualizada.productivos.biomasa,
    oxigeno: piscinaActualizada.ambientales.oxigeno,
    temperatura: piscinaActualizada.ambientales.temperatura,
    supervivencia: piscinaActualizada.productivos.supervivencia,
    alimento: piscinaActualizada.productivos.alimento,
  };

  return { ...piscinaActualizada, historial: [...p.historial, punto] };
}

/** Inicia un ciclo nuevo (siembra) con valores que el usuario ingresa manualmente. */
export function sembrarPiscina(
  p: Piscina,
  datos: { densidad: number; pesoInicialG: number; temperatura: number },
): Piscina {
  const poblacionInicial = datos.densidad * p.areaHa * 10000;
  const biomasaInicial = (datos.pesoInicialG * poblacionInicial) / 1000;

  const piscinaSembrada: Piscina = {
    ...p,
    diaCiclo: 0,
    faseCultivo: 'siembra',
    ambientales: { ...p.ambientales, temperatura: datos.temperatura, oxigeno: CONFIG.o2Saturacion - 1 },
    productivos: {
      siembra: 0,
      densidad: datos.densidad,
      peso: datos.pesoInicialG,
      biomasa: Number(biomasaInicial.toFixed(1)),
      alimento: 0,
      fcr: 0,
      supervivencia: 100,
      mortalidad: 0,
    },
    aireacion: { ...p.aireacion, numeroAireadores: p.aireadores.length },
    estadoEquipo: 'ok',
    historial: [],
  };

  const punto: PuntoHistorico = {
    dia: 0,
    peso: piscinaSembrada.productivos.peso,
    biomasa: piscinaSembrada.productivos.biomasa,
    oxigeno: piscinaSembrada.ambientales.oxigeno,
    temperatura: piscinaSembrada.ambientales.temperatura,
    supervivencia: 100,
    alimento: 0,
  };

  return { ...piscinaSembrada, historial: [punto] };
}
