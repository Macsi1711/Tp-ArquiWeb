import { Link } from 'react-router-dom';
import { api } from '../api/client.js';
import { useCarga } from '../hooks/useCarga.js';
import { useFechaEnUrl } from '../hooks/useFechaEnUrl.js';
import RequiereUsuario from '../components/RequiereUsuario.jsx';
import NavegadorFecha from '../components/NavegadorFecha.jsx';
import BarraProgreso from '../components/BarraProgreso.jsx';
import Mensaje from '../components/Mensaje.jsx';
import { MACROS, etiquetaTipoComida } from '../utils/constantes.js';
import { fechaLarga } from '../utils/fecha.js';
import { fmt, kcal } from '../utils/formato.js';

const METRICAS = [
  { clave: 'calorias', etiqueta: 'Calorías', unidad: 'kcal', color: 'var(--color-calorias)' },
  { clave: 'proteinas', etiqueta: 'Proteínas', unidad: 'g', color: 'var(--color-proteinas)' },
  { clave: 'grasas', etiqueta: 'Grasas', unidad: 'g', color: 'var(--color-grasas)' },
  { clave: 'carbohidratos', etiqueta: 'Carbohidratos', unidad: 'g', color: 'var(--color-carbohidratos)' },
  { clave: 'aguaMl', etiqueta: 'Agua', unidad: 'ml', color: 'var(--color-agua)' },
];

export default function ReporteDiario() {
  return <RequiereUsuario>{(usuario) => <Reporte key={usuario.id} usuario={usuario} />}</RequiereUsuario>;
}

function Reporte({ usuario }) {
  const [fecha, setFecha] = useFechaEnUrl();
  const { datos: r, cargando, error } = useCarga(() => api.reportes.resumenDiario(usuario.id, fecha), [usuario.id, fecha]);

  return (
    <>
      <div className="encabezado-pagina">
        <div>
          <h1>Resumen diario vs. objetivo</h1>
          <p className="subtitulo">
            {usuario.nombre} · <span className="capitalizar">{fechaLarga(fecha)}</span>
          </p>
        </div>
        <div className="acciones-encabezado no-imprimir">
          <Link className="boton boton--secundario" to={`/?fecha=${fecha}`}>
            Ir al diario
          </Link>
          <button type="button" className="boton" onClick={() => window.print()}>
            Imprimir
          </button>
        </div>
      </div>

      <div className="no-imprimir">
        <NavegadorFecha fecha={fecha} onCambiar={setFecha} />
      </div>

      {error && <Mensaje>{error.message}</Mensaje>}
      {cargando && !r && <p className="cargando">Generando reporte…</p>}

      {r && (
        <div className={`reporte${cargando ? ' reporte--actualizando' : ''}`}>
          {r.cantidadRegistros.comidas === 0 && r.cantidadRegistros.agua === 0 && (
            <Mensaje tipo="info">No hay registros para este día.</Mensaje>
          )}

          <section className="grilla-metricas" aria-label="Avance de objetivos">
            {METRICAS.map((m) => (
              <TarjetaMetrica key={m.clave} metrica={m} reporte={r} />
            ))}
          </section>

          <div className="reporte__fila">
            <section className="tarjeta" aria-labelledby="titulo-distribucion">
              <h2 id="titulo-distribucion">Distribución calórica por macronutriente</h2>
              <p className="texto-tenue">Porcentaje de las calorías aportadas por cada macro (4 / 9 / 4 kcal por gramo).</p>
              <div className="barra-apilada" role="img" aria-label={MACROS.map((m) => `${m.etiqueta} ${fmt(r.distribucionCalorica[m.clave])}%`).join(', ')}>
                {MACROS.map((m) => (
                  <div
                    key={m.clave}
                    className={`barra-apilada__segmento segmento--${m.clave}`}
                    style={{ width: `${r.distribucionCalorica[m.clave]}%` }}
                  />
                ))}
              </div>
              <ul className="leyenda">
                {MACROS.map((m) => (
                  <li key={m.clave}>
                    <span className={`leyenda__color segmento--${m.clave}`} aria-hidden="true" />
                    {m.etiqueta}: <strong>{fmt(r.distribucionCalorica[m.clave])}%</strong>
                  </li>
                ))}
              </ul>
            </section>

            <section className="tarjeta" aria-labelledby="titulo-por-comida">
              <h2 id="titulo-por-comida">Aporte por comida</h2>
              <div className="tabla-scroll">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th scope="col">Comida</th>
                      <th scope="col" className="num">kcal</th>
                      <th scope="col" className="num">% del día</th>
                      <th scope="col" className="num">P (g)</th>
                      <th scope="col" className="num">G (g)</th>
                      <th scope="col" className="num">C (g)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.porTipoComida.map((t) => (
                      <tr key={t.tipoComida} className={t.cantidadRegistros === 0 ? 'fila--vacia' : undefined}>
                        <th scope="row">{etiquetaTipoComida(t.tipoComida)}</th>
                        <td className="num">{fmt(t.calorias)}</td>
                        <td className="num">{fmt(t.porcentajeCalorias)}%</td>
                        <td className="num">{fmt(t.proteinas)}</td>
                        <td className="num">{fmt(t.grasas)}</td>
                        <td className="num">{fmt(t.carbohidratos)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <th scope="row">Total</th>
                      <td className="num">{fmt(r.consumido.calorias)}</td>
                      <td className="num">{r.consumido.calorias > 0 ? '100%' : '0%'}</td>
                      <td className="num">{fmt(r.consumido.proteinas)}</td>
                      <td className="num">{fmt(r.consumido.grasas)}</td>
                      <td className="num">{fmt(r.consumido.carbohidratos)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}

function TarjetaMetrica({ metrica, reporte }) {
  const { clave, etiqueta, unidad, color } = metrica;
  const restante = reporte.restante[clave];
  const porcentaje = reporte.porcentaje[clave];
  const estado = porcentaje > 110 ? 'excedido' : porcentaje >= 90 ? 'cumplido' : 'pendiente';
  const valor = (v) => (clave === 'calorias' ? kcal(v) : `${fmt(v)} ${unidad}`);

  return (
    <article className={`tarjeta metrica metrica--${estado}`}>
      <h2 className="metrica__titulo">{etiqueta}</h2>
      <p className="metrica__porcentaje">{fmt(porcentaje)}%</p>
      <BarraProgreso
        etiqueta={`${etiqueta}: consumo respecto del objetivo`}
        ocultarEtiqueta
        consumido={reporte.consumido[clave]}
        objetivo={reporte.objetivo[clave]}
        porcentaje={porcentaje}
        unidad={unidad}
        color={color}
      />
      <p className="metrica__estado">
        {restante >= 0 ? <>Faltan <strong>{valor(restante)}</strong></> : <>Excedido por <strong>{valor(-restante)}</strong></>}
      </p>
    </article>
  );
}
