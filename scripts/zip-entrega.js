const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const LIMITE_BYTES = 3 * 1024 * 1024;
const raiz = path.join(__dirname, '..');
const destino = path.join(raiz, 'TP-ArquiWeb-Barros-NutriTrack.zip');

execFileSync('git', ['archive', '--format=zip', '--prefix=NutriTrack/', '-o', destino, 'HEAD'], {
  cwd: raiz,
  stdio: 'inherit',
});

const { size } = fs.statSync(destino);
console.log(`Generado ${path.basename(destino)} (${(size / 1024).toFixed(1)} KB)`);
if (size > LIMITE_BYTES) {
  console.error('El archivo supera los 3 MB permitidos para la entrega.');
  process.exit(1);
}
