import { useId } from 'react';

/** Etiqueta + control de formulario + mensaje de error asociado por aria-describedby. */
export default function Campo({ etiqueta, error, ayuda, children, className = '' }) {
  const id = useId();
  const idError = `${id}-error`;
  const control = children({ id, 'aria-invalid': error ? true : undefined, 'aria-describedby': error ? idError : undefined });

  return (
    <div className={`campo ${className}`}>
      <label htmlFor={id}>{etiqueta}</label>
      {control}
      {ayuda && !error && <small className="campo__ayuda">{ayuda}</small>}
      {error && (
        <small id={idError} className="campo__error">
          {error}
        </small>
      )}
    </div>
  );
}
