// Ícono de aireador basado en el SVG provisto por el usuario.
// El SVG original ya define 3 estados vía clases CSS (running / stopped / alarmed)
// con animación de paletas girando y glow — los reutilizamos tal cual.
import { divIcon } from 'leaflet';
import type { EstadoEquipo } from '../models/types';

const claseEstado: Record<EstadoEquipo, string> = {
  ok: 'running',
  advertencia: 'stopped',
  falla: 'alarmed',
};

const SVG_INNER = `<title id="title">Aireador de piscina camaronera, vista superior</title>
  <desc id="desc">Aireador flotante con dos flotadores azules, motor central y cuatro conjuntos de paletas.</desc>

  <style type="text/css">
    .aerador { --main:#1976d2; --dark:#0d47a1; --paddle:#252a30; --metal:#b8c0c8; --status:#20c95a; --glow:rgba(32,201,90,.55); }
    .body { fill:var(--main); stroke:var(--dark); stroke-width:2; }
    .paddle { fill:var(--paddle); stroke:#111820; stroke-width:1.5; }
    .metal { fill:var(--metal); stroke:#68737c; stroke-width:1.5; }
    .motor { fill:#1680e8; stroke:#063c83; stroke-width:2; }
    .status { fill:var(--status); opacity:.92; }
    .water { fill:none; stroke:#43a5ff; stroke-width:5; opacity:.55; }
    .glow { fill:var(--glow); opacity:.18; filter:url(#blur); }
    .bolt { fill:#d9e0e6; stroke:#6c757d; stroke-width:1; }
    .hole { fill:#10151a; opacity:.9; }
    .off, .alarm { display:none; }

    /* Animaciones de rotación sobre su propio eje */
    .running .water { display:block; }
    .running .glow { display:block; animation:pulse 1.4s ease-in-out infinite; }
    .running .paddles-left { animation:spin 1.05s linear infinite; transform-origin: 90px 120px; }
    .running .paddles-right { animation:spin-reverse 1.05s linear infinite; transform-origin: 230px 120px; }

    .stopped .water, .stopped .glow { display:none; }
    .stopped .paddles-left, .stopped .paddles-right { animation:none; }

    .alarmed .status { fill:#e53935; }
    .alarmed .water { stroke:#ff5252; opacity:.35; }
    .alarmed .glow { display:block; fill:#ff1744; opacity:.3; animation:alarmPulse .7s ease-in-out infinite; }
    .alarmed .motor { fill:#d32f2f; stroke:#7f0000; }

    @keyframes spin { to { transform:rotate(360deg); } }
    @keyframes spin-reverse { to { transform:rotate(-360deg); } }
    @keyframes pulse { 0%,100%{opacity:.12} 50%{opacity:.34} }
    @keyframes alarmPulse { 0%,100%{opacity:.18} 50%{opacity:.5} }
  </style>

  <defs>
    <filter id="blur" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="9"/>
    </filter>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-opacity=".25"/>
    </filter>
  </defs>

  <!-- Cambia la clase aquí para probar los estados: aerador running | aerador stopped | aerador alarmed -->
  <g class="aerador running" filter="url(#shadow)">
    <ellipse class="glow" cx="160" cy="120" rx="145" ry="104"/>

    <!-- Flotadores -->
    <rect class="body" x="25" y="25" width="48" height="190" rx="22"/>
    <rect class="body" x="247" y="25" width="48" height="190" rx="22"/>

    <!-- Tapas flotadores -->
    <path d="M35 48 Q49 30 63 48 L63 69 Q49 78 35 69Z" fill="#258be9" stroke="#0d47a1" stroke-width="1.5"/>
    <path d="M257 48 Q271 30 285 48 L285 69 Q271 78 257 69Z" fill="#258be9" stroke="#0d47a1" stroke-width="1.5"/>

    <!-- Estructura de metal -->
    <rect class="metal" x="58" y="43" width="204" height="12" rx="5"/>
    <rect class="metal" x="58" y="185" width="204" height="12" rx="5"/>
    <rect class="metal" x="63" y="113" width="194" height="14" rx="7"/>
    <circle class="bolt" cx="66" cy="120" r="6"/>
    <circle class="bolt" cx="254" cy="120" r="6"/>

    <!-- Ondas de agua -->
    <g class="water">
      <ellipse cx="86" cy="120" rx="18" ry="60"/>
      <ellipse cx="72" cy="120" rx="28" ry="74"/>
      <ellipse cx="234" cy="120" rx="18" ry="60"/>
      <ellipse cx="248" cy="120" rx="28" ry="74"/>
    </g>

    <!-- Bloque de paletas izquierdas -->
    <g class="paddles-left">
      <g>
        <rect class="paddle" x="66" y="67" width="48" height="24" rx="5"/>
        <circle class="hole" cx="78" cy="74" r="2.2"/><circle class="hole" cx="88" cy="74" r="2.2"/><circle class="hole" cx="98" cy="74" r="2.2"/>
        <circle class="hole" cx="78" cy="83" r="2.2"/><circle class="hole" cx="88" cy="83" r="2.2"/><circle class="hole" cx="98" cy="83" r="2.2"/>
      </g>
      <g>
        <rect class="paddle" x="66" y="94" width="48" height="24" rx="5"/>
        <circle class="hole" cx="78" cy="101" r="2.2"/><circle class="hole" cx="88" cy="101" r="2.2"/><circle class="hole" cx="98" cy="101" r="2.2"/>
        <circle class="hole" cx="78" cy="110" r="2.2"/><circle class="hole" cx="88" cy="110" r="2.2"/><circle class="hole" cx="98" cy="110" r="2.2"/>
      </g>
      <g>
        <rect class="paddle" x="66" y="122" width="48" height="24" rx="5"/>
        <circle class="hole" cx="78" cy="129" r="2.2"/><circle class="hole" cx="88" cy="129" r="2.2"/><circle class="hole" cx="98" cy="129" r="2.2"/>
        <circle class="hole" cx="78" cy="138" r="2.2"/><circle class="hole" cx="88" cy="138" r="2.2"/><circle class="hole" cx="98" cy="138" r="2.2"/>
      </g>
      <g>
        <rect class="paddle" x="66" y="149" width="48" height="24" rx="5"/>
        <circle class="hole" cx="78" cy="156" r="2.2"/><circle class="hole" cx="88" cy="156" r="2.2"/><circle class="hole" cx="98" cy="156" r="2.2"/>
        <circle class="hole" cx="78" cy="165" r="2.2"/><circle class="hole" cx="88" cy="165" r="2.2"/><circle class="hole" cx="98" cy="165" r="2.2"/>
      </g>
    </g>

    <!-- Bloque de paletas derechas -->
    <g class="paddles-right">
      <g>
        <rect class="paddle" x="206" y="67" width="48" height="24" rx="5"/>
        <circle class="hole" cx="218" cy="74" r="2.2"/><circle class="hole" cx="228" cy="74" r="2.2"/><circle class="hole" cx="238" cy="74" r="2.2"/>
        <circle class="hole" cx="218" cy="83" r="2.2"/><circle class="hole" cx="228" cy="83" r="2.2"/><circle class="hole" cx="238" cy="83" r="2.2"/>
      </g>
      <g>
        <rect class="paddle" x="206" y="94" width="48" height="24" rx="5"/>
        <circle class="hole" cx="218" cy="101" r="2.2"/><circle class="hole" cx="228" cy="101" r="2.2"/><circle class="hole" cx="238" cy="101" r="2.2"/>
        <circle class="hole" cx="218" cy="110" r="2.2"/><circle class="hole" cx="228" cy="110" r="2.2"/><circle class="hole" cx="238" cy="110" r="2.2"/>
      </g>
      <g>
        <rect class="paddle" x="206" y="122" width="48" height="24" rx="5"/>
        <circle class="hole" cx="218" cy="129" r="2.2"/><circle class="hole" cx="228" cy="129" r="2.2"/><circle class="hole" cx="238" cy="129" r="2.2"/>
        <circle class="hole" cx="218" cy="138" r="2.2"/><circle class="hole" cx="228" cy="138" r="2.2"/><circle class="hole" cx="238" cy="138" r="2.2"/>
      </g>
      <g>
        <rect class="paddle" x="206" y="149" width="48" height="24" rx="5"/>
        <circle class="hole" cx="218" cy="156" r="2.2"/><circle class="hole" cx="228" cy="156" r="2.2"/><circle class="hole" cx="238" cy="156" r="2.2"/>
        <circle class="hole" cx="218" cy="165" r="2.2"/><circle class="hole" cx="228" cy="165" r="2.2"/><circle class="hole" cx="238" cy="165" r="2.2"/>
      </g>
    </g>

    <!-- Motor central -->
    <rect class="motor" x="122" y="78" width="76" height="84" rx="12"/>
    <rect x="130" y="86" width="60" height="68" rx="8" fill="#1674cc" stroke="#0a4387"/>
    <circle cx="160" cy="120" r="19" fill="#0b5da8" stroke="#062f67" stroke-width="2"/>
    <circle cx="160" cy="120" r="6" fill="#9fc8ef"/>
    <path d="M160 101v38M141 120h38M147 107l26 26M173 107l-26 26" stroke="#b8dcff" stroke-width="2" opacity=".65"/>

    <!-- Tornillería eléctrica -->
    <g class="bolt">
      <circle cx="132" cy="88" r="3"/>
      <circle cx="188" cy="88" r="3"/>
      <circle cx="132" cy="152" r="3"/>
      <circle cx="188" cy="152" r="3"/>
    </g>

    <!-- Pin indicador led -->
    <circle class="status" cx="160" cy="22" r="7"/>
  </g>`;

// Tamaño pequeño y fijo en píxeles para que quepa cómodamente dentro de una piscina
// en el zoom por defecto del mapa (18). viewBox original es 300x240 (aspecto 1.25:1).
const ANCHO = 30;
const ALTO = Math.round(ANCHO * (240 / 300));

export function aireadorSvgIcon(estado: EstadoEquipo, seleccionado = false) {
  const clase = claseEstado[estado];
  const html = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO}" height="${ALTO}" viewBox="0 0 300 240"
         style="overflow:visible;filter:drop-shadow(0 0 2px #070F0D) drop-shadow(0 0 2px #070F0D)${seleccionado ? ';filter:drop-shadow(0 0 3px #EAF4F1) drop-shadow(0 0 2px #070F0D)' : ''}">
      ${SVG_INNER.replace('class="aerador running"', `class="aerador ${clase}"`)}
    </svg>
  `;
  return divIcon({
    className: '',
    html,
    iconSize: [ANCHO, ALTO],
    iconAnchor: [ANCHO / 2, ALTO / 2],
  });
}
