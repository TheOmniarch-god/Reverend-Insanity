import http.server
class H(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        if '/assets/' not in self.path:
            self.send_header('Cache-Control', 'no-store, must-revalidate')
        super().end_headers()
    def log_message(self, *a): pass
http.server.ThreadingHTTPServer(('0.0.0.0', 8080), H).serve_forever()
