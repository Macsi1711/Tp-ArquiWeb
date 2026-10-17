#!/usr/bin/env sh
# Genera docs/Documento-TP.pdf a partir de docs/Documento-TP.md.
# Requiere pandoc y Chromium/Chrome instalados (no forma parte del build de la aplicación).
set -e
cd "$(dirname "$0")/../docs"
CHROME="${CHROME:-$(command -v chromium || command -v chromium-browser || command -v google-chrome || echo /opt/pw-browsers/chromium-1194/chrome-linux/chrome)}"
pandoc Documento-TP.md --standalone --embed-resources --css pdf.css -o Documento-TP.html
"$CHROME" --headless --no-sandbox --disable-gpu --no-pdf-header-footer --print-to-pdf=Documento-TP.pdf Documento-TP.html 2>/dev/null
rm Documento-TP.html
echo "Generado docs/Documento-TP.pdf"
