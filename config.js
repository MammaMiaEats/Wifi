// config.js - Configurações do Portal Captivo
module.exports = {
  // Configurações da rede Wi-Fi
  wifi: {
    ssid: 'Mamma Mia Eats',
    redirectUrl: 'https://www.instagram.com/MammaMiaCuruca'
  },
  
  // Configurações do servidor
  server: {
    port: 3000,
    hostname: '0.0.0.0'
  },
  
  // Configurações do RADIUS
  radius: {
    server: '10.0.0.1',
    authPort: 1812,
    acctPort: 1813,
    secret: 'radiussecret', // Substitua pelo segredo compartilhado correto
    timeout: 5000 // Timeout em ms
  },
  
  // Configurações do portal
  portal: {
    companyName: 'Mamma Mia Eats',
    companyLogo: '/images/logo.png', // Caminho relativo à pasta public
    primaryColor: '#ff6b00',
    secondaryColor: '#1f1f1f',
    backgroundColor: '#000000',
    footerText: '© 2025 Mamma Mia Eats - Todos os direitos reservados',
    connectingMessage: 'Prepare-se para uma experiência gastronômica incrível! Nossas pizzas artesanais, burgers suculentos e fritas crocantes estão esperando por você!'
  },
  
  // Lista de URLs permitidas no Walled Garden (acesso sem autenticação)
  walledGarden: [
    'instagram.com',
    'www.instagram.com',
    'cdn.instagram.com',
    'facebook.com',
    'www.facebook.com',
    'connect.facebook.net',
    'static.xx.fbcdn.net',
    'cdnjs.cloudflare.com'
  ]
};