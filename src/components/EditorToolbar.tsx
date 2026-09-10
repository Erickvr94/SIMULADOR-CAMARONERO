import { useState } from 'react';
import { useCamaroneraStore } from '../store/useCamaroneraStore';

export default function EditorToolbar() {
  const modo = useCamaroneraStore((s) => s.modo);
  const setModo = useCamaroneraStore((s) => s.setModo);
  const puntosTemp = useCamaroneraStore((s) => s.puntosTemp);
  const deshacerPuntoTemp = useCamaroneraStore((s) => s.deshacerPuntoTemp);
  const cancelarDibujo = useCamaroneraStore((s) => s.cancelarDibujo);
  const guardarPiscina = useCamaroneraStore((s) => s.guardarPiscina);
  const seleccionId = useCamaroneraStore((s) => s.seleccionId);
  const restaurarDemo = useCamaroneraStore((s) => s.restaurarDemo);

  const [nombre, setNombre] = useState('');

  if (modo === 'dibujar-piscina') {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-panel-border bg-panel px-4 py-2">
        <span className="text-xs text-ink-300">
          Clic en el mapa para poner los vértices ({puntosTemp.length} puntos)
        </span>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Nombre de la piscina"
          className="rounded border border-panel-border bg-deep-800 px-2 py-1 text-xs text-ink-100 placeholder:text-ink-700 focus:outline-none focus:ring-1 focus:ring-water-500"
        />
        <button
          onClick={deshacerPuntoTemp}
          disabled={puntosTemp.length === 0}
          className="rounded border border-panel-border px-2 py-1 text-xs text-ink-300 hover:border-water-500 hover:text-water-400 disabled:opacity-30"
        >
          Deshacer punto
        </button>
        <button
          onClick={() => {
            guardarPiscina(nombre.trim());
            setNombre('');
          }}
          disabled={puntosTemp.length < 3}
          className="rounded bg-water-600 px-3 py-1 text-xs font-medium text-deep-900 hover:bg-water-500 disabled:opacity-30"
        >
          Guardar piscina
        </button>
        <button
          onClick={cancelarDibujo}
          className="rounded border border-alert/40 px-2 py-1 text-xs text-alert hover:bg-alert/10"
        >
          Cancelar
        </button>
      </div>
    );
  }

  if (modo === 'agregar-aireador') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-panel-border bg-panel px-4 py-2">
        <span className="text-xs text-ink-300">
          Clic dentro del contorno punteado para colocar un aireador (nace apagado)
        </span>
        <button
          onClick={() => setModo('ver')}
          className="rounded border border-panel-border px-2 py-1 text-xs text-ink-300 hover:border-water-500 hover:text-water-400"
        >
          Terminar
        </button>
      </div>
    );
  }

  if (modo === 'mover-aireador') {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-panel-border bg-panel px-4 py-2">
        <span className="text-xs text-ink-300">Arrastra un aireador dentro del contorno para reposicionarlo</span>
        <button
          onClick={() => setModo('ver')}
          className="rounded border border-panel-border px-2 py-1 text-xs text-ink-300 hover:border-water-500 hover:text-water-400"
        >
          Terminar
        </button>
      </div>
    );
  }

  if (modo === 'editar-piscina') {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-panel-border bg-panel px-4 py-2">
        <span className="text-xs text-ink-300">
          Arrastra los cuadrados para mover vértices · clic derecho en uno para borrarlo · clic en el mapa para
          agregar un vértice nuevo
        </span>
        <button
          onClick={() => setModo('ver')}
          className="ml-auto rounded bg-water-600 px-3 py-1 text-xs font-medium text-deep-900 hover:bg-water-500"
        >
          Terminar edición
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-lg border border-panel-border bg-panel px-4 py-2">
      <button
        onClick={() => setModo('dibujar-piscina')}
        className="rounded bg-water-600 px-3 py-1 text-xs font-medium text-deep-900 hover:bg-water-500"
      >
        + Nueva piscina
      </button>
      <button
        onClick={() => setModo('editar-piscina')}
        disabled={!seleccionId}
        className="rounded border border-panel-border px-3 py-1 text-xs text-ink-300 hover:border-water-500 hover:text-water-400 disabled:opacity-30"
        title={!seleccionId ? 'Selecciona una piscina primero' : ''}
      >
        Editar forma
      </button>
      <button
        onClick={() => setModo('agregar-aireador')}
        disabled={!seleccionId}
        className="rounded border border-panel-border px-3 py-1 text-xs text-ink-300 hover:border-water-500 hover:text-water-400 disabled:opacity-30"
        title={!seleccionId ? 'Selecciona una piscina primero' : ''}
      >
        + Aireador en {seleccionId ?? '...'}
      </button>
      <button
        onClick={() => setModo('mover-aireador')}
        disabled={!seleccionId}
        className="rounded border border-panel-border px-3 py-1 text-xs text-ink-300 hover:border-water-500 hover:text-water-400 disabled:opacity-30"
        title={!seleccionId ? 'Selecciona una piscina primero' : ''}
      >
        Mover aireadores
      </button>
      <button
        onClick={restaurarDemo}
        className="rounded border border-panel-border px-2 py-1 text-xs text-ink-500 hover:border-alert/50 hover:text-alert"
      >
        Restaurar datos demo
      </button>
      <span className="ml-auto flex items-center gap-1 text-[11px] text-ink-700">
        <span className="h-1.5 w-1.5 rounded-full bg-water-600" />
        Guardado automático en este navegador
      </span>
    </div>
  );
}
