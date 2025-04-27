from flask import Flask, request, render_template, jsonify, redirect
from datetime import datetime
import logging
import os
import sys
from dotenv import load_dotenv

# Carrega variáveis de ambiente
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'mammamia_wifi_portal_key_2025')

# Configuração de logging para stdout em vez de arquivo
logging.basicConfig(
    stream=sys.stdout,  # Alterado para stdout
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

@app.route('/')
@app.route('/login')
def index():
    """Rota principal que serve tanto '/' quanto '/login'"""
    client_mac = request.args.get('client_mac', '')
    client_ip = request.args.get('client_ip', '')
    ap_mac = request.args.get('ap_mac', '')
    
    logging.info(f"Novo acesso - MAC: {client_mac}, IP: {client_ip}, AP: {ap_mac}")
    
    current_time = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    
    return render_template('index.html',
                         current_time=current_time,
                         client_mac=client_mac,
                         client_ip=client_ip,
                         ap_mac=ap_mac,
                         year=datetime.utcnow().year,
                         company_name="Mamma Mia Eats",
                         last_update="2025-04-27 01:02:49",
                         user="MammaMiaEats")

@app.route('/login', methods=['POST'])
def login_post():
    """Processa o POST do formulário de login"""
    try:
        client_mac = request.form.get('client_mac', '')
        client_ip = request.form.get('client_ip', '')
        terms_accepted = request.form.get('terms_accepted') == 'yes'
        
        if not terms_accepted:
            return jsonify({
                'success': False,
                'message': 'É necessário aceitar os termos de uso'
            }), 400

        logging.info(f"Login bem-sucedido - MAC: {client_mac}, IP: {client_ip}")
        
        return jsonify({
            'success': True,
            'message': 'Autenticação realizada com sucesso',
            'redirect_url': os.getenv('REDIRECT_URL', 'https://instagram.com/MammaMiaEats')
        })

    except Exception as e:
        logging.error(f"Erro no login: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Erro durante a autenticação'
        }), 500

@app.route('/health')
def health_check():
    """Rota para verificação de saúde da aplicação"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.errorhandler(404)
def page_not_found(e):
    """Handler para página não encontrada"""
    return redirect('/')

@app.errorhandler(500)
def internal_error(e):
    """Handler para erro interno do servidor"""
    logging.error(f"Erro interno do servidor: {str(e)}")
    return jsonify({
        'success': False,
        'message': 'Erro interno do servidor'
    }), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=os.getenv('FLASK_ENV') == 'development')