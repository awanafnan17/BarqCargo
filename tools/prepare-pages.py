"""Create a GitHub Pages project-path artifact without changing the verified export."""
from pathlib import Path
import argparse, re, shutil
ROOT = Path(__file__).resolve().parent.parent
parser = argparse.ArgumentParser()
parser.add_argument('--base-path', default='/BarqCargo')
args = parser.parse_args()
base = '/' + args.base_path.strip('/')
if not re.fullmatch(r'/[A-Za-z0-9_-]+', base):
    raise SystemExit('Use one simple repository path, such as /BarqCargo')
source = ROOT / 'dist'
target = ROOT / '.pages'
if target.exists(): shutil.rmtree(target)
shutil.copytree(source, target)
pattern = re.compile(r"([\"'`])(/[^\"'`\s<>]*)")
def rewrite(match):
    quote, url = match.groups()
    if url.startswith('//'): return match.group(0)
    path = url.split('?', 1)[0].split('#', 1)[0]
    if not (source / path.lstrip('/')).exists(): return match.group(0)
    return quote + base + url
for file in target.rglob('*'):
    if file.suffix in {'.html', '.css', '.js'} and 'vendor' not in file.relative_to(target).parts:
        file.write_text(pattern.sub(rewrite, file.read_text()), encoding='utf-8')
(target / '.nojekyll').touch()
print(f'Prepared {target} for {base}/')
