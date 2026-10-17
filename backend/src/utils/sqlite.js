const esViolacionUnica = (err) => err?.code === 'SQLITE_CONSTRAINT_UNIQUE';

module.exports = { esViolacionUnica };
