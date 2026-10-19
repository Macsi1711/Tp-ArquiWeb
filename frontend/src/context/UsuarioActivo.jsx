import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api/client.js';

const CLAVE_STORAGE = 'nutritrack.usuarioActivoId';
const UsuarioActivoContext = createContext(null);

function leerIdGuardado() {
  try {
    return Number(localStorage.getItem(CLAVE_STORAGE)) || null;
  } catch {
    return null;
  }
}

export function UsuarioActivoProvider({ children }) {
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioActivoId, setUsuarioActivoId] = useState(leerIdGuardado);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  const recargarUsuarios = useCallback(async () => {
    try {
      setUsuarios(await api.usuarios.listar());
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    recargarUsuarios();
  }, [recargarUsuarios]);

  const usuarioActivo = usuarios.find((u) => u.id === usuarioActivoId) ?? usuarios[0] ?? null;

  useEffect(() => {
    try {
      if (usuarioActivo) localStorage.setItem(CLAVE_STORAGE, String(usuarioActivo.id));
    } catch {
    }
  }, [usuarioActivo]);

  const valor = useMemo(
    () => ({ usuarios, usuarioActivo, setUsuarioActivoId, recargarUsuarios, cargando, error }),
    [usuarios, usuarioActivo, recargarUsuarios, cargando, error],
  );

  return <UsuarioActivoContext.Provider value={valor}>{children}</UsuarioActivoContext.Provider>;
}

export function useUsuarioActivo() {
  const contexto = useContext(UsuarioActivoContext);
  if (!contexto) throw new Error('useUsuarioActivo debe usarse dentro de UsuarioActivoProvider');
  return contexto;
}
