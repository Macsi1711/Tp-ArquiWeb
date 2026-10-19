const { HttpError } = require('../errors');

function recurso(router, path, handlersPorVerbo) {
  const route = router.route(path);
  const permitidos = Object.keys(handlersPorVerbo).map((v) => v.toUpperCase());
  if (permitidos.includes('GET')) permitidos.push('HEAD');
  permitidos.push('OPTIONS');
  const allow = permitidos.join(', ');

  for (const [verbo, handlers] of Object.entries(handlersPorVerbo)) {
    route[verbo](...handlers);
  }

  route.all((req, res, next) => {
    res.set('Allow', allow);
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next(new HttpError(405, `El método ${req.method} no está permitido en ${req.baseUrl}${req.route.path}`));
  });
}

module.exports = { recurso };
