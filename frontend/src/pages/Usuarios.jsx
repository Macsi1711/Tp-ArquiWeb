import { useState } from 'react';
import { api } from '../api/client.js';
import { useUsuarioActivo } from '../context/UsuarioActivo.jsx';
import Modal from '../components/Modal.jsx';
import Mensaje from '../components/Mensaje.jsx';
import FormularioUsuario from '../components/FormularioUsuario.jsx';
import { fmt, kcal, ml } from '../utils/formato.js';

export default function Usuarios() {
  const { usuarios, usuarioActivo, setUsuarioActivoId, recargarUsuarios, cargando } = useUsuarioActivo();
  const [edicion, setEdicion] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  async function guardar(datos) {
    const esNuevo = !edicion.id;
    const guardado = esNuevo ? await api.usuarios.crear(datos) : await api.usuarios.actualizar(edicion.id, datos);
    setEdicion(null);
    await recargarUsuarios();
    if (esNuevo) setUsuarioActivoId(guardado.id);
    setMensaje({ tipo: 'exito', texto: `Perfil "${guardado.nombre}" ${esNuevo ? 'creado' : 'actualizado'}.` });
  }

  async function eliminar(usuario) {
    const confirmado = window.confirm(
      `¿Eliminar el perfil de ${usuario.nombre}? También se borrarán todos sus registros de comidas y agua.`,
    );
    if (!confirmado) return;
    try {
      await api.usuarios.eliminar(usuario.id);
      await recargarUsuarios();
      setMensaje({ tipo: 'exito', texto: `Perfil "${usuario.nombre}" eliminado.` });
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    }
  }

  return (
    <>
      <div className="encabezado-pagina">
        <div>
          <h1>Perfiles</h1>
          <p className="subtitulo">Cada perfil tiene sus propios objetivos diarios y registros.</p>
        </div>
        <button type="button" className="boton" onClick={() => setEdicion({})}>
          + Nuevo perfil
        </button>
      </div>

      <Mensaje tipo={mensaje?.tipo} onCerrar={() => setMensaje(null)}>
        {mensaje?.texto}
      </Mensaje>

      {cargando && <p className="cargando">Cargando perfiles…</p>}

      <ul className="grilla-perfiles">
        {usuarios.map((u) => {
          const activo = u.id === usuarioActivo?.id;
          return (
            <li key={u.id}>
              <article className={`tarjeta perfil${activo ? ' perfil--activo' : ''}`}>
                <header>
                  <h2>{u.nombre}</h2>
                  <p className="texto-tenue">{u.email}</p>
                  {activo && <span className="etiqueta etiqueta--activo">Perfil activo</span>}
                </header>
                <dl className="perfil__objetivos">
                  <div>
                    <dt>Calorías</dt>
                    <dd>{kcal(u.objetivoCalorias)}</dd>
                  </div>
                  <div>
                    <dt>Proteínas</dt>
                    <dd>{fmt(u.objetivoProteinas)} g</dd>
                  </div>
                  <div>
                    <dt>Grasas</dt>
                    <dd>{fmt(u.objetivoGrasas)} g</dd>
                  </div>
                  <div>
                    <dt>Carbohidratos</dt>
                    <dd>{fmt(u.objetivoCarbohidratos)} g</dd>
                  </div>
                  <div>
                    <dt>Agua</dt>
                    <dd>{ml(u.objetivoAguaMl)}</dd>
                  </div>
                </dl>
                <footer className="perfil__acciones">
                  {!activo && (
                    <button type="button" className="boton boton--secundario" onClick={() => setUsuarioActivoId(u.id)}>
                      Usar este perfil
                    </button>
                  )}
                  <button type="button" className="boton boton--enlace" onClick={() => setEdicion(u)}>
                    Editar
                  </button>
                  <button type="button" className="boton boton--enlace boton--peligro" onClick={() => eliminar(u)}>
                    Eliminar
                  </button>
                </footer>
              </article>
            </li>
          );
        })}
      </ul>

      <Modal abierto={Boolean(edicion)} titulo={edicion?.id ? 'Editar perfil' : 'Nuevo perfil'} onCerrar={() => setEdicion(null)}>
        {edicion && (
          <FormularioUsuario usuario={edicion.id ? edicion : null} onGuardar={guardar} onCancelar={() => setEdicion(null)} />
        )}
      </Modal>
    </>
  );
}
