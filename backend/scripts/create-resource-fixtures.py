"""Create disposable integration documents. Requires python-docx, python-pptx, reportlab."""
from pathlib import Path
import sys

base = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(base / '.test-tools'))
from docx import Document
from pptx import Presentation
from reportlab.pdfgen import canvas

output = base / '.test-fixtures'
output.mkdir(exist_ok=True)
pdf = canvas.Canvas(str(output / 'course.pdf'))
pdf.drawString(72, 760, 'Nexora - Ressource de verification')
pdf.drawString(72, 720, 'Mathematiques - MPSI / SUP')
pdf.showPage()
pdf.drawString(72, 760, 'Page 2 - Exercices')
pdf.save()
doc = Document()
doc.add_heading('Nexora - Cours de verification', 0)
doc.add_paragraph('Mathematiques - MPSI / SUP. Une ressource Word consultable dans le lecteur.')
table = doc.add_table(rows=2, cols=2)
table.cell(0, 0).text = 'Notion'
table.cell(0, 1).text = 'Exemple'
table.cell(1, 0).text = 'Derivee'
table.cell(1, 1).text = "f(x) = x au carre ; f prime(x) = 2x"
doc.save(output / 'course.docx')
slides = Presentation()
for title, text in [('Nexora - Mathematiques', 'MPSI / SUP'), ('Exercices', 'Etudier la fonction f(x) = x au carre.')]:
    slide = slides.slides.add_slide(slides.slide_layouts[1])
    slide.shapes.title.text = title
    slide.placeholders[1].text = text
slides.save(output / 'course.pptx')
(output / 'course.tex').write_text(r'''\documentclass{article}
\usepackage{amsmath}
\begin{document}
\section{Nexora : cours de verification}
MPSI / SUP : Mathematiques.
\[\int_0^1 x^2\,dx = \frac13\]
\newpage
\section{Travaux diriges}
Calculer la derivee de $f(x)=x^2$.
\end{document}
''', encoding='utf-8')
print('Created PDF, DOCX, PPTX and TEX fixtures in', output)
