"""Download linked Barq brand images into this export and rebuild with local paths.
Uses the Python standard library only. Failed downloads leave existing links intact.
"""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
from urllib.request import Request, urlopen
from urllib.parse import urlparse
import json, subprocess, sys

ROOT = Path(__file__).resolve().parent
ASSETS = json.loads((ROOT / 'asset-manifest.json').read_text())

def download(asset):
    destination = ROOT / 'dist' / asset['local_path'].lstrip('/')
    if destination.is_file() and destination.stat().st_size:
        return True, destination.name + ' already available'
    request = Request(asset['url'], headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urlopen(request, timeout=25) as response:
            content = response.read(15 * 1024 * 1024 + 1)
            kind = response.headers.get('Content-Type', '').lower()
        if len(content) > 15 * 1024 * 1024:
            raise ValueError('image exceeds download size limit')
        valid = content[:2] == b'\xff\xd8' or content[:8] == b'\x89PNG\r\n\x1a\n' or (content[:4] == b'RIFF' and content[8:12] == b'WEBP')
        if not valid:
            raise ValueError('server did not return a supported image: ' + kind)
        destination.parent.mkdir(parents=True, exist_ok=True)
        temp = destination.with_suffix(destination.suffix + '.part')
        temp.write_bytes(content)
        temp.replace(destination)
        return True, destination.name + ' saved'
    except Exception as error:
        return False, urlparse(asset['url']).path + ': ' + str(error)

if __name__ == '__main__':
    with ThreadPoolExecutor(max_workers=4) as pool:
        results = list(pool.map(download, ASSETS))
    for ok, message in results:
        print(('OK: ' if ok else 'Still linked: ') + message)
    subprocess.run([sys.executable, str(ROOT / 'build.py')], cwd=ROOT, check=True)
    completed = sum(ok for ok, _ in results)
    print(f'\n{completed}/{len(results)} images are local. Other images keep their original URLs.')
    print('Google Fonts is still online-hosted; the site has an Arial fallback.')
