// server.js - Servidor para Portal Captivo Mamma Mia Eats
const express = require('express');
const path = require('path');
const radius = require('radius');
const dgram = require('dgram');
const bodyParser = require('body-parser');
const fs = require('fs');
const morgan = require('morgan');

// Importar configurações
let config;
try {
  config = require('./config');
} catch (err) {
  console.log('Arquivo de configuração não encontrado, usando valores padrão');
  config = {
    server: { port: process.env.PORT || 3000 },
    radius: {
      server: '10.0.0.1',
      authPort: 1812,
      acctPort: 1813,
      secret: 'radiussecret'
    }
  };
}

// Configurações
const app = express();
const PORT = process.env.PORT || config.server.port || 3000;
const RADIUS_SERVER = process.env.RADIUS_SERVER || config.radius.server;
const RADIUS_AUTH_PORT = process.env.RADIUS_AUTH_PORT || config.radius.authPort;
const RADIUS_ACCT_PORT = process.env.RADIUS_ACCT_PORT || config.radius.acctPort;
const RADIUS_SECRET = process.env.RADIUS_SECRET || config.radius.secret;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configurar logs
if (process.env.NODE_ENV !== 'production') {
  // Em ambiente de desenvolvimento, registrar em arquivo
  try {
    const logsDir = path.join(__dirname, 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir);
    }
    const accessLogStream = fs.createWriteStream(path.join(logsDir, 'access.log'), { flags: 'a' });
    app.use(morgan('combined', { stream: accessLogStream }));
  } catch (err) {
    console.error('Erro ao criar arquivo de log:', err);
    app.use(morgan('combined')); // Fallback para console
  }
} else {
  // Em produção, apenas logs essenciais para console
  app.use(morgan('short'));
}

// Rota para servir a página do portal captivo
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Rota para autenticação
app.post('/authenticate', async (req, res) => {
  try {
    const { action, mac, ip } = req.body;
    
    if (action === 'connect') {
      // Log da tentativa de conexão
      console.log(`Tentativa de conexão - MAC: ${mac}, IP: ${ip}`);
      
      // Autenticação com o servidor RADIUS
      const result = await authenticateWithRadius(mac, ip);
      
      if (result.authenticated) {
        console.log(`Autenticação bem-sucedida para MAC: ${mac}`);
        res.json({ success: true });
      } else {
        console.log(`Falha na autenticação para MAC: ${mac}: ${result.message}`);
        res.json({ success: false, message: result.message });
      }
    } else {
      res.status(400).json({ success: false, message: 'Ação inválida' });
    }
  } catch (error) {
    console.error('Erro no servidor:', error);
    res.status(500).json({ success: false, message: 'Erro interno do servidor' });
  }
});

// Função para autenticar com o servidor RADIUS
function authenticateWithRadius(mac, ip) {
  return new Promise((resolve, reject) => {
    const client = dgram.createSocket('udp4');
    
    // Preparar pacote RADIUS
    const packet = {
      code: 'Access-Request',
      identifier: 1,
      attributes: {
        'User-Name': mac,
        'User-Password': mac, // Usando MAC como senha para autenticação simplificada
        'Calling-Station-Id': mac,
        'Called-Station-Id': 'Mamma-Mia-Eats',
        'NAS-IP-Address': ip,
        'NAS-Port': 0,
        'Service-Type': 'Login-User',
        'Framed-IP-Address': ip
      }
    };
    
    // Codificar pacote RADIUS
    const encoded = radius.encode(packet, RADIUS_SECRET);
    
    // Configurar timeout para a resposta do servidor RADIUS
    const timeout = setTimeout(() => {
      client.close();
      resolve({ authenticated: false, message: 'Tempo esgotado para resposta do servidor RADIUS' });
    }, 5000);
    
    // Enviar pacote ao servidor RADIUS
    client.send(encoded, 0, encoded.length, RADIUS_AUTH_PORT, RADIUS_SERVER, (err) => {
      if (err) {
        clearTimeout(timeout);
        client.close();
        resolve({ authenticated: false, message: 'Erro ao enviar pacote para servidor RADIUS' });
      }
    });
    
    // Receber resposta do servidor RADIUS
    client.on('message', (message) => {
      clearTimeout(timeout);
      
      try {
        const response = radius.decode(message, RADIUS_SECRET);
        
        if (response.code === 'Access-Accept') {
          client.close();
          resolve({ authenticated: true });
        } else {
          client.close();
          resolve({ authenticated: false, message: 'Acesso negado pelo servidor RADIUS' });
        }
      } catch (error) {
        client.close();
        resolve({ authenticated: false, message: 'Erro ao decodificar resposta do servidor RADIUS' });
      }
    });
    
    // Tratar erros na comunicação
    client.on('error', (error) => {
      clearTimeout(timeout);
      client.close();
      resolve({ authenticated: false, message: `Erro na comunicação: ${error.message}` });
    });
  });
}

// Rota padrão para verificar o status do servidor (útil para monitoramento)
app.get('/status', (req, res) => {
  res.json({ status: 'online', time: new Date().toISOString() });
});

// Rota para redirecionar qualquer outra solicitação para a página principal
app.get('*', (req, res) => {
  // Verificar se é uma solicitação de API
  if (req.path.startsWith('/api') || req.path.startsWith('/authenticate')) {
    return res.status(404).json({ error: 'Endpoint não encontrado' });
  }
  // Caso contrário, redirecionar para a página principal
  res.redirect('/');
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor do Portal Captivo rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'desenvolvimento'}`);
  console.log(`Configuração RADIUS: Servidor: ${RADIUS_SERVER}, Porta Auth: ${RADIUS_AUTH_PORT}, Porta Acct: ${RADIUS_ACCT_PORT}`);
});