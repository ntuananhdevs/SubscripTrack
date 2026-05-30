import sys
from pathlib import Path

# Ensure the src directory is on the Python path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from subscriptrack import create_app

app = create_app()

if __name__ == '__main__':
    app.run(debug=True, port=5000)
