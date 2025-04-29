#!/bin/bash
# setup.sh - Script de instalação e configuração do Portal Captivo

# Cores para facilitar a leitura
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}  INSTALAÇÃO DO PORTAL CAPTIVO - MAMMA MIA EATS  ${NC}"
echo -e "${GREEN}==================================================${NC}"

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Este script precisa ser executado como root (sudo).${NC}"
  exit 1
fi

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
  echo -e "${YELLOW}Node.js não encontrado. Instalando...${NC}"
  
  # Instalar Node.js
  curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
  apt-get install -y nodejs
  
  echo -e "${GREEN}Node.js instalado com sucesso!${NC}"
else
  echo -e "${GREEN}Node.js já está instalado.${NC}"
fi

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
  echo -e "${YELLOW}npm não encontrado. Instalando...${NC}"
  apt-get install -y npm
  echo -e "${GREEN}npm instalado com sucesso!${NC}"
else
  echo -e "${GREEN}npm já está instalado.${NC}"
fi

# Criar estrutura de diretórios
echo -e "${YELLOW}Criando estrutura de diretórios...${NC}"
mkdir -p public/images
mkdir -p logs

# Verificar se o arquivo index.html já existe na pasta public
if [ ! -f "public/index.html" ]; then
  # Mover o arquivo index.html para a pasta public
  if [ -f "index.html" ]; then
    mv index.html public/
    echo -e "${GREEN}Arquivo index.html movido para a pasta public.${NC}"
  else
    echo -e "${RED}Arquivo index.html não encontrado! Por favor, certifique-se de que ele existe no diretório atual.${NC}"
  fi
else
  echo -e "${GREEN}Arquivo index.html já existe na pasta public.${NC}"
fi

# Instalar dependências
echo -e "${YELLOW}Instalando dependências do Node.js...${NC}"
npm install

# Configurar PM2 (gerenciador de processos) para manter o servidor rodando
if ! command -v pm2 &> /dev/null; then
  echo -e "${YELLOW}Instalando PM2 globalmente...${NC}"
  npm install -g pm2
  echo -e "${GREEN}PM2 instalado com sucesso!${NC}"
else
  echo -e "${GREEN}PM2 já está instalado.${NC}"
fi

# Configurar para iniciar com o sistema
echo -e "${YELLOW}Configurando o serviço para iniciar com o sistema...${NC}"
pm2 start server.js --name "mamma-mia-captive-portal"
pm2 save
pm2 startup

# Configurar redirecionamento para o portal captivo
echo -e "${YELLOW}Configurando redirecionamentos de rede...${NC}"

# Ativar IP forwarding
echo 1 > /proc/sys/net/ipv4/ip_forward
echo "net.ipv4.ip_forward=1" >> /etc/sysctl.conf

# Configurar iptables para redirecionar todo o tráfego HTTP para o portal captivo
iptables -t nat -A PREROUTING -i wlan0 -p tcp --dport 80 -j DNAT --to-destination $(hostname -I | awk '{print $1}'):3000
iptables -t nat -A POSTROUTING -j MASQUERADE

# Salvar regras de iptables
echo -e "${YELLOW}Salvando regras de iptables...${NC}"
apt-get install -y iptables-persistent
netfilter-persistent save
netfilter-persistent reload

echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}  INSTALAÇÃO CONCLUÍDA COM SUCESSO!               ${NC}"
echo -e "${GREEN}==================================================${NC}"
echo -e "${YELLOW}O Portal Captivo está rodando na porta 3000.${NC}"
echo -e "${YELLOW}Acesse: http://$(hostname -I | awk '{print $1}'):3000${NC}"
echo -e "${YELLOW}Lembre-se de configurar seu roteador Intelbras AP 310${NC}"
echo -e "${YELLOW}para usar este servidor como autenticador externo.${NC}"
echo -e "${GREEN}==================================================${NC}"