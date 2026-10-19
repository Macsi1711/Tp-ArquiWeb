import { useSearchParams } from 'react-router-dom';
import { hoy } from '../utils/fecha.js';

export function useFechaEnUrl() {
  const [params, setParams] = useSearchParams();
  const valor = params.get('fecha');
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(valor ?? '') ? valor : hoy();
  const setFecha = (nueva) => setParams(nueva === hoy() ? {} : { fecha: nueva });
  return [fecha, setFecha];
}
