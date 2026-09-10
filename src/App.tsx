import Header from './components/Header';
import EditorToolbar from './components/EditorToolbar';
import PiscinaPanel from './components/PiscinaPanel';
import CamaroneraMap from './maps/CamaroneraMap';
import { useCamaroneraStore } from './store/useCamaroneraStore';

export default function App() {
  const camaronera = useCamaroneraStore((s) => s.camaronera);
  const seleccionId = useCamaroneraStore((s) => s.seleccionId);
  const piscinaSeleccionada = camaronera.piscinas.find((p) => p.id === seleccionId) ?? null;

  return (
    <div className="flex h-screen flex-col bg-deep-900">
      <Header nombreCamaronera={camaronera.nombre} centro={camaronera.centro} />
      <div className="px-4 pt-4">
        <EditorToolbar />
      </div>
      <main className="flex flex-1 gap-4 overflow-hidden p-4">
        <div className="flex-1 overflow-hidden rounded-lg border border-panel-border">
          <CamaroneraMap />
        </div>
        <div className="w-80 shrink-0">
          <PiscinaPanel piscina={piscinaSeleccionada} />
        </div>
      </main>
    </div>
  );
}
