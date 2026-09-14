import WeatherWidget from './WeatherWidget';

export default function Header({
  nombreCamaronera,
  centro,
}: {
  nombreCamaronera: string;
  centro: [number, number];
}) {
  return (
    <header className="flex items-center justify-between border-b border-panel-border bg-deep-800 px-6 py-3">
      <div>
        <h1 className="font-display text-base font-semibold text-ink-100">{nombreCamaronera}</h1>
        <p className="text-[11px] text-ink-500">Sombra digital · Fase 1 — Mapa</p>
      </div>
      <div className="flex items-center gap-4">
        <WeatherWidget lat={centro[0]} lng={centro[1]} />
        <div className="flex items-center gap-2 text-[11px] text-ink-500">
          <span className="h-2 w-2 rounded-full bg-water-500" />
          Modo simulación
        </div>
      </div>
    </header>
  );
}
