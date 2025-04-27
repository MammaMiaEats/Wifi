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

    return render_template('index.html',
                            client_mac=request.args.get('client_mac', ''),
                            client_ip=request.args.get('client_ip', ''),
                            ap_mac=request.args.get('ap_mac', ''),
                            current_time=current_time,
                            session_id=session_id)

@app.route('/connect', methods=['POST'])
def connect():
    terms_accepted = request.form.get('terms_accepted')
    client_mac = request.form.get('client_mac')
    client_ip = request.form.get('client_ip')
    ap_mac = request.form.get('ap_mac')

    if terms_accepted != 'yes':
        return jsonify({
            'success': False,
            'message': 'Você precisa aceitar os termos de uso.'
        }), 400

    if not all([client_mac, client_ip, ap_mac]):
        return jsonify({
            'success': False,
            'message': 'Parâmetros de conexão inválidos.'
        }), 400

    return jsonify({
        'success': True,
        'message': 'Conexão autorizada',
        'redirect_url': 'https://instagram.com/MammaMiaEats'  # Redirecionamento final
    })

@app.route('/status')
def status():
    return jsonify({'status': 'online'})

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port)
