"""Download the small approved selection using published URLs only.

No alternate paths, authentication bypass, or retry after an access denial.
Only valid PDF responses are saved. Existing local PDFs are preserved.
"""
import base64
import html
import json
from pathlib import Path
import re
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / 'lib/catalog-sample.json'
DEST = ROOT / 'public/cours'
DEST.mkdir(parents=True, exist_ok=True)
resources = json.loads(CATALOG.read_text(encoding='utf-8'))


def import_resource(resource):
    slug = urllib.parse.urlparse(resource['sourceUrl']).path.strip('/').split('/')[-1]
    filename = f"{resource['subject'].lower()}-{resource['level'].lower()}-{slug}.pdf"
    target = DEST / filename
    local_url = f'/cours/{filename}'
    if target.exists() and target.read_bytes().startswith(b'%PDF-'):
        resource.update(localPdfUrl=local_url, downloadStatus='available')
        return resource
    resource.update(localPdfUrl=None, downloadStatus='unavailable')
    try:
        page = urllib.request.urlopen(resource['sourceUrl'], timeout=30).read().decode()
        # Prefer the explicit public download link if the publisher offers one.
        drive = re.search(r'https://drive.google.com/file/d/([\w-]+)/', page)
        embedded = re.search(r'pdfemb-data=([^"&]+)', page)
        if drive:
            pdf_url = f'https://drive.google.com/uc?export=download&id={drive.group(1)}'
        elif embedded:
            value = embedded.group(1)
            config = json.loads(base64.b64decode(value + '=' * (-len(value) % 4)))
            pdf_url = urllib.parse.unquote(config['pdfemb-serveurl'])
        else:
            links = re.findall(r'(?:href|src)=["\x27]([^"\x27]+\.pdf)["\x27]', page)
            if not links:
                return resource
            pdf_url = urllib.parse.urljoin(resource['sourceUrl'], html.unescape(links[0]))
        resource['pdfSourceUrl'] = pdf_url
        # Quote non-ASCII filenames without changing the published path.
        request_url = urllib.parse.quote(pdf_url, safe=':/?=&%')
        with urllib.request.urlopen(request_url, timeout=60) as response:
            data = response.read()
        if not data.startswith(b'%PDF-'):
            print(f"NOT_PDF {resource['subject']} {slug}")
            return resource
        target.write_bytes(data)
        resource.update(localPdfUrl=local_url, downloadStatus='available')
        print(f'OK {filename} ({len(data)} bytes)')
    except urllib.error.HTTPError as error:
        resource['downloadStatus'] = 'access_denied' if error.code in (401, 403) else 'unavailable'
        print(f'HTTP {error.code} {resource["subject"]} {slug}')
    except Exception as error:
        print(f'UNAVAILABLE {resource["subject"]} {slug}: {type(error).__name__}')
    return resource


with ThreadPoolExecutor(max_workers=3) as pool:
    updated = list(pool.map(import_resource, resources))
CATALOG.write_text(json.dumps(updated, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f"Available: {sum(bool(item['localPdfUrl']) for item in updated)}/{len(updated)}")
