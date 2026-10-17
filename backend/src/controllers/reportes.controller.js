function createReportesController(reportesService) {
  return {
    resumenDiario(req, res) {
      res.json(reportesService.resumenDiario(req.validated.params.usuarioId, req.validated.query.fecha));
    },
  };
}

module.exports = { createReportesController };
