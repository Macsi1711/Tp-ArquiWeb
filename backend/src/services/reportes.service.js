const { redondear } = require('../utils/numeros');
const { TIPOS_COMIDA } = require('../validators/comidas.validator');

const MACROS = ['calorias', 'proteinas', 'grasas', 'carbohidratos'];
// Factores de Atwater: kcal por gramo de cada macronutriente.
const KCAL_POR_GRAMO = { proteinas: 4, grasas: 9, carbohidratos: 4 };

const porcentaje = (parte, total) => (total > 0 ? redondear((parte / total) * 100) : 0);

function sumarMacros(registros) {
  const total = Object.fromEntries(MACROS.map((m) => [m, 0]));
  for (const r of registros) for (const m of MACROS) total[m] += r[m];
  return total;
}

function createReportesService({ comidasRepository, aguaRepository, usuariosService }) {
  return {
    /** Totales del día comparados con los objetivos del usuario. */
    resumenDiario(usuarioId, fecha) {
      const usuario = usuariosService.obtener(usuarioId);
      const comidas = comidasRepository.listar(usuarioId, { fecha });
      const agua = aguaRepository.listar(usuarioId, { fecha });

      const consumidoMacros = sumarMacros(comidas);
      const consumido = {
        ...Object.fromEntries(MACROS.map((m) => [m, redondear(consumidoMacros[m])])),
        aguaMl: agua.reduce((acc, r) => acc + r.cantidadMl, 0),
      };
      const objetivo = {
        calorias: usuario.objetivoCalorias,
        proteinas: usuario.objetivoProteinas,
        grasas: usuario.objetivoGrasas,
        carbohidratos: usuario.objetivoCarbohidratos,
        aguaMl: usuario.objetivoAguaMl,
      };
      const claves = Object.keys(objetivo);

      const kcalMacros = Object.fromEntries(
        Object.entries(KCAL_POR_GRAMO).map(([m, factor]) => [m, consumidoMacros[m] * factor]),
      );
      const kcalTotalMacros = Object.values(kcalMacros).reduce((a, b) => a + b, 0);

      return {
        usuario: { id: usuario.id, nombre: usuario.nombre },
        fecha,
        consumido,
        objetivo,
        porcentaje: Object.fromEntries(claves.map((k) => [k, porcentaje(consumido[k], objetivo[k])])),
        // Negativo indica que se superó el objetivo.
        restante: Object.fromEntries(claves.map((k) => [k, redondear(objetivo[k] - consumido[k])])),
        distribucionCalorica: Object.fromEntries(
          Object.keys(KCAL_POR_GRAMO).map((m) => [m, porcentaje(kcalMacros[m], kcalTotalMacros)]),
        ),
        porTipoComida: TIPOS_COMIDA.map((tipoComida) => {
          const delTipo = comidas.filter((c) => c.tipoComida === tipoComida);
          const suma = sumarMacros(delTipo);
          return {
            tipoComida,
            cantidadRegistros: delTipo.length,
            ...Object.fromEntries(MACROS.map((m) => [m, redondear(suma[m])])),
            porcentajeCalorias: porcentaje(suma.calorias, consumidoMacros.calorias),
          };
        }),
        cantidadRegistros: { comidas: comidas.length, agua: agua.length },
      };
    },
  };
}

module.exports = { createReportesService };
