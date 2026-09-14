import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { camaroneraDemo, CENTRO_DEFECTO } from '../data/camaronera';
import { avanzarUnDia, sembrarPiscina } from '../simulation/engine';
import type { AireadorPosicion, Camaronera, EstadoEquipo, Piscina } from '../models/types';

export type Modo = 'ver' | 'dibujar-piscina' | 'editar-piscina' | 'agregar-aireador' | 'mover-aireador';

interface EstadoStore {
  camaronera: Camaronera;
  seleccionId: string | null;
  modo: Modo;
  puntosTemp: [number, number][];
  zoom: number;
  intervaloSecuencialSeg: number; // 2 | 4 | 8 — pausa entre cada aireador al encender en secuencia
  horarioGeneral: string; // último horario usado para aplicar a todas las piscinas de una vez

  seleccionar: (id: string | null) => void;
  setModo: (modo: Modo) => void;
  setZoom: (zoom: number) => void;
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
  actualizarAmbientales: (piscinaId: string, cambios: Partial<Piscina['ambientales']>) => void;
  actualizarHorario: (piscinaId: string, horario: string) => void;
  aplicarHorarioATodas: (horario: string) => void;
  setHorarioGeneral: (horario: string) => void;
  setIntervaloSecuencial: (segundos: number) => void;
  encenderSecuencial: (piscinaId: string) => void;

  // Simulación del ciclo de cultivo
  avanzarDia: (piscinaId: string) => void;
  sembrar: (piscinaId: string, datos: { densidad: number; pesoInicialG: number; temperatura: number }) => void;

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
  historial: [],
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
      zoom: 18,
      intervaloSecuencialSeg: 4,
      horarioGeneral: '06:00-22:00',

      seleccionar: (id) => set({ seleccionId: id }),
      setModo: (modo) => set({ modo, puntosTemp: [] }),
      setZoom: (zoom) => set({ zoom }),

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

      actualizarAmbientales: (piscinaId, cambios) => {
        const { camaronera } = get();
        set({
          camaronera: {
            ...camaronera,
            piscinas: camaronera.piscinas.map((p) =>
              p.id === piscinaId ? { ...p, ambientales: { ...p.ambientales, ...cambios } } : p,
            ),
          },
        });
      },

      actualizarHorario: (piscinaId, horario) => {
        const { camaronera } = get();
        set({
          camaronera: {
            ...camaronera,
            piscinas: camaronera.piscinas.map((p) =>
              p.id === piscinaId ? { ...p, aireacion: { ...p.aireacion, horario } } : p,
            ),
          },
        });
      },

      aplicarHorarioATodas: (horario) => {
        const { camaronera } = get();
        set({
          camaronera: {
            ...camaronera,
            piscinas: camaronera.piscinas.map((p) => ({ ...p, aireacion: { ...p.aireacion, horario } })),
          },
          horarioGeneral: horario,
        });
      },

      setHorarioGeneral: (horario) => set({ horarioGeneral: horario }),

      setIntervaloSecuencial: (segundos) => set({ intervaloSecuencialSeg: segundos }),

      // Enciende, de a uno, los aireadores que estén apagados (no toca los que ya
      // están operando ni los que están en alarma — esos necesitan resetearse
      // primero). Entre cada uno espera `intervaloSecuencialSeg` — así se evita el
      // pico de corriente de arrancar varios motores al mismo tiempo, igual que en
      // un panel de control real. Se usa tanto al encender manualmente como cuando
      // el vigía de horario decide que ya es hora de prender la piscina.
      encenderSecuencial: (piscinaId) => {
        const piscina = get().camaronera.piscinas.find((p) => p.id === piscinaId);
        if (!piscina) return;
        const aApagados = piscina.aireadores.filter((a) => a.estado === 'advertencia');
        const esperaMs = get().intervaloSecuencialSeg * 1000;
        aApagados.forEach((a, i) => {
          setTimeout(() => {
            get().cambiarEstadoAireador(piscinaId, a.id, 'ok');
          }, i * esperaMs);
        });
      },

      avanzarDia: (piscinaId) => {
        const { camaronera } = get();
        set({
          camaronera: {
            ...camaronera,
            piscinas: camaronera.piscinas.map((p) => (p.id === piscinaId ? avanzarUnDia(p) : p)),
          },
        });
      },

      sembrar: (piscinaId, datos) => {
        const { camaronera } = get();
        set({
          camaronera: {
            ...camaronera,
            piscinas: camaronera.piscinas.map((p) => (p.id === piscinaId ? sembrarPiscina(p, datos) : p)),
          },
        });
      },

      restaurarDemo: () => set({ camaronera: camaroneraDemo, seleccionId: null, modo: 'ver', puntosTemp: [] }),
    }),
    {
      name: 'simulador-camaronera-store', // clave en localStorage
      partialize: (s) => ({
        camaronera: s.camaronera,
        intervaloSecuencialSeg: s.intervaloSecuencialSeg,
        horarioGeneral: s.horarioGeneral,
      }), // no persistimos modo/selección/zoom
      version: 3, // se agregó "historial" por piscina para el motor de simulación
      migrate: (persisted: any, versionPersistida: number) => {
        if (versionPersistida < 2) return { camaronera: camaroneraDemo }; // coordenadas de plano, ya no compatibles
        // v2 -> v3: solo faltaba "historial" en cada piscina, se puede completar sin perder lo demás
        const camaronera = persisted?.camaronera ?? camaroneraDemo;
        return {
          camaronera: {
            ...camaronera,
            piscinas: camaronera.piscinas.map((p: any) => ({ historial: [], ...p })),
          },
        };
      },
    },
  ),
);

export { CENTRO_DEFECTO };
