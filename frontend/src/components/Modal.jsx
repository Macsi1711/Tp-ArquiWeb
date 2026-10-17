import { useEffect, useRef } from 'react';

/** Diálogo modal accesible basado en el elemento nativo <dialog>. */
export default function Modal({ abierto, titulo, onCerrar, children }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (abierto && !dialog.open) dialog.showModal();
    if (!abierto && dialog.open) dialog.close();
  }, [abierto]);

  return (
    <dialog ref={ref} className="modal" aria-labelledby="modal-titulo" onCancel={onCerrar} onClose={onCerrar}>
      <header className="modal__cabecera">
        <h2 id="modal-titulo">{titulo}</h2>
        <button type="button" className="boton boton--icono" onClick={onCerrar} aria-label="Cerrar">
          ×
        </button>
      </header>
      {abierto && children}
    </dialog>
  );
}
