import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Ejecuta una carga asíncrona cuando cambian las dependencias y expone
 * datos, estado de carga, error y una función para recargar.
 * Descarta respuestas viejas si llega una carga más nueva.
 */
export function useCarga(cargar, deps) {
  const [estado, setEstado] = useState({ datos: null, cargando: true, error: null });
  const ultimaCarga = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const recargar = useCallback(async () => {
    const id = ++ultimaCarga.current;
    setEstado((e) => ({ ...e, cargando: true, error: null }));
    try {
      const datos = await cargar();
      if (id === ultimaCarga.current) setEstado({ datos, cargando: false, error: null });
    } catch (error) {
      if (id === ultimaCarga.current) setEstado((e) => ({ ...e, cargando: false, error }));
    }
  }, deps);

  useEffect(() => {
    recargar();
  }, [recargar]);

  return { ...estado, recargar };
}
