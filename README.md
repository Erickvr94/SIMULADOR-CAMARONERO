# Simulador Camaronera — Sombra Digital

Sistema de simulación tipo *shadow system* para producción camaronera:
en vez de sensores/PLC físicos, el estado de cada piscina (temperatura,
oxígeno, biomasa, alimentación, etc.) se calcula con un modelo matemático
en software. Pensado para desplegar en Vercel sin costo de hardware.

## Stack (según arquitectura definida)

```
Vercel
 └── React + Vite
      ├── Leaflet   (mapa de planta, plano 2D)
      └── Charts    (Recharts)
           └── Motor de simulación
                └── API / Backend
                     └── Supabase (PostgreSQL + Storage)
```

## Por qué Leaflet en modo plano (no lat/lng real)

El mapa usa `L.CRS.Simple`, es decir, Leaflet como lienzo 2D de coordenadas
cartesianas (metros), no como mapa geográfico. Esto te da zoom, pan y capas
gratis sin depender de GPS real — ideal para el layout de piscinas de una
sola planta. Si en el futuro manejas varias camaroneras en distintas
ubicaciones geográficas, se puede agregar una vista adicional con
coordenadas reales (lat/lng) sin tocar esta.

## Fases (roadmap, según Excel de origen)

- [x] **Fase 1 — Mapa**: Camaronera con piscinas en mapa Leaflet (este commit)
- [ ] Fase 2 — Ciclo de cultivo (siembra → crecimiento → engorde → cosecha, botón "avanzar un día")
- [ ] Fase 3 — Biomasa (población, peso, supervivencia)
- [ ] Fase 4 — Alimentación (biomasa → alimento diario → FCR → costo)
- [ ] Fase 5 — Oxígeno simulado (temperatura, biomasa, hora, aireación)
- [ ] Fase 6 — Automatización (O2 bajo → control automático → aireadores ON)
- [ ] Fase 7 — Fallas (aireador, PLC, sensor O2, comunicación)
- [ ] Fase 8 — Cosecha (métricas finales y gráficos)

Cada fase futura se implementa principalmente en `src/simulation/engine.ts`
(lógica) y `src/components/` (UI), sin tener que tocar el mapa de la Fase 1.

## Estructura

```
src/
├── components/     UI (paneles, header, controles)
├── pages/          vistas de nivel superior (si el proyecto crece)
├── maps/           mapa Leaflet en modo plano de planta
├── simulation/      motor de simulación (fases 2-8, hoy es un stub)
├── models/         tipos TypeScript (calcados de las 4 categorías del Excel)
├── services/       capa de datos (hoy estático, mañana Supabase)
└── data/           datos semilla de ejemplo (4 piscinas)
```

## Desarrollo local

```bash
npm install
npm run dev
```

## Desplegar en Vercel

1. Sube este proyecto a un repo de GitHub.
2. En Vercel: **New Project** → importa el repo.
3. Framework detectado: **Vite**. Build command: `npm run build`. Output: `dist`.
4. Deploy.

No hay variables de entorno todavía (Fase 1 usa datos estáticos). Cuando
conectes Supabase en una fase futura, agrega `VITE_SUPABASE_URL` y
`VITE_SUPABASE_ANON_KEY` en Vercel → Settings → Environment Variables.
