import { Fragment, useState } from 'react';
import { LatLngExpression, divIcon } from 'leaflet';
import {
  CircleMarker,
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  TileLayer,
  Tooltip,
  useMapEvents,
} from 'react-leaflet';
import { useCamaroneraStore } from '../store/useCamaroneraStore';
import { aireadorSvgIcon } from './aireadorIcon';
import type { Piscina } from '../models/types';

function verticeIcon() {
  return divIcon({
    className: '',
    html: `<div style="width:12px;height:12px;border-radius:2px;background:#EAF4F1;border:2px solid #070F0D;cursor:grab"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

/** Captura clics del mapa y los enruta según el modo activo */
function CapturaClics() {
  const modo = useCamaroneraStore((s) => s.modo);
  const seleccionId = useCamaroneraStore((s) => s.seleccionId);
  const agregarPuntoTemp = useCamaroneraStore((s) => s.agregarPuntoTemp);
  const agregarAireador = useCamaroneraStore((s) => s.agregarAireador);
  const agregarVertice = useCamaroneraStore((s) => s.agregarVertice);

  useMapEvents({
    click(e) {
      const punto: [number, number] = [e.latlng.lat, e.latlng.lng];
      if (modo === 'dibujar-piscina') {
        agregarPuntoTemp(punto);
      } else if (modo === 'agregar-aireador' && seleccionId) {
        agregarAireador(seleccionId, punto);
      } else if (modo === 'editar-piscina' && seleccionId) {
        agregarVertice(seleccionId, punto);
      }
    },
  });
  return null;
}

/**
 * Una piscina en el mapa. El polígono es INVISIBLE por defecto (solo se ve
 * el nombre flotando sobre el satélite) — se resalta apenas al pasar el
 * cursor (para saber dónde hacer clic) y se marca por completo solo cuando
 * está en modo edición.
 */
function PiscinaCapa({ piscina }: { piscina: Piscina }) {
  const seleccionId = useCamaroneraStore((s) => s.seleccionId);
  const seleccionar = useCamaroneraStore((s) => s.seleccionar);
  const modo = useCamaroneraStore((s) => s.modo);
  const eliminarAireador = useCamaroneraStore((s) => s.eliminarAireador);
  const moverVertice = useCamaroneraStore((s) => s.moverVertice);
  const eliminarVertice = useCamaroneraStore((s) => s.eliminarVertice);
  const moverAireador = useCamaroneraStore((s) => s.moverAireador);
  const [hover, setHover] = useState(false);

  const seleccionada = piscina.id === seleccionId;
  const editandoForma = seleccionada && modo === 'editar-piscina';
  const contextoAireadores = seleccionada && (modo === 'agregar-aireador' || modo === 'mover-aireador');
  const moviendoAireadores = seleccionada && modo === 'mover-aireador';

  const estilo = editandoForma
    ? { color: '#EAF4F1', weight: 3, fillColor: '#2DD4BF', fillOpacity: 0.3 }
    : contextoAireadores
      ? { color: '#5EEAD4', weight: 2, fillColor: '#2DD4BF', fillOpacity: 0.1, dashArray: '6 4' }
      : hover
        ? { color: '#5EEAD4', weight: 1.5, fillColor: '#2DD4BF', fillOpacity: 0.12 }
        : { color: 'transparent', weight: 0, fillColor: 'transparent', fillOpacity: 0 };

  return (
    <Fragment>
      <Polygon
        positions={piscina.poligono}
        eventHandlers={{
          click: () => modo === 'ver' && seleccionar(piscina.id),
          mouseover: () => modo === 'ver' && setHover(true),
          mouseout: () => setHover(false),
        }}
        pathOptions={estilo}
      >
        <Tooltip direction="center" permanent className="!border-0 !bg-transparent !shadow-none">
          <span className="font-display text-xs font-semibold text-ink-100" style={{ textShadow: '0 1px 3px #000, 0 0 8px #000' }}>
            {piscina.nombre}
          </span>
        </Tooltip>
      </Polygon>

      {editandoForma &&
        piscina.poligono.map((punto, i) => (
          <Marker
            key={i}
            position={punto}
            icon={verticeIcon()}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const ll = e.target.getLatLng();
                moverVertice(piscina.id, i, [ll.lat, ll.lng]);
              },
              contextmenu: (e) => {
                e.originalEvent.preventDefault();
                eliminarVertice(piscina.id, i);
              },
            }}
          />
        ))}

      {piscina.aireadores.map((a) => (
        <Marker
          key={a.id}
          position={[a.lat, a.lng]}
          icon={aireadorSvgIcon(a.estado, seleccionada)}
          draggable={moviendoAireadores}
          eventHandlers={{
            click: (e) => {
              e.originalEvent.stopPropagation();
              if (modo === 'ver') seleccionar(piscina.id);
            },
            dragend: (e) => {
              const ll = e.target.getLatLng();
              moverAireador(piscina.id, a.id, [ll.lat, ll.lng]);
            },
            contextmenu: (e) => {
              e.originalEvent.preventDefault();
              if (!moviendoAireadores) eliminarAireador(piscina.id, a.id);
            },
          }}
        >
          <Tooltip direction="top" offset={[0, -14]}>
            Aireador {a.hp} HP · {a.estado === 'ok' ? 'operando' : a.estado === 'advertencia' ? 'apagado' : 'alarma'}
            {!moviendoAireadores && ' · clic derecho para borrar'}
          </Tooltip>
        </Marker>
      ))}
    </Fragment>
  );
}

export default function CamaroneraMap() {
  const camaronera = useCamaroneraStore((s) => s.camaronera);
  const modo = useCamaroneraStore((s) => s.modo);
  const puntosTemp = useCamaroneraStore((s) => s.puntosTemp);

  const center: LatLngExpression = camaronera.centro;

  return (
    <MapContainer
      center={center}
      zoom={18}
      maxZoom={21}
      zoomControl={true}
      className="h-full w-full rounded-lg"
      attributionControl={true}
      style={{ cursor: modo !== 'ver' ? 'crosshair' : undefined }}
    >
      {/* Esri World Imagery: satelital gratuita, sin API key */}
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution="Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics"
        maxNativeZoom={19}
        maxZoom={21}
      />

      <CapturaClics />

      {camaronera.piscinas.map((piscina) => (
        <PiscinaCapa key={piscina.id} piscina={piscina} />
      ))}

      {/* Piscina en construcción */}
      {puntosTemp.length > 0 && (
        <>
          <Polyline positions={puntosTemp} pathOptions={{ color: '#EAF4F1', weight: 2, dashArray: '4 4' }} />
          {puntosTemp.map((p, i) => (
            <CircleMarker
              key={i}
              center={p}
              radius={4}
              pathOptions={{ color: '#EAF4F1', fillColor: '#EAF4F1', fillOpacity: 1 }}
            />
          ))}
        </>
      )}
    </MapContainer>
  );
}
