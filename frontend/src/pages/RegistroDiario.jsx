import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useCarga } from '../hooks/useCarga.js';
import { useFechaEnUrl } from '../hooks/useFechaEnUrl.js';
import RequiereUsuario from '../components/RequiereUsuario.jsx';
import NavegadorFecha from '../components/NavegadorFecha.jsx';
import BarraProgreso from '../components/BarraProgreso.jsx';
import Modal from '../components/Modal.jsx';
import Mensaje from '../components/Mensaje.jsx';
import FormularioComida from '../components/FormularioComida.jsx';
import { TIPOS_COMIDA } from '../utils/constantes.js';
import { fmt, kcal, ml } from '../utils/formato.js';
import { horaLocal } from '../utils/fecha.js';

const VASOS_RAPIDOS = [250, 500, 750];

export default function RegistroDiario() {
  return <RequiereUsuario>{(usuario) => <Diario key={usuario.id} usuario={usuario} />}</RequiereUsuario>;
}

function Diario({ usuario }) {
  const [fecha, setFecha] = useFechaEnUrl();
  const [edicion, setEdicion] = useState(null);
  const [error, setError] = useState(null);
  const [aguaPersonalizada, setAguaPersonalizada] = useState('');

  const alimentos = useCarga(() => api.alimentos.listar(), []);
  const dia = useCarga(async () => {
    const [comidas, agua, resumen] = await Promise.all([
      api.comidas.listar(usuario.id, { fecha }),
      api.agua.listar(usuario.id, { fecha }),
      api.reportes.resumenDiario(usuario.id, fecha),
    ]);
    return { comidas, agua, resumen };
  }, [usuario.id, fecha]);

  async function ejecutar(accion) {
    setError(null);
    try {
      await accion();
      await dia.recargar();
    } catch (err) {
      setError(err.message);
    }
  }

  async function guardarComida(datos) {
    if (edicion.id) await api.comidas.actualizar(usuario.id, edicion.id, datos);
    else await api.comidas.crear(usuario.id, datos);
    setEdicion(null);
    if (datos.fecha !== fecha) setFecha(datos.fecha);
    else await dia.recargar();
  }

  function eliminarComida(registro) {
    if (!window.confirm(`¿Eliminar ${registro.alimento.nombre} (${fmt(registro.gramos)} g)?`)) return;
    ejecutar(() => api.comidas.eliminar(usuario.id, registro.id));
  }

  function agregarAgua(cantidadMl) {
    ejecutar(() => api.agua.crear(usuario.id, { fecha, cantidadMl }));
  }

  function agregarAguaPersonalizada(e) {
    e.preventDefault();
    const cantidad = Number(aguaPersonalizada);
    if (!cantidad) return;
    agregarAgua(cantidad);
    setAguaPersonalizada('');
  }

  const { comidas = [], agua = [], resumen } = dia.datos ?? {};

  return (
    <>
      <div className="encabezado-pagina">
        <div>
          <h1>Diario de {usuario.nombre}</h1>
          <p className="subtitulo">Registrá lo que comés y bebés durante el día.</p>
        </div>
        <Link className="boton boton--secundario" to={`/reporte?fecha=${fecha}`}>
          Ver reporte del día
        </Link>
      </div>

      <NavegadorFecha fecha={fecha} onCambiar={setFecha} />
      <Mensaje onCerrar={() => setError(null)}>{error}</Mensaje>
      {dia.error && <Mensaje>{dia.error.message}</Mensaje>}

      {resumen && (
        <section className="tarjeta resumen-rapido" aria-label="Resumen del día">
          <BarraProgreso
            etiqueta="Calorías"
            consumido={resumen.consumido.calorias}
            objetivo={resumen.objetivo.calorias}
            porcentaje={resumen.porcentaje.calorias}
            unidad="kcal"
            color="var(--color-calorias)"
          />
          <dl className="macros-en-linea">
            {[
              ['Proteínas', 'proteinas'],
              ['Grasas', 'grasas'],
              ['Carbohidratos', 'carbohidratos'],
            ].map(([etiqueta, clave]) => (
              <div key={clave} className={`chip chip--${clave}`}>
                <dt>{etiqueta}</dt>
                <dd>
                  {fmt(resumen.consumido[clave])} / {fmt(resumen.objetivo[clave])} g
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <div className="diario">
        <section className="tarjeta" aria-labelledby="titulo-comidas">
          <div className="tarjeta__cabecera">
            <h2 id="titulo-comidas">Comidas</h2>
            <button
              type="button"
              className="boton"
              onClick={() => setEdicion({ fecha, tipoComida: 'desayuno' })}
              disabled={!alimentos.datos}
            >
              + Agregar comida
            </button>
          </div>

          {dia.cargando && !dia.datos && <p className="cargando">Cargando…</p>}

          {TIPOS_COMIDA.map(({ valor, etiqueta }) => {
            const registros = comidas.filter((c) => c.tipoComida === valor);
            const subtotal = resumen?.porTipoComida.find((t) => t.tipoComida === valor);
            return (
              <section key={valor} className="bloque-comida" aria-labelledby={`tipo-${valor}`}>
                <header className="bloque-comida__cabecera">
                  <h3 id={`tipo-${valor}`}>{etiqueta}</h3>
                  <span className="bloque-comida__subtotal">{kcal(subtotal?.calorias)}</span>
                  <button
                    type="button"
                    className="boton boton--enlace"
                    onClick={() => setEdicion({ fecha, tipoComida: valor })}
                    disabled={!alimentos.datos}
                  >
                    + Agregar<span className="solo-lectores"> a {etiqueta}</span>
                  </button>
                </header>
                {registros.length === 0 ? (
                  <p className="texto-tenue">Sin registros.</p>
                ) : (
                  <div className="tabla-scroll">
                    <table className="tabla">
                      <thead>
                        <tr>
                          <th scope="col">Alimento</th>
                          <th scope="col" className="num">Cantidad</th>
                          <th scope="col" className="num">kcal</th>
                          <th scope="col" className="num">P (g)</th>
                          <th scope="col" className="num">G (g)</th>
                          <th scope="col" className="num">C (g)</th>
                          <th scope="col"><span className="solo-lectores">Acciones</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        {registros.map((r) => (
                          <tr key={r.id}>
                            <th scope="row">{r.alimento.nombre}</th>
                            <td className="num">{fmt(r.gramos)} g</td>
                            <td className="num">{fmt(r.calorias)}</td>
                            <td className="num">{fmt(r.proteinas)}</td>
                            <td className="num">{fmt(r.grasas)}</td>
                            <td className="num">{fmt(r.carbohidratos)}</td>
                            <td className="acciones">
                              <button type="button" className="boton boton--enlace" onClick={() => setEdicion(r)}>
                                Editar
                              </button>
                              <button type="button" className="boton boton--enlace boton--peligro" onClick={() => eliminarComida(r)}>
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            );
          })}
        </section>

        <section className="tarjeta agua" aria-labelledby="titulo-agua">
          <h2 id="titulo-agua">Agua</h2>
          {resumen && (
            <BarraProgreso
              etiqueta="Consumo de agua"
              consumido={resumen.consumido.aguaMl}
              objetivo={resumen.objetivo.aguaMl}
              porcentaje={resumen.porcentaje.aguaMl}
              unidad="ml"
              color="var(--color-agua)"
            />
          )}
          <div className="agua__rapidos">
            {VASOS_RAPIDOS.map((cantidad) => (
              <button key={cantidad} type="button" className="boton boton--agua" onClick={() => agregarAgua(cantidad)}>
                + {cantidad} ml
              </button>
            ))}
          </div>
          <form className="agua__personalizado" onSubmit={agregarAguaPersonalizada}>
            <label htmlFor="agua-ml">Otra cantidad (ml)</label>
            <div className="fila">
              <input
                id="agua-ml"
                type="number"
                min="1"
                max="5000"
                step="1"
                inputMode="numeric"
                value={aguaPersonalizada}
                onChange={(e) => setAguaPersonalizada(e.target.value)}
              />
              <button type="submit" className="boton boton--secundario" disabled={!aguaPersonalizada}>
                Agregar
              </button>
            </div>
          </form>
          {agua.length > 0 ? (
            <ul className="lista-agua">
              {agua.map((r) => (
                <li key={r.id}>
                  <span>{ml(r.cantidadMl)}</span>
                  <time className="texto-tenue">{horaLocal(r.creadoEn)}</time>
                  <button
                    type="button"
                    className="boton boton--icono"
                    aria-label={`Eliminar registro de ${r.cantidadMl} ml`}
                    onClick={() => ejecutar(() => api.agua.eliminar(usuario.id, r.id))}
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="texto-tenue">Todavía no registraste agua este día.</p>
          )}
        </section>
      </div>

      <Modal abierto={Boolean(edicion)} titulo={edicion?.id ? 'Editar comida' : 'Agregar comida'} onCerrar={() => setEdicion(null)}>
        {edicion && (
          <FormularioComida
            registro={edicion}
            alimentos={alimentos.datos ?? []}
            onGuardar={guardarComida}
            onCancelar={() => setEdicion(null)}
          />
        )}
      </Modal>
    </>
  );
}
