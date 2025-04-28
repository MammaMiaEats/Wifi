from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from datetime import datetime, timedelta
from flask_cors import CORS
import secrets
import os
from dotenv import load_dotenv

# Carrega variáveis do arquivo .env
load_dotenv()

app = Flask(__name__, static_folder='static')
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(16))
app.config['SESSION_COOKIE_SECURE'] = True
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(seconds=int(os.environ.get('SESSION_TIMEOUT', 7200)))


# Configuração CORS para permitir solicitações de domínios específicos
allowed_domains = os.environ.get('ALLOWED_DOMAINS', '*').split(',')
CORS(app, resources={r"/*": {"origins": allowed_domains}})

# Constantes da aplicação
WIFI_USERNAME = os.environ.get('WIFI_USERNAME', 'MammaMiaEats')
WIFI_PASSWORD = os.environ.get('WIFI_PASSWORD', 'MammaMiaEats2025')
DEFAULT_REDIRECT_URL = os.environ.get('REDIRECT_URL', 'https://instagram.com/MammaMiaEats')

@app.after_request
def add_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'SAMEORIGIN'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/')
def login():
    current_time = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    session_id = secrets.token_hex(16)
    
    # Captura parâmetros do sistema de portal captivo
    mac = request.args.get('mac', '')
    ip = request.args.get('ip', '')
    link_login = request.args.get('link-login', '')
    link_login_only = request.args.get('link-login-only', '')
    link_logout = request.args.get('link-logout', '')
    dst = request.args.get('dst', DEFAULT_REDIRECT_URL)
    
    return render_template('index.html',
                           mac=mac,
                           ip=ip,
                           link_login=link_login,
                           link_login_only=link_login_only,
                           link_logout=link_logout,
                           dst=dst,
                           current_time=current_time,
                           session_id=session_id,
                           wifi_username=WIFI_USERNAME)

@app.route('/connect', methods=['POST'])
def connect():
    terms = request.form.get('terms')
    mac = request.form.get('mac')
    ip = request.form.get('ip')
    
    if terms != 'yes':
        return jsonify({
            'success': False,
            'message': 'Você precisa aceitar os termos de uso.'
        }), 400
    
    if not all([mac, ip]):
        return jsonify({
            'success': False,
            'message': 'Parâmetros de conexão inválidos.'
        }), 400
    
    # Registra a conexão (para implementação futura com banco de dados)
    app.logger.info(f"Conexão autorizada para MAC: {mac}, IP: {ip}")
    
    # Para MikroTik, redirecionar para o link-login com os parâmetros necessários
    login_url = request.form.get('login_url', '')
    dst = request.form.get('dst', DEFAULT_REDIRECT_URL)
    
    if login_url:
        # Cria URL para redirecionamento ao sistema de autenticação
        redirect_url = f"{login_url}?username={WIFI_USERNAME}&password={WIFI_PASSWORD}&dst={dst}"
        return jsonify({
            'success': True,
            'message': 'Redirecionando para autenticação',
            'redirect_url': redirect_url
        })
    else:
        # Fluxo alternativo para sistemas que não fornecem link-login
        return jsonify({
            'success': True,
            'message': 'Conexão autorizada',
            'redirect_url': dst
        })

@app.route('/auth', methods=['POST'])
def auth():
    """Endpoint para autenticação direta"""
    mac = request.form.get('mac', '')
    ip = request.form.get('ip', '')
    dst = request.form.get('dst', DEFAULT_REDIRECT_URL)
    
    # Aqui você implementaria a lógica de autenticação real
    # Por exemplo, verificar o MAC em um banco de dados
    
    # Neste exemplo, autorizamos todos os usuários que aceitaram os termos
    return redirect(dst)

@app.route('/status')
def status():
    return jsonify({
        'status': 'online',
        'version': '1.0.0',
        'timestamp': datetime.utcnow().isoformat()
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    host = os.environ.get('HOST', '0.0.0.0')
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    app.run(host=host, port=port, debug=debug)
