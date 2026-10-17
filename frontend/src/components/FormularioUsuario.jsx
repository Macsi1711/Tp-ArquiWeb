import { useFormulario, aNumero } from '../hooks/useFormulario.js';
import Campo from './Campo.jsx';
import Mensaje from './Mensaje.jsx';

const VACIO = {
  nombre: '',
  email: '',
  objetivoCalorias: 2000,
  objetivoProteinas: 100,
  objetivoGrasas: 65,
  objetivoCarbohidratos: 250,
  objetivoAguaMl: 2000,
};
const OBJETIVOS = [
  { campo: 'objetivoCalorias', etiqueta: 'Calorías (kcal)', step: 1 },
  { campo: 'objetivoProteinas', etiqueta: 'Proteínas (g)', step: 0.1 },
  { campo: 'objetivoGrasas', etiqueta: 'Grasas (g)', step: 0.1 },
  { campo: 'objetivoCarbohidratos', etiqueta: 'Carbohidratos (g)', step: 0.1 },
  { campo: 'objetivoAguaMl', etiqueta: 'Agua (ml)', step: 50 },
];

export default function FormularioUsuario({ usuario, onGuardar, onCancelar }) {
  const { valores, cambiar, errores, errorGeneral, enviando, enviar } = useFormulario(usuario ?? VACIO, onGuardar);

  const aDatos = (v) => ({
    nombre: v.nombre,
    email: v.email,
    ...Object.fromEntries(OBJETIVOS.map(({ campo }) => [campo, aNumero(v[campo])])),
  });

  return (
    <form className="formulario" onSubmit={(e) => enviar(e, aDatos)} noValidate>
      <Mensaje>{errorGeneral}</Mensaje>
      <Campo etiqueta="Nombre" error={errores.nombre}>
        {(props) => <input {...props} value={valores.nombre} onChange={cambiar('nombre')} autoComplete="name" required autoFocus />}
      </Campo>
      <Campo etiqueta="Email" error={errores.email}>
        {(props) => (
          <input {...props} type="email" value={valores.email} onChange={cambiar('email')} autoComplete="email" required />
        )}
      </Campo>

      <fieldset className="formulario__grupo">
        <legend>Objetivos diarios</legend>
        <div className="grilla-campos">
          {OBJETIVOS.map(({ campo, etiqueta, step }) => (
            <Campo key={campo} etiqueta={etiqueta} error={errores[campo]}>
              {(props) => (
                <input
                  {...props}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step={step}
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
