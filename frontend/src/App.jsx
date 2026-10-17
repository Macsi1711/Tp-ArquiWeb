import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import RegistroDiario from './pages/RegistroDiario.jsx';
import ReporteDiario from './pages/ReporteDiario.jsx';
import Alimentos from './pages/Alimentos.jsx';
import Usuarios from './pages/Usuarios.jsx';
import NoEncontrado from './pages/NoEncontrado.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<RegistroDiario />} />
        <Route path="reporte" element={<ReporteDiario />} />
        <Route path="alimentos" element={<Alimentos />} />
        <Route path="perfiles" element={<Usuarios />} />
        <Route path="*" element={<NoEncontrado />} />
      </Route>
    </Routes>
  );
}
