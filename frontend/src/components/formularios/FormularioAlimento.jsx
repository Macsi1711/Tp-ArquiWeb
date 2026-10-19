import { useFormulario, aNumero } from '../../hooks/useFormulario.js';
import Campo from './Campo.jsx';
import Mensaje from '../Mensaje.jsx';

const VACIO = { nombre: '', categoria: '', calorias: '', proteinas: '', grasas: '', carbohidratos: '' };
const NUMERICOS = [
  { campo: 'calorias', etiqueta: 'Calorías (kcal)' },
  { campo: 'proteinas', etiqueta: 'Proteínas (g)' },
  { campo: 'grasas', etiqueta: 'Grasas (g)' },
  { campo: 'carbohidratos', etiqueta: 'Carbohidratos (g)' },
];

export default function FormularioAlimento({ alimento, categorias, onGuardar, onCancelar }) {
  const { valores, cambiar, errores, errorGeneral, enviando, enviar } = useFormulario(alimento ?? VACIO, onGuardar);

  const aDatos = (v) => ({
    nombre: v.nombre,
    categoria: v.categoria,
    ...Object.fromEntries(NUMERICOS.map(({ campo }) => [campo, aNumero(v[campo])])),
  });

  return (
    <form className="formulario" onSubmit={(e) => enviar(e, aDatos)} noValidate>
      <Mensaje>{errorGeneral}</Mensaje>
      <Campo etiqueta="Nombre" error={errores.nombre}>
        {(props) => <input {...props} value={valores.nombre} onChange={cambiar('nombre')} required autoFocus />}
      </Campo>
      <Campo etiqueta="Categoría" error={errores.categoria}>
        {(props) => (
          <>
            <input {...props} list="categorias-alimentos" value={valores.categoria} onChange={cambiar('categoria')} required />
            <datalist id="categorias-alimentos">
              {categorias.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </>
        )}
      </Campo>

      <fieldset className="formulario__grupo">
        <legend>Valores nutricionales cada 100 g</legend>
        <div className="grilla-campos">
          {NUMERICOS.map(({ campo, etiqueta }) => (
            <Campo key={campo} etiqueta={etiqueta} error={errores[campo]}>
              {(props) => (
                <input
                  {...props}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.1"
                  value={valores[campo]}
                  onChange={cambiar(campo)}
                  required
                />
              )}
            </Campo>
          ))}
        </div>
      </fieldset>

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
