import { Link } from 'react-router-dom';

export default function NoEncontrado() {
  return (
    <section className="tarjeta vacio">
      <h1>Página no encontrada</h1>
      <p>
        La dirección no existe. <Link to="/">Volver al diario</Link>
      </p>
    </section>
  );
}
