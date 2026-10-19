import { Link } from 'react-router-dom';
import { useUsuarioActivo } from '../context/UsuarioActivo.jsx';
import Mensaje from './Mensaje.jsx';

export default function RequiereUsuario({ children }) {
  const { usuarioActivo, cargando, error } = useUsuarioActivo();
  if (cargando) return <p className="cargando">Cargando perfiles…</p>;
  if (error) return <Mensaje>{error.message}</Mensaje>;
  if (!usuarioActivo) {
    return (
      <section className="tarjeta vacio">
        <h1>Todavía no hay perfiles</h1>
        <p>
          Creá un perfil con tus objetivos diarios para empezar a registrar comidas.{' '}
          <Link to="/perfiles">Ir a Perfiles</Link>
        </p>
      </section>
    );
  }
  return children(usuarioActivo);
}
