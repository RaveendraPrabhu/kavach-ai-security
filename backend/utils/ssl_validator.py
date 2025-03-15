import ssl
import socket

class SSLValidator:
    def validate(self, url):
        try:
            hostname = url.split('://')[1].split('/')[0]
            context = ssl.create_default_context()
            with socket.create_connection((hostname, 443)) as sock:
                with context.wrap_socket(sock, server_hostname=hostname) as ssock:
                    cert = ssock.getpeercert()
                    return {
                        'valid': True,
                        'issuer': dict(x[0] for x in cert['issuer']),
                        'expires': cert['notAfter']
                    }
        except Exception as e:
            return {
                'valid': False,
                'error': str(e)
            } 