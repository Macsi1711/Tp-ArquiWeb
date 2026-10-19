import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { useCarga } from '../hooks/useCarga.js';
import Modal from '../components/Modal.jsx';
import Mensaje from '../components/Mensaje.jsx';
import FormularioAlimento from '../components/FormularioAlimento.jsx';
import { fmt } from '../utils/formato.js';

export default function Alimentos() {
  const [busqueda, setBusqueda] = useState('');
  const [q, setQ] = useState('');
  const [categoria, setCategoria] = useState('');
  const [edicion, setEdicion] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setQ(busqueda.trim()), 250);
    return () => clearTimeout(t);
  }, [busqueda]);

  const alimentos = useCarga(() => api.alimentos.listar({ q, categoria }), [q, categoria]);
  const categorias = useCarga(() => api.alimentos.categorias(), []);

  async function guardar(datos) {
    const esNuevo = !edicion.id;
    const guardado = esNuevo ? await api.alimentos.crear(datos) : await api.alimentos.actualizar(edicion.id, datos);
    setEdicion(null);
    setMensaje({ tipo: 'exito', texto: `"${guardado.nombre}" ${esNuevo ? 'creado' : 'actualizado'} correctamente.` });
    await Promise.all([alimentos.recargar(), categorias.recargar()]);
  }

  async function eliminar(alimento) {
    if (!window.confirm(`¿Eliminar "${alimento.nombre}" del catálogo?`)) return;
    try {
      await api.alimentos.eliminar(alimento.id);
      setMensaje({ tipo: 'exito', texto: `"${alimento.nombre}" eliminado.` });
      await Promise.all([alimentos.recargar(), categorias.recargar()]);
    } catch (err) {
      setMensaje({ tipo: 'error', texto: err.message });
    }
  }

  const lista = alimentos.datos ?? [];

  return (
    <>
      <div className="encabezado-pagina">
        <div>
          <h1>Alimentos</h1>
          <p className="subtitulo">Catálogo de alimentos con sus valores nutricionales cada 100 g.</p>
        </div>
        <button type="button" className="boton" onClick={() => setEdicion({})}>
          + Nuevo alimento
        </button>
      </div>

      <Mensaje tipo={mensaje?.tipo} onCerrar={() => setMensaje(null)}>
        {mensaje?.texto}
      </Mensaje>

      <section className="tarjeta">
        <form className="filtros" role="search" onSubmit={(e) => e.preventDefault()}>
          <div className="campo">
            <label htmlFor="buscar-alimento">Buscar</label>
            <input
              id="buscar-alimento"
              type="search"
              placeholder="Ej.: pollo"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <div className="campo">
            <label htmlFor="filtro-categoria">Categoría</label>
            <select id="filtro-categoria" value={categoria} onChange={(e) => setCategoria(e.target.value)}>
              <option value="">Todas</option>
              {(categorias.datos ?? []).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </form>

        {alimentos.error && <Mensaje>{alimentos.error.message}</Mensaje>}

        <div className="tabla-scroll">
          <table className="tabla">
            <caption className="solo-lectores">Catálogo de alimentos</caption>
            <thead>
              <tr>
                <th scope="col">Nombre</th>
                <th scope="col">Categoría</th>
                <th scope="col" className="num">kcal</th>
                <th scope="col" className="num">Proteínas (g)</th>
                <th scope="col" className="num">Grasas (g)</th>
                <th scope="col" className="num">Carbohidratos (g)</th>
                <th scope="col"><span className="solo-lectores">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((a) => (
                <tr key={a.id}>
                  <th scope="row">{a.nombre}</th>
                  <td>
                    <span className="etiqueta">{a.categoria}</span>
                  </td>
                  <td className="num">{fmt(a.calorias)}</td>
                  <td className="num">{fmt(a.proteinas)}</td>
                  <td className="num">{fmt(a.grasas)}</td>
                  <td className="num">{fmt(a.carbohidratos)}</td>
                  <td className="acciones">
                    <button type="button" className="boton boton--enlace" onClick={() => setEdicion(a)}>
                      Editar
                    </button>
                    <button type="button" className="boton boton--enlace boton--peligro" onClick={() => eliminar(a)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!alimentos.cargando && lista.length === 0 && <p className="texto-tenue">No hay alimentos que coincidan.</p>}
        <p className="texto-tenue">{lista.length} alimento(s)</p>
      </section>

      <Modal abierto={Boolean(edicion)} titulo={edicion?.id ? 'Editar alimento' : 'Nuevo alimento'} onCerrar={() => setEdicion(null)}>
        {edicion && (
          <FormularioAlimento
            alimento={edicion.id ? edicion : null}
            categorias={categorias.datos ?? []}
            onGuardar={guardar}
            onCancelar={() => setEdicion(null)}
          />
        )}
      </Modal>
    </>
  );
}
