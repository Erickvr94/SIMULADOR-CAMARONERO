import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { camaroneraDemo, CENTRO_DEFECTO } from '../data/camaronera';
import type { AireadorPosicion, Camaronera, EstadoEquipo, Piscina } from '../models/types';

export type Modo = 'ver' | 'dibujar-piscina' | 'editar-piscina' | 'agregar-aireador' | 'mover-aireador';

interface EstadoStore {
  camaronera: Camaronera;
  seleccionId: string | null;
  modo: Modo;
  puntosTemp: [number, number][];

  seleccionar: (id: string | null) => void;
  setModo: (modo: Modo) => void;
  renombrarPiscina: (id: string, nombre: string) => void;

  // Dibujo de piscina nueva
  agregarPuntoTemp: (punto: [number, number]) => void;
  deshacerPuntoTemp: () => void;
  cancelarDibujo: () => void;
  guardarPiscina: (nombre: string) => void;

  // Edición de piscina existente
  moverVertice: (piscinaId: string, indice: number, punto: [number, number]) => void;
  agregarVertice: (piscinaId: string, punto: [number, number]) => void;
  eliminarVertice: (piscinaId: string, indice: number) => void;

  // Aireadores
  agregarAireador: (piscinaId: string, punto: [number, number]) => void;
  eliminarAireador: (piscinaId: string, aireadorId: string) => void;
  moverAireador: (piscinaId: string, aireadorId: string, punto: [number, number]) => void;
  cambiarEstadoAireador: (piscinaId: string, aireadorId: string, estado: EstadoEquipo) => void;
  cambiarEstadoTodosAireadores: (piscinaId: string, estado: EstadoEquipo) => void;

  restaurarDemo: () => void;
}

// Área aproximada de un polígono geográfico pequeño (proyección equirectangular
// local, válida para el tamaño de una piscina — no para áreas continentales).
function areaPoligonoGeo(puntos: [number, number][]): number {
  if (puntos.length < 3) return 0;
  const R = 111320; // metros por grado de latitud
  const latRef = puntos.reduce((s, p) => s + p[0], 0) / puntos.length;
  const cosLat = Math.cos((latRef * Math.PI) / 180);
  const xy = puntos.map(([lat, lng]) => [lng * R * cosLat, lat * R]);
  let suma = 0;
  for (let i = 0; i < xy.length; i++) {
    const [x1, y1] = xy[i];
    const [x2, y2] = xy[(i + 1) % xy.length];
    suma += x1 * y2 - x2 * y1;
  }
  return Math.abs(suma / 2); // m²
}

const nuevaPiscinaBase = (
  id: string,
  nombre: string,
  poligono: [number, number][],
): Piscina => ({
  id,
  nombre,
  poligono,
  areaHa: Number((areaPoligonoGeo(poligono) / 10000).toFixed(2)),
  faseCultivo: 'siembra',
  diaCiclo: 0,
  ambientales: { temperatura: 28, salinidad: 18, ph: 7.8, oxigeno: 5, turbidez: 35 },
  productivos: {
    siembra: 0,
    densidad: 0,
    peso: 0,
    biomasa: 0,
    alimento: 0,
    fcr: 0,
    supervivencia: 100,
    mortalidad: 0,
  },
  aireacion: {
    numeroAireadores: 0,
    hpPorAireador: 2,
    horario: '06:00-22:00',
    consumoElectrico: 0,
    eficiencia: 90,
    oxigenacion: 0.5,
  },
  aireadores: [],
  estadoEquipo: 'ok',
});

function actualizarPoligono(
  camaronera: Camaronera,
  piscinaId: string,
  transformar: (p: [number, number][]) => [number, number][],
): Camaronera {
  return {
    ...camaronera,
    piscinas: camaronera.piscinas.map((p) =>
      p.id === piscinaId
        ? {
            ...p,
            poligono: transformar(p.poligono),
            areaHa: Number((areaPoligonoGeo(transformar(p.poligono)) / 10000).toFixed(2)),
          }
        : p,
    ),
  };
}

export const useCamaroneraStore = create<EstadoStore>()(
  persist(
    (set, get) => ({
      camaronera: camaroneraDemo,
      seleccionId: null,
      modo: 'ver',
      puntosTemp: [],

      seleccionar: (id) => set({ seleccionId: id }),
      setModo: (modo) => set({ modo, puntosTemp: [] }),

      renombrarPiscina: (id, nombre) => {
        if (!nombre.trim()) return;
        set((s) => ({
          camaronera: {
            ...s.camaronera,
            piscinas: s.camaronera.piscinas.map((p) => (p.id === id ? { ...p, nombre: nombre.trim() } : p)),
          },
        }));
      },

      agregarPuntoTemp: (punto) =>
        set((s) => ({ puntosTemp: [...s.puntosTemp, punto] })),

      deshacerPuntoTemp: () =>
        set((s) => ({ puntosTemp: s.puntosTemp.slice(0, -1) })),

      cancelarDibujo: () => set({ modo: 'ver', puntosTemp: [] }),

      guardarPiscina: (nombre) => {
        const { puntosTemp, camaronera } = get();
        if (puntosTemp.length < 3) return;
        const id = `P${camaronera.piscinas.length + 1}-${Date.now().toString(36)}`;
        const piscina = nuevaPiscinaBase(id, nombre || `Piscina ${camaronera.piscinas.length + 1}`, puntosTemp);
        set({
          camaronera: { ...camaronera, piscinas: [...camaronera.piscinas, piscina] },
          modo: 'ver',
          puntosTemp: [],
          seleccionId: id,
        });
      },

      moverVertice: (piscinaId, indice, punto) => {
        set({
          camaronera: actualizarPoligono(get().camaronera, piscinaId, (pol) =>
            pol.map((p, i) => (i === indice ? punto : p)),
          ),
        });
      },

      agregarVertice: (piscinaId, punto) => {
        set({
          camaronera: actualizarPoligono(get().camaronera, piscinaId, (pol) => [...pol, punto]),
        });
      },

      eliminarVertice: (piscinaId, indice) => {
        const piscina = get().camaronera.piscinas.find((p) => p.id === piscinaId);
        if (!piscina || piscina.poligono.length <= 3) return; // no dejar un polígono inválido
        set({
          camaronera: actualizarPoligono(get().camaronera, piscinaId, (pol) =>
            pol.filter((_, i) => i !== indice),
          ),
        });
      },

      agregarAireador: (piscinaId, [lat, lng]) => {
        const { camaronera } = get();
        const nuevo: AireadorPosicion = {
          id: `A-${Date.now().toString(36)}`,
          lat,
          lng,
          hp: 2,
          estado: 'advertencia', // nace apagado — el usuario lo enciende explícitamente
        };
        set({
          camaronera: {
            ...camaronera,
            piscinas: camaronera.piscinas.map((p) =>
              p.id === piscinaId
                ? {
                    ...p,
                    aireadores: [...p.aireadores, nuevo],
                    aireacion: { ...p.aireacion, numeroAireadores: p.aireacion.numeroAireadores + 1 },
                  }
                : p,
            ),
          },
        });
      },

      moverAireador: (piscinaId, aireadorId, [lat, lng]) => {
        const { camaronera } = get();
        set({
          camaronera: {
            ...camaronera,
            piscinas: camaronera.piscinas.map((p) =>
              p.id === piscinaId
                ? {
                    ...p,
                    aireadores: p.aireadores.map((a) => (a.id === aireadorId ? { ...a, lat, lng } : a)),
                  }
                : p,
            ),
          },
        });
      },

      cambiarEstadoAireador: (piscinaId, aireadorId, estado) => {
        const { camaronera } = get();
        set({
          camaronera: {
            ...camaronera,
            piscinas: camaronera.piscinas.map((p) =>
              p.id === piscinaId
                ? { ...p, aireadores: p.aireadores.map((a) => (a.id === aireadorId ? { ...a, estado } : a)) }
                : p,
            ),
          },
        });
      },

      cambiarEstadoTodosAireadores: (piscinaId, estado) => {
        const { camaronera } = get();
        set({
          camaronera: {
            ...camaronera,
            piscinas: camaronera.piscinas.map((p) =>
              p.id === piscinaId ? { ...p, aireadores: p.aireadores.map((a) => ({ ...a, estado })) } : p,
            ),
          },
        });
      },

      eliminarAireador: (piscinaId, aireadorId) => {
        const { camaronera } = get();
        set({
          camaronera: {
            ...camaronera,
            piscinas: camaronera.piscinas.map((p) =>
              p.id === piscinaId
                ? {
                    ...p,
                    aireadores: p.aireadores.filter((a) => a.id !== aireadorId),
                    aireacion: {
                      ...p.aireacion,
                      numeroAireadores: Math.max(0, p.aireacion.numeroAireadores - 1),
                    },
                  }
                : p,
            ),
          },
        });
      },

      restaurarDemo: () => set({ camaronera: camaroneraDemo, seleccionId: null, modo: 'ver', puntosTemp: [] }),
    }),
    {
      name: 'simulador-camaronera-store', // clave en localStorage
      partialize: (s) => ({ camaronera: s.camaronera }), // no persistimos modo/selección
      version: 2, // se incrementó al pasar de coordenadas de plano a GPS real
      migrate: () => ({ camaronera: camaroneraDemo }), // datos viejos (plano) ya no son compatibles
    },
  ),
);

export { CENTRO_DEFECTO };
