import { useMemo } from 'react';
import { useFormulario, aNumero } from '../hooks/useFormulario.js';
import { TIPOS_COMIDA } from '../utils/constantes.js';
import { fmt, kcal } from '../utils/formato.js';
import Campo from './Campo.jsx';
import Mensaje from './Mensaje.jsx';

export default function FormularioComida({ registro, alimentos, onGuardar, onCancelar }) {
  const { valores, cambiar, errores, errorGeneral, enviando, enviar } = useFormulario(
    {
      alimentoId: registro.alimentoId ?? '',
      tipoComida: registro.tipoComida,
      gramos: registro.gramos ?? 100,
      fecha: registro.fecha,
    },
    onGuardar,
  );

  const porCategoria = useMemo(() => {
    const grupos = new Map();
    for (const a of alimentos) {
      if (!grupos.has(a.categoria)) grupos.set(a.categoria, []);
      grupos.get(a.categoria).push(a);
    }
    return [...grupos.entries()].sort(([a], [b]) => a.localeCompare(b, 'es'));
  }, [alimentos]);

  // Vista previa de lo que se va a registrar (el cálculo definitivo lo devuelve la API).
  const alimento = alimentos.find((a) => a.id === Number(valores.alimentoId));
  const factor = (Number(valores.gramos) || 0) / 100;

  const aDatos = (v) => ({
    alimentoId: aNumero(v.alimentoId),
    tipoComida: v.tipoComida,
    gramos: aNumero(v.gramos),
    fecha: v.fecha,
  });

  return (
    <form className="formulario" onSubmit={(e) => enviar(e, aDatos)} noValidate>
      <Mensaje>{errorGeneral}</Mensaje>
      <Campo etiqueta="Alimento" error={errores.alimentoId}>
        {(props) => (
          <select {...props} value={valores.alimentoId} onChange={cambiar('alimentoId')} required autoFocus>
            <option value="">Elegí un alimento…</option>
            {porCategoria.map(([categoria, lista]) => (
              <optgroup key={categoria} label={categoria}>
                {lista.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        )}
      </Campo>
      <div className="grilla-campos">
        <Campo etiqueta="Cantidad (g)" error={errores.gramos}>
          {(props) => (
            <input
              {...props}
              type="number"
              inputMode="decimal"
              min="1"
              step="1"
              value={valores.gramos}
              onChange={cambiar('gramos')}
              required
            />
          )}
        </Campo>
        <Campo etiqueta="Comida" error={errores.tipoComida}>
          {(props) => (
            <select {...props} value={valores.tipoComida} onChange={cambiar('tipoComida')}>
              {TIPOS_COMIDA.map((t) => (
                <option key={t.valor} value={t.valor}>
                  {t.etiqueta}
                </option>
              ))}
            </select>
          )}
        </Campo>
        <Campo etiqueta="Fecha" error={errores.fecha}>
          {(props) => <input {...props} type="date" value={valores.fecha} onChange={cambiar('fecha')} required />}
        </Campo>
      </div>

      {alimento && (
        <output className="vista-previa" aria-live="polite">
          <strong>{kcal(alimento.calorias * factor)}</strong>
          <span>P {fmt(alimento.proteinas * factor)} g</span>
          <span>G {fmt(alimento.grasas * factor)} g</span>
          <span>C {fmt(alimento.carbohidratos * factor)} g</span>
        </output>
      )}

      <div className="formulario__acciones">
        <button type="button" className="boton boton--secundario" onClick={onCancelar}>
          Cancelar
        </button>
        <button type="submit" className="boton" disabled={enviando}>
          {enviando ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}
