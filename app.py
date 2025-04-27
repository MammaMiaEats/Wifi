from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from datetime import datetime
import secrets
import os

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', secrets.token_hex(16))

@app.before_request
def force_authentication():
    if request.endpoint != 'login' and 'authenticated' not in session:
        return redirect(url_for('login'))

@app.after_request
def add_security_headers(response):
    response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response.headers['Pragma'] = 'no-cache'
    response.headers['Expires'] = '0'
    return response

@app.route('/')
def login():
    if 'authenticated' in session:
        return redirect('https://instagram.com/MammaMiaEats')
    
    current_time = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    session_id = secrets.token_hex(16)
    
    return render_template('index.html',
                         client_mac=request.args.get('client_mac', ''),
                         client_ip=request.args.get('client_ip', ''),
                         ap_mac=request.args.get('ap_mac', ''),
                         current_time=current_time,
                         session_id=session_id)

@app.route('/login', methods=['POST'])
def authenticate():
    if request.form.get('terms_accepted') != 'yes':
        return jsonify({'success': False, 'message': 'Termos não aceitos'}), 400

    if not all([request.form.get('client_mac'),
                request.form.get('client_ip'),
                request.form.get('ap_mac')]):
        return jsonify({'success': False, 'message': 'Parâmetros inválidos'}), 400

    session['authenticated'] = True
    session['client_mac'] = request.form.get('client_mac')
    session['timestamp'] = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')

    return jsonify({
        'success': True,
        'redirect_url': 'https://instagram.com/MammaMiaEats'
    })

@app.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5000)), debug=False)
