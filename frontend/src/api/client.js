// Cliente HTTP de la API REST. Toda la lógica de negocio vive en el backend.

export class ApiError extends Error {
  constructor(status, mensaje, detalles = []) {
    super(mensaje);
    this.status = status;
    this.detalles = detalles;
  }

  /** Errores de validación indexados por nombre de campo del body. */
  get erroresPorCampo() {
    return Object.fromEntries(
      this.detalles.filter((d) => d.campo.startsWith('body.')).map((d) => [d.campo.slice(5), d.mensaje]),
    );
  }
}

function queryString(params = {}) {
  const definidos = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '');
  return definidos.length ? `?${new URLSearchParams(definidos)}` : '';
}

async function request(method, url, body) {
  let res;
  try {
    res = await fetch(`/api${url}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor');
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, data?.error?.mensaje ?? `Error ${res.status}`, data?.error?.detalles);
  }
  return data;
}

const get = (url, params) => request('GET', url + queryString(params));
const post = (url, body) => request('POST', url, body);
const put = (url, body) => request('PUT', url, body);
const del = (url) => request('DELETE', url);

export const api = {
  alimentos: {
    listar: (filtros) => get('/alimentos', filtros),
    categorias: () => get('/alimentos/categorias'),
    crear: (datos) => post('/alimentos', datos),
    actualizar: (id, datos) => put(`/alimentos/${id}`, datos),
    eliminar: (id) => del(`/alimentos/${id}`),
  },
  usuarios: {
    listar: () => get('/usuarios'),
    crear: (datos) => post('/usuarios', datos),
    actualizar: (id, datos) => put(`/usuarios/${id}`, datos),
    eliminar: (id) => del(`/usuarios/${id}`),
  },
  comidas: {
    listar: (usuarioId, filtros) => get(`/usuarios/${usuarioId}/comidas`, filtros),
    crear: (usuarioId, datos) => post(`/usuarios/${usuarioId}/comidas`, datos),
    actualizar: (usuarioId, id, datos) => put(`/usuarios/${usuarioId}/comidas/${id}`, datos),
    eliminar: (usuarioId, id) => del(`/usuarios/${usuarioId}/comidas/${id}`),
  },
  agua: {
    listar: (usuarioId, filtros) => get(`/usuarios/${usuarioId}/agua`, filtros),
    crear: (usuarioId, datos) => post(`/usuarios/${usuarioId}/agua`, datos),
    eliminar: (usuarioId, id) => del(`/usuarios/${usuarioId}/agua/${id}`),
  },
  reportes: {
    resumenDiario: (usuarioId, fecha) => get(`/usuarios/${usuarioId}/reportes/resumen-diario`, { fecha }),
  },
};
