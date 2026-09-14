// Clima real desde Open-Meteo (gratis, sin API key).
// Se usa la ubicación de la camaronera (camaronera.centro) como punto de consulta.
//
// Fases futuras: engine.ts (Fase 5 - Oxígeno) puede leer climaActual.temperatura
// como entrada del modelo de oxígeno disuelto en vez de/ además de un valor fijo.

export interface ClimaActual {
  temperatura: number; // °C, aire a 2m
  humedad: number; // % relativa
  precipitacion: number; // mm, última hora
  vientoKmh: number; // km/h a 10m
  hora: string; // ISO de la lectura
}

export async function obtenerClimaActual(lat: number, lng: number): Promise<ClimaActual> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat.toFixed(5));
  url.searchParams.set('longitude', lng.toFixed(5));
  url.searchParams.set('current', 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m');
  url.searchParams.set('timezone', 'auto');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Open-Meteo respondió ${res.status}`);
  const data = await res.json();

  return {
    temperatura: data.current.temperature_2m,
    humedad: data.current.relative_humidity_2m,
    precipitacion: data.current.precipitation,
    vientoKmh: data.current.wind_speed_10m,
    hora: data.current.time,
  };
}

// El agua de una piscina somera NO tiene la misma temperatura que el aire:
// tiene más inercia térmica (tarda en subir y bajar) y en el trópico, por sol
// directo sobre poca profundidad, suele quedar un poco por encima del
// promedio del aire de las últimas horas. Esto es una ESTIMACIÓN, no una
// medición real — la única forma de tener el dato real sin estimar es con un
// sensor de temperatura físico sumergido en la piscina.
const OFFSET_AGUA_C = 1.5; // ajusta esto si comparas contra mediciones reales de tus piscinas
const VENTANA_HORAS = 24;

export interface EstimacionTemperaturaAgua {
  temperatura: number; // °C estimados
  horasPromediadas: number;
  metodo: string;
}

export async function estimarTemperaturaAgua(lat: number, lng: number): Promise<EstimacionTemperaturaAgua> {
  const url = new URL('https://api.open-meteo.com/v1/forecast');
  url.searchParams.set('latitude', lat.toFixed(5));
  url.searchParams.set('longitude', lng.toFixed(5));
  url.searchParams.set('hourly', 'temperature_2m');
  url.searchParams.set('past_hours', String(VENTANA_HORAS));
  url.searchParams.set('forecast_hours', '1');
  url.searchParams.set('timezone', 'auto');

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Open-Meteo respondió ${res.status}`);
  const data = await res.json();

  const ventana: number[] = data.hourly.temperature_2m;
  const promedio = ventana.reduce((a: number, b: number) => a + b, 0) / ventana.length;

  return {
    temperatura: Number((promedio + OFFSET_AGUA_C).toFixed(1)),
    horasPromediadas: ventana.length,
    metodo: `Promedio del aire (últimas ${ventana.length}h) + ${OFFSET_AGUA_C}°C de offset por inercia térmica del agua`,
  };
}
