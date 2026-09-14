// Interpreta el campo "Horario" (ej. "06:00-22:00") — lo usan tanto el motor
// de simulación (día a día) como el vigía de horario en tiempo real (reloj
// del navegador).

export function parseHorario(horario: string): { iniH: number; finH: number } | null {
  const m = horario.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (!m) return null;
  return {
    iniH: Number(m[1]) + Number(m[2]) / 60,
    finH: Number(m[3]) + Number(m[4]) / 60,
  };
}

export function horasProgramadas(horario: string): number {
  const p = parseHorario(horario);
  if (!p) return 24; // formato no reconocido: se asume disponible todo el día
  const horas = p.finH >= p.iniH ? p.finH - p.iniH : 24 - p.iniH + p.finH; // soporta cruzar medianoche
  return Math.max(0, Math.min(24, horas));
}

export function estaEnHorario(horario: string, ahora: Date = new Date()): boolean {
  const p = parseHorario(horario);
  if (!p) return true;
  const horaActual = ahora.getHours() + ahora.getMinutes() / 60;
  if (p.finH >= p.iniH) return horaActual >= p.iniH && horaActual < p.finH;
  return horaActual >= p.iniH || horaActual < p.finH; // cruza medianoche
}
