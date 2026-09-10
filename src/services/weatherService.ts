// Clima real desde Open-Meteo (gratis, sin API key).
// Se usa la ubicación de la camaronera (camaronera.centro) como punto de consulta.
//
// Fases futuras: engine.ts (Fase 5 - Oxígeno) puede leer climaActual.temperatura
// como entrada del modelo de oxígeno disuelto en vez de/ además de un valor fijo.

export interface ClimaActual {
  temperatura: number; // °C, aire a 2m
  temperatura_agua: number; // °C, superficie del agua
  humedad: number; // % relativa
  precipitacion: number; // mm, última hora
  vientoKmh: number; // km/h a 10m
  hora: string; // ISO de la lectura
}

export async function obtenerClimaActual(lat: number, lng: number): Promise<ClimaActual> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat.toFixed(5));
  url.searchParams.set('longitude', lng.toFixed(5));
  url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,sea_surface_temperature');
  url.searchParams.set('timezone', 'auto');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Open-Meteo respondió ${res.status}`);
  const data = await res.json();

  return {
    temperatura: data.current.temperature_2m,
    temperatura_agua: data.current.sea_surface_temperature,
    humedad: data.current.relative_humidity_2m,
    precipitacion: data.current.precipitation,
    vientoKmh: data.current.wind_speed_10m,
    hora: data.current.time,
  };
}
