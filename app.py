from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from datetime import datetime
import secrets
import os

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY') or secrets.token_hex(16)

@app.after_request
def add_security_headers(response):
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/')
def login():
    current_time = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    session_id = secrets.token_hex(16)
    
    # Captura parâmetros do MikroTik/sistema captivo
    mac = request.args.get('mac', '')
    ip = request.args.get('ip', '')
    link_login = request.args.get('link-login', '')
    link_login_only = request.args.get('link-login-only', '')
    link_logout = request.args.get('link-logout', '')
    dst = request.args.get('dst', 'https://instagram.com/MammaMiaEats')
    
    return render_template('index.html',
                           mac=mac,
                           ip=ip,
                           link_login=link_login,
                           link_login_only=link_login_only,
                           link_logout=link_logout,
                           dst=dst,
                           current_time=current_time,
                           session_id=session_id)

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
    
    # Para MikroTik, redirecionar para o link-login com os parâmetros necessários
    login_url = request.form.get('login_url', '')
    username = request.form.get('username', 'MammaMiaEats')
    password = request.form.get('password', 'MammaMiaEats')
    dst = request.form.get('dst', 'https://instagram.com/MammaMiaEats')
    
    if login_url:
        # Cria URL para redirecionamento ao sistema de autenticação
        redirect_url = f"{login_url}?username={username}&password={password}&dst={dst}"
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
    username = request.form.get('username', '')
    password = request.form.get('password', '')
    mac = request.form.get('mac', '')
    ip = request.form.get('ip', '')
    dst = request.form.get('dst', 'https://instagram.com/MammaMiaEats')
    
    # Aqui você implementaria a lógica de autenticação real
    # Por exemplo, verificar o MAC em um banco de dados
    
    # Neste exemplo, autorizamos todos os usuários que aceitaram os termos
    return redirect(dst)

@app.route('/status')
def status():
    return jsonify({'status': 'online'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=True)
