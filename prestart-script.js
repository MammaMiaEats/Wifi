// prestart.js - Script para garantir a estrutura de arquivos adequada antes de iniciar o servidor
const fs = require('fs');
const path = require('path');

console.log('Executando script de pré-inicialização para configurar a estrutura de diretórios...');

// Criar diretório public se não existir
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  console.log('Criando diretório public...');
  fs.mkdirSync(publicDir, { recursive: true });
}

// Criar diretório public/images se não existir
const imagesDir = path.join(publicDir, 'images');
if (!fs.existsSync(imagesDir)) {
  console.log('Criando diretório public/images...');
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Criar diretório logs se não existir
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  console.log('Criando diretório logs...');
  fs.mkdirSync(logsDir, { recursive: true });
}

// Verificar se index.html existe no diretório public
const indexPath = path.join(publicDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.log('index.html não encontrado no diretório public. Criando...');
  
  // Conteúdo do index.html fornecido nos arquivos
  const indexContent = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mamma Mia Eats - WiFi</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background-color: #000;
            color: #fff;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            padding: 20px;
        }
        
        .container {
            background-color: #1f1f1f;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(255, 107, 0, 0.2);
            width: 100%;
            max-width: 500px;
            overflow: hidden;
            position: relative;
        }
        
        .header {
            background-color: #121212;
            padding: 20px;
            text-align: center;
            border-bottom: 2px solid #ff6b00;
        }
        
        .header img {
            max-width: 200px;
            height: auto;
        }
        
        .content {
            padding: 25px;
        }
        
        h1 {
            margin-bottom: 20px;
            font-size: 1.8rem;
            color: #ff6b00;
            text-align: center;
        }
        
        .terms-container {
            background-color: #292929;
            border: 1px solid #333;
            border-radius: 8px;
            padding: 15px;
            height: 250px;
            overflow-y: auto;
            margin-bottom: 20px;
            font-size: 0.9rem;
            line-height: 1.5;
        }
        
        .terms-container::-webkit-scrollbar {
            width: 8px;
        }
        
        .terms-container::-webkit-scrollbar-track {
            background: #333;
            border-radius: 4px;
        }
        
        .terms-container::-webkit-scrollbar-thumb {
            background: #ff6b00;
            border-radius: 4px;
        }
        
        .button-group {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        
        button {
            background-color: transparent;
            color: #fff;
            border: 2px solid #ff6b00;
            border-radius: 30px;
            padding: 10px 25px;
            font-size: 1rem;
            cursor: pointer;
            transition: all 0.3s ease;
            font-weight: 600;
            flex: 1;
            margin: 0 5px;
        }
        
        button:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 15px rgba(255, 107, 0, 0.4);
        }
        
        button#accept {
            background-color: #ff6b00;
        }
        
        button#reject {
            background-color: transparent;
        }
        
        button#connect {
            background-color: #ff6b00;
            display: block;
            width: 100%;
            margin-top: 20px;
            padding: 12px;
            opacity: 0.5;
            pointer-events: none;
            transition: all 0.3s ease;
        }
        
        button#connect.active {
            opacity: 1;
            pointer-events: auto;
        }
        
        .footer {
            text-align: center;
            padding: 15px;
            background-color: #121212;
            font-size: 0.8rem;
            color: #666;
            border-top: 1px solid #333;
        }
        
        /* Modal styles */
        .modal {
            display: none;
            position: fixed;
            z-index: 999;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.8);
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
        }
        
        .modal-content {
            background-color: #1f1f1f;
            border-radius: 12px;
            padding: 30px;
            width: 90%;
            max-width: 400px;
            text-align: center;
            box-shadow: 0 0 30px rgba(255, 107, 0, 0.3);
            transform: scale(0.8);
            transition: all 0.3s ease;
            border: 2px solid #ff6b00;
        }
        
        .modal.show {
            display: flex;
        }
        
        .modal.show .modal-content {
            transform: scale(1);
        }
        
        .spinner {
            margin: 20px auto;
            width: 50px;
            height: 50px;
            border: 5px solid rgba(255, 107, 0, 0.2);
            border-top: 5px solid #ff6b00;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }
        
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        .modal h2 {
            color: #ff6b00;
            margin-bottom: 15px;
        }
        
        .modal p {
            margin-top: 20px;
            font-size: 1rem;
            line-height: 1.5;
        }
        
        /* Animações */
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(255, 107, 0, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(255, 107, 0, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 107, 0, 0); }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .container {
            animation: fadeIn 0.5s ease forwards;
        }
        
        button#connect.active {
            animation: pulse 1.5s infinite;
        }
        
        /* Logo placeholder */
        .logo-placeholder {
            text-align: center;
            font-size: 1.8rem;
            font-weight: bold;
            color: #ff6b00;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo-placeholder">MAMMA MIA EATS</div>
            <p>Conecte-se à nossa rede WiFi</p>
        </div>
        
        <div class="content">
            <h1>Termos de Uso</h1>
            
            <div class="terms-container">
                <h3>TERMOS E CONDIÇÕES DE USO DA REDE WI-FI</h3>
                <p>Bem-vindo à rede Wi-Fi do Mamma Mia Eats. Antes de acessar nossa rede, por favor, leia atentamente os seguintes termos e condições:</p>
                <br>
                <h4>1. USO ACEITÁVEL</h4>
                <p>Ao utilizar nossa rede Wi-Fi, você concorda em não:</p>
                <p>• Acessar, transmitir ou distribuir material ilegal;</p>
                <p>• Transmitir material que contenha vírus ou outros códigos maliciosos;</p>
                <p>• Utilizar a rede para fins de spam, hacking, distribuição de malware ou qualquer atividade ilegal;</p>
                <p>• Sobrecarregar intencionalmente a rede ou interferir na conectividade de outros usuários;</p>
                <p>• Acessar conteúdo pornográfico, violento ou inadequado em ambiente público.</p>
                <br>
                <h4>2. LIMITAÇÃO DE RESPONSABILIDADE</h4>
                <p>O Mamma Mia Eats não se responsabiliza por:</p>
                <p>• Segurança de seus dados ao utilizar a rede;</p>
                <p>• Interrupções ou falhas no serviço Wi-Fi;</p>
                <p>• Qualquer dano aos seus equipamentos relacionados ao uso da rede;</p>
                <p>• Atividades realizadas durante o uso da conexão.</p>
                <br>
                <h4>3. MONITORAMENTO E PRIVACIDADE</h4>
                <p>O Mamma Mia Eats reserva-se o direito de:</p>
                <p>• Monitorar o tráfego de rede para fins de segurança e cumprimento destes termos;</p>
                <p>• Armazenar informações de log e dados de acesso conforme exigido por lei;</p>
                <p>• Bloquear o acesso a determinados sites ou conteúdos a seu critério;</p>
                <p>• Limitar a largura de banda ou duração da conexão para garantir uso justo.</p>
                <br>
                <h4>4. SEGURANÇA</h4>
                <p>• Nossa rede Wi-Fi é pública e, como tal, recomendamos que não realize transações bancárias ou acesse informações sensíveis;</p>
                <p>• Considere utilizar uma VPN para maior segurança;</p>
                <p>• O Mamma Mia Eats não solicita senhas ou dados pessoais para uso da rede.</p>
                <br>
                <h4>5. SUSPENSÃO DE ACESSO</h4>
                <p>O Mamma Mia Eats reserva-se o direito de suspender ou encerrar o acesso à rede Wi-Fi de qualquer usuário que viole estes termos, sem aviso prévio.</p>
                <br>
                <p>Ao clicar em "Aceitar", você confirma que leu e concorda com estes termos e condições.</p>
            </div>
            
            <div class="button-group">
                <button id="reject">Recusar</button>
                <button id="accept">Aceitar</button>
            </div>
            
            <button id="connect" disabled>Conectar</button>
        </div>
        
        <div class="footer">
            © 2025 Mamma Mia Eats - Todos os direitos reservados
        </div>
    </div>
    
    <!-- Modal de conexão -->
    <div id="connectionModal" class="modal">
        <div class="modal-content">
            <h2>Conectando...</h2>
            <div class="spinner"></div>
            <p>Prepare-se para uma experiência gastronômica incrível! Nossas pizzas artesanais, burgers suculentos e fritas crocantes estão esperando por você!</p>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const acceptButton = document.getElementById('accept');
            const rejectButton = document.getElementById('reject');
            const connectButton = document.getElementById('connect');
            const connectionModal = document.getElementById('connectionModal');
            
            // Função para lidar com a rejeição dos termos
            rejectButton.addEventListener('click', function() {
                alert('Você precisa aceitar os termos de uso para utilizar nossa rede Wi-Fi.');
            });
            
            // Função para lidar com a aceitação dos termos
            acceptButton.addEventListener('click', function() {
                connectButton.classList.add('active');
                connectButton.disabled = false;
                
                // Efeito visual para indicar que o botão foi pressionado
                acceptButton.style.backgroundColor = '#994000';
                setTimeout(() => {
                    acceptButton.style.backgroundColor = '#ff6b00';
                }, 200);
            });
            
            // Função para lidar com o botão de conexão
            connectButton.addEventListener('click', function() {
                // Mostra o modal de conexão
                connectionModal.classList.add('show');
                
                // Simula o processo de autenticação
                setTimeout(function() {
                    // Em ambiente de produção web, vamos apenas redirecionar para o Instagram
                    window.location.href = 'https://www.instagram.com/MammaMiaCuruca';
                    
                    // Nota: Em um ambiente real com roteador físico, seria necessário
                    // comunicar com o servidor RADIUS conforme implementado no server.js
                }, 3000);
            });
        });
    </script>
</body>
</html>`;
  
  // Escrever index.html no diretório public
  fs.writeFileSync(indexPath, indexContent);
  console.log('index.html criado no diretório public');
}

console.log('Configuração de pré-inicialização concluída. Estrutura de diretórios está pronta.');
