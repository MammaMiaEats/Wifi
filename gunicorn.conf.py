import sys

bind = "0.0.0.0:10000"
workers = 4
threads = 2
timeout = 120
max_requests = 1000
max_requests_jitter = 50

# Configuração de logging para stdout
accesslog = "-"  # stdout
errorlog = "-"   # stderr
loglevel = "info"

# Função para lidar com worker quando inicializa
def on_starting(server):
    """Log quando o servidor está iniciando"""
    server.log.info("Servidor Gunicorn iniciando...")

# Função para lidar com worker quando termina
def on_exit(server):
    """Log quando o servidor está terminando"""
    server.log.info("Servidor Gunicorn terminando...")

# Configuração para capturar logs do Flask
capture_output = True
enable_stdio_inheritance = True