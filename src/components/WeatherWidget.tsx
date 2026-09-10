import { useEffect, useState } from 'react';
import { obtenerClimaActual, type ClimaActual } from '../services/weatherService';
import InfoTip from './InfoTip';

export default function WeatherWidget({ lat, lng }: { lat: number; lng: number }) {
  const [clima, setClima] = useState<ClimaActual | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let activo = true;
    const cargar = () => {
      obtenerClimaActual(lat, lng)
        .then((c) => activo && setClima(c))
        .catch(() => activo && setError(true));
    };
    cargar();
    // Refresca cada 15 min — Open-Meteo actualiza su pronóstico horario, no hace falta más seguido.
    const intervalo = setInterval(cargar, 15 * 60 * 1000);
    return () => {
      activo = false;
      clearInterval(intervalo);
    };
  }, [lat, lng]);

  if (error) {
    return <span className="text-[11px] text-ink-700">Clima no disponible</span>;
  }

  if (!clima) {
    return <span className="text-[11px] text-ink-500">Cargando clima…</span>;
  }

  return (
    <div className="flex items-center gap-3 text-[11px] text-ink-300">
      <InfoTip text="Datos del modelo meteorológico de Open-Meteo para esta ubicación, no de un sensor físico en tu camaronera.">
        <span className="text-ink-500">Open-Meteo</span>
      </InfoTip>
      <InfoTip text="Temperatura real del AIRE, medida/modelada a 2 metros de altura sobre el suelo (altura estándar meteorológica).">
        <span className="font-mono text-ink-100">{clima.temperatura.toFixed(1)}°C</span>
      </InfoTip>
      <InfoTip text="Temperatura de la superficie del agua.">
        <span className="font-mono text-water-400">{clima.temperatura_agua.toFixed(1)}°C</span>
      </InfoTip>
      <InfoTip text="Humedad relativa del aire a 2 metros de altura.">
        <span>{clima.humedad}% HR</span>
      </InfoTip>
      <InfoTip text="Velocidad del viento a 10 metros de altura sobre el suelo (altura estándar de las estaciones meteorológicas).">
        <span>{clima.vientoKmh.toFixed(0)} km/h</span>
      </InfoTip>
      {clima.precipitacion > 0 && (
        <InfoTip text="Precipitación acumulada en la última hora.">
          <span className="text-water-400">{clima.precipitacion} mm</span>
        </InfoTip>
      )}
    </div>
  );
}
