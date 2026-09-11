"""Serve the built frontend and API together, only on this computer."""
from pathlib import Path
from flask import send_from_directory
from app import create_app

app = create_app()
dist = Path(__file__).resolve().parents[1] / 'frontend' / 'dist'
if not (dist / 'index.html').exists():
    raise RuntimeError('Compile a interface: entre em frontend e execute npm run build.')

def frontend(**kwargs):
    return send_from_directory(dist, 'index.html')

app.view_functions['index'] = frontend
for route in ('/app', '/chat', '/dashboard', '/profile', '/settings', '/rights', '/contract-analysis',
              '/admin', '/profile/<int:id>', '/knowledge-base', '/docs', '/terms', '/privacy', '/disclaimer', '/banned', '/appeal'):
    app.add_url_rule(route, 'page_'+route, frontend)

@app.get('/assets/<path:filename>')
def assets(filename):
    return send_from_directory(dist / 'assets', filename)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=False)
