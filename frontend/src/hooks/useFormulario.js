import { useState } from 'react';
import { ApiError } from '../api/client.js';

/**
 * Estado común de los formularios: valores, envío y errores devueltos por la API
 * (la validación de negocio la hace el backend; acá sólo se muestran sus mensajes).
 */
export function useFormulario(valoresIniciales, onGuardar) {
  const [valores, setValores] = useState(valoresIniciales);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState(null);
  const [enviando, setEnviando] = useState(false);

  const cambiar = (campo) => (e) => setValores((v) => ({ ...v, [campo]: e.target.value }));

  async function enviar(e, aDatos) {
    e.preventDefault();
    setEnviando(true);
    setErrores({});
    setErrorGeneral(null);
    try {
      await onGuardar(aDatos(valores));
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.erroresPorCampo).length) {
        setErrores(err.erroresPorCampo);
      } else {
        setErrorGeneral(err.message);
      }
    } finally {
      setEnviando(false);
    }
  }

  return { valores, setValores, cambiar, errores, errorGeneral, enviando, enviar };
}

/** Convierte el valor de un input numérico; vacío se omite para que la API informe que es obligatorio. */
export const aNumero = (valor) => (valor === '' || valor === null ? undefined : Number(valor));
