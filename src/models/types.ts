// Modelos derivados directamente de las 4 categorías de parámetros
// definidas en "Parametros-Fases" del Excel de origen.
//
// A partir de esta versión, las coordenadas son GPS reales (lat, lng) —
// el mapa ya no usa un plano abstracto (CRS.Simple), sino Leaflet estándar
// sobre imágenes satelitales, ubicado en la posición real de la camaronera.

export interface ParametrosAmbientales {
  temperatura: number; // °C
  salinidad: number; // ppt
  ph: number;
  oxigeno: number; // mg/L
  turbidez: number; // cm (disco secchi) o NTU
}

export interface ParametrosProductivos {
  siembra: number; // día del ciclo en que se sembró, día 0
  densidad: number; // camarones / m²
  peso: number; // g, peso promedio actual
  biomasa: number; // kg
  alimento: number; // kg/día
  fcr: number; // factor de conversión alimenticia
  supervivencia: number; // %
  mortalidad: number; // %
}

export interface Aireacion {
  numeroAireadores: number;
  hpPorAireador: number;
  horario: string; // ej. "06:00-22:00"
  consumoElectrico: number; // kWh/día
  eficiencia: number; // %
  oxigenacion: number; // mg/L/h aportado
}

export interface Produccion {
  biomasaFinal: number; // kg
  pesoPromedio: number; // g
  supervivencia: number; // %
  fcr: number;
  kgCosechados: number;
  costo: number; // USD
  ingresos: number; // USD
  rentabilidad: number; // %
}

export type FaseCultivo = 'siembra' | 'crecimiento' | 'engorde' | 'cosecha';

export type EstadoEquipo = 'ok' | 'advertencia' | 'falla';

/** Un aireador colocado físicamente dentro de una piscina, en coordenadas GPS reales */
export interface AireadorPosicion {
  id: string;
  lat: number;
  lng: number;
  hp: number;
  estado: EstadoEquipo;
}

export interface Piscina {
  id: string;
  nombre: string;
  /** Polígono en coordenadas GPS reales [lat, lng] */
  poligono: [number, number][];
  areaHa: number;
  faseCultivo: FaseCultivo;
  diaCiclo: number; // día 0..120+
  ambientales: ParametrosAmbientales;
  productivos: ParametrosProductivos;
  aireacion: Aireacion;
  aireadores: AireadorPosicion[];
  estadoEquipo: EstadoEquipo;
}

export interface Camaronera {
  id: string;
  nombre: string;
  /** Ubicación de referencia de la camaronera (centro del mapa) */
  centro: [number, number];
  piscinas: Piscina[];
}
