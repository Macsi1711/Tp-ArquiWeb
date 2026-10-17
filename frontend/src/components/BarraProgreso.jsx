import { fmt } from '../utils/formato.js';

/** Barra de avance consumido/objetivo. Pasado el 100% se marca como excedida. */
export default function BarraProgreso({ etiqueta, consumido, objetivo, porcentaje, unidad, color, ocultarEtiqueta = false }) {
  const excedido = porcentaje > 100;
  return (
    <div className="progreso">
      <div className="progreso__texto">
        {!ocultarEtiqueta && <span className="progreso__etiqueta">{etiqueta}</span>}
        <span>
          <strong>{fmt(consumido)}</strong> / {fmt(objetivo)} {unidad}
        </span>
      </div>
      <div
        className={`progreso__pista${excedido ? ' progreso__pista--excedida' : ''}`}
        role="progressbar"
        aria-label={etiqueta}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(Math.round(porcentaje), 100)}
        aria-valuetext={`${fmt(porcentaje)}% del objetivo`}
      >
        <div className="progreso__relleno" style={{ width: `${Math.min(porcentaje, 100)}%`, background: color }} />
      </div>
    </div>
  );
}
