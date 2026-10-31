"""Serve the verified BarqCargo v10 export. Python 3.9+; no dependencies."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
import argparse, hashlib, json

ROOT = Path(__file__).resolve().parent

def verify():
    manifest = json.loads((ROOT / 'BUILD-INFO.json').read_text())
    mismatches = [name for name, expected in manifest['files'].items()
                  if not (ROOT / name).is_file() or hashlib.sha256((ROOT / name).read_bytes()).hexdigest() != expected]
    if mismatches:
        raise SystemExit('File verification failed. Extract the original ZIP again. Changed/missing files: ' + ', '.join(mismatches))
    print('VERIFIED: ' + manifest['release'] + ' - all 41 published website files match.', flush=True)
    print('Serving folder: ' + str(ROOT / 'dist'), flush=True)

class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Barq-Release', 'verified-v10')
        super().end_headers()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8080)
    parser.add_argument('--verify-only', action='store_true')
    args = parser.parse_args()
    verify()
    if not args.verify_only:
        try:
            server = ThreadingHTTPServer(('127.0.0.1', args.port), partial(Handler, directory=str(ROOT / 'dist')))
        except OSError as exc:
            raise SystemExit('Could not start this verified server: ' + str(exc) + '. Stop the existing server on this port or choose --port 8081.')
        print('Open http://127.0.0.1:' + str(args.port) + '/ - keep this window open.', flush=True)
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            pass
        finally:
            server.server_close()
