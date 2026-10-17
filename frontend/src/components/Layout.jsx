import { NavLink, Outlet } from 'react-router-dom';
import { useUsuarioActivo } from '../context/UsuarioActivo.jsx';

const SECCIONES = [
  { to: '/', etiqueta: 'Diario', end: true },
  { to: '/reporte', etiqueta: 'Reporte' },
  { to: '/alimentos', etiqueta: 'Alimentos' },
  { to: '/perfiles', etiqueta: 'Perfiles' },
];

export default function Layout() {
  const { usuarios, usuarioActivo, setUsuarioActivoId } = useUsuarioActivo();

  return (
    <>
      <a className="saltar-contenido" href="#contenido">
        Saltar al contenido
      </a>
      <header className="cabecera">
        <div className="contenedor cabecera__interior">
          <NavLink to="/" className="marca" aria-label="NutriTrack, ir al inicio">
            <img src="/favicon.svg" alt="" width="28" height="28" />
            NutriTrack
          </NavLink>

          <nav aria-label="Secciones">
            <ul className="nav">
              {SECCIONES.map((s) => (
                <li key={s.to}>
                  <NavLink to={s.to} end={s.end} className="nav__link">
                    {s.etiqueta}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          {usuarios.length > 0 && (
            <label className="selector-perfil">
              <span>Perfil</span>
              <select value={usuarioActivo?.id ?? ''} onChange={(e) => setUsuarioActivoId(Number(e.target.value))}>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      </header>

      <main id="contenido" className="contenedor principal">
        <Outlet />
      </main>

      <footer className="pie">
        <div className="contenedor">NutriTrack · Trabajo Práctico Integrador · Arquitectura Web · Universidad de Palermo</div>
      </footer>
    </>
  );
}
