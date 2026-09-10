// En Fase 1 los datos son estáticos (src/data/camaronera.ts).
// Cuando conectes Supabase (ver arquitectura del Excel: API/Backend -> Supabase
// -> PostgreSQL + Storage), este archivo es el único lugar que debería cambiar:
// las piscinas dejan de venir de un import y empiezan a venir de una consulta.
//
// Ejemplo de forma futura:
//
// import { createClient } from '@supabase/supabase-js';
// const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
// export async function obtenerCamaronera(id: string) {
//   const { data, error } = await supabase.from('piscinas').select('*').eq('camaronera_id', id);
//   ...
// }

import { camaroneraDemo } from '../data/camaronera';
import type { Camaronera } from '../models/types';

export function obtenerCamaronera(): Camaronera {
  return camaroneraDemo;
}
