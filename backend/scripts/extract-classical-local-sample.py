"""Prepare one original long problem, keeping only problem 9.3 and its answers.
Requires pypdf, pypdfium2 and reportlab. Crops are original page images, not rewritten text.
"""
from pathlib import Path
from io import BytesIO
from pypdf import PdfReader, PdfWriter
import pypdfium2 as pdfium
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
folder=Path(__file__).resolve().parents[2]/'tmp'/'classical-import'
original=folder/'thermodynamique-original.pdf'
reader=PdfReader(original)
render=pdfium.PdfDocument(str(original))
assert 'Cycle avec régénération' in reader.pages[268].extract_text()
assert '9.3 La vapeur' in reader.pages[270].extract_text()
def cropped_page(number,box):
    # Coordinates measured in PDF points from the top-left of the original page.
    image=render[number-1].render(scale=3).to_pil()
    image=image.crop(tuple(round(x*3) for x in box))
    data=BytesIO();c=canvas.Canvas(data,pagesize=(595.28,841.89))
    width=440; height=width*image.height/image.width
    if height>700:width*=700/height;height=700
    c.drawImage(ImageReader(image),(595.28-width)/2,800-height,width=width,height=height)
    c.save();data.seek(0)
    return PdfReader(data).pages[0]
for name,first,following in [('enonce',cropped_page(269,(316,557,541,804)),[270,313,318,319,4,328]),('correction',cropped_page(271,(68,537,302,802)),[260,264,4,328])]:
    writer=PdfWriter();writer.add_page(first)
    for page in following:writer.add_page(reader.pages[page-1])
    writer.add_metadata({'/Title':'Cycle avec régénération — '+name,'/Author':'Olivier Cleynen','/Subject':'Problème 9.3 de Thermodynamique de l’ingénieur. Extrait recadré, sans réécriture. CC BY-SA 4.0. https://thermodynamique.fr/'})
    with (folder/(name+'.pdf')).open('wb') as output:writer.write(output)
    doc=pdfium.PdfDocument(str(folder/(name+'.pdf')))
    for page in range(min(2,len(doc))):doc[page].render(scale=1).to_pil().save(str(folder/(name+'-'+str(page+1)+'.png')))
    print(name,len(doc),'pages')
