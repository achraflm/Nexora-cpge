#!/bin/sh
set -eu
mkdir -p /tmp/output
case "$1" in
  TEX)
    pdflatex -no-shell-escape -halt-on-error -interaction=batchmode -output-directory=/tmp/output document.tex > /tmp/compile.log 2>&1
    if grep -q '\\bibdata' /tmp/output/document.aux; then
      (cd /tmp/output && BIBINPUTS=/input: BSTINPUTS=/input: bibtex document) >> /tmp/compile.log 2>&1
    fi
    pdflatex -no-shell-escape -halt-on-error -interaction=batchmode -output-directory=/tmp/output document.tex >> /tmp/compile.log 2>&1
    pdflatex -no-shell-escape -halt-on-error -interaction=batchmode -output-directory=/tmp/output document.tex >> /tmp/compile.log 2>&1
    ;;
  DOC|DOCX|PPT|PPTX)
    extension=$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')
    libreoffice -env:UserInstallation=file:///tmp/lo --headless --convert-to pdf --outdir /tmp/output "/input/document.$extension" > /tmp/compile.log 2>&1
    ;;
  *) exit 2 ;;
esac
test -f /tmp/output/document.pdf
test ! -L /tmp/output/document.pdf
cat /tmp/output/document.pdf
