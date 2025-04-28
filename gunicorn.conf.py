import multiprocessing
import os
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

# Configuração básica
bind = os.environ.get("HOST", "0.0.0.0") + ":" + os.environ.get("PORT", "10000")
workers = int(os.environ.get("GUNICORN_WORKERS", multiprocessing.cpu_count() * 2 + 1))
threads = int(os.environ.get("GUNICORN_THREADS", 2))
timeout = int(os.environ.get("GUNICORN_TIMEOUT", 120))

# Configuração de request
max_requests = 1000
max_requests_jitter = 50
keepalive = 5
worker_class = "sync"
worker_connections = 1000

# Configuração de logging
accesslog = "-"  # stdout
errorlog = "-"   # stderr
loglevel = os.environ.get("GUNICORN_LOG_LEVEL", "info")
access_log_format = '%(h)s %(l)s %(u)s %(t)s "%(r)s" %(s)s %(b)s "%(f)s" "%(a)s" %(L)s'

# Captura de saída
capture_output = True
enable_stdio_inheritance = True

# Configuração de SSL (descomentando se necessário)
# keyfile = "/path/to/keyfile"
# certfile = "/path/to/certfile"

# Hooks
def on_starting(server):
    """Log quando o servidor está iniciando"""
    server.log.info("Servidor Gunicorn iniciando para Mamma Mia Eats WiFi Portal")

def on_exit(server):
    """Log quando o servidor está terminando"""
    server.log.info("Servidor Gunicorn terminando")

def post_fork(server, worker):
    """Configurações após criar processo worker"""
    server.log.info(f"Worker {worker.pid} iniciado")

def worker_exit(server, worker):
    """Log quando um worker termina"""
    server.log.info(f"Worker {worker.pid} terminado")

# Configuração para verificação de saúde
def when_ready(server):
    """Ações quando o servidor está pronto para receber tráfego"""
    server.log.info("Servidor pronto para receber conexões")
