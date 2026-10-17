import { fechaLarga, hoy, sumarDias } from '../utils/fecha.js';

export default function NavegadorFecha({ fecha, onCambiar }) {
  const esHoy = fecha === hoy();
  return (
    <div className="nav-fecha" role="group" aria-label="Seleccionar día">
      <button type="button" className="boton boton--secundario" onClick={() => onCambiar(sumarDias(fecha, -1))}>
        <span aria-hidden="true">←</span> Día anterior
      </button>
      <div className="nav-fecha__centro">
        <input
          type="date"
          value={fecha}
          max={hoy()}
          onChange={(e) => e.target.value && onCambiar(e.target.value)}
          aria-label="Fecha"
        />
        <span className="nav-fecha__larga">{esHoy ? 'Hoy' : fechaLarga(fecha)}</span>
      </div>
      <button
        type="button"
        className="boton boton--secundario"
        onClick={() => onCambiar(sumarDias(fecha, 1))}
        disabled={esHoy}
      >
        Día siguiente <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}
