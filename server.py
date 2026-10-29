from argparse import ArgumentParser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent


def main():
    parser = ArgumentParser(description="Serve the Buildbound Obby game locally.")
    parser.add_argument("--host", default="0.0.0.0", help="Address to bind (default: 0.0.0.0)")
    parser.add_argument("--port", type=int, default=8000, help="Port to listen on (default: 8000)")
    args = parser.parse_args()

    handler = partial(SimpleHTTPRequestHandler, directory=str(PROJECT_ROOT))
    try:
        with ThreadingHTTPServer((args.host, args.port), handler) as server:
            print(f"Buildbound is running at http://localhost:{args.port}")
            print("Press Ctrl+C to stop the server.")
            server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")


if __name__ == "__main__":
    main()
