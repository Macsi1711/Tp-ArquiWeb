import { useCallback, useEffect, useRef, useState } from 'react';

export function useCarga(cargar, deps) {
  const [estado, setEstado] = useState({ datos: null, cargando: true, error: null });
  const ultimaCarga = useRef(0);

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
