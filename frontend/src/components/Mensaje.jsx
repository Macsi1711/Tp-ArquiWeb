export default function Mensaje({ tipo = 'error', children, onCerrar }) {
  if (!children) return null;
  return (
    <div className={`mensaje mensaje--${tipo}`} role={tipo === 'error' ? 'alert' : 'status'}>
      <span>{children}</span>
      {onCerrar && (
        <button type="button" className="boton boton--icono" onClick={onCerrar} aria-label="Descartar mensaje">
          ×
        </button>
      )}
    </div>
  );
}
