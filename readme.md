# Portal Captivo - Mamma Mia Eats

Portal captivo para a rede WiFi do Mamma Mia Eats. Este sistema redireciona usuários para uma página de autenticação onde devem aceitar os termos de uso antes de obter acesso à internet.

![Portal Captivo Screenshot](https://via.placeholder.com/800x450.png?text=Portal+Captivo+Mamma+Mia+Eats)

## Características

- Página de autenticação com design moderno e responsivo
- Termos de uso com rolagem
- Autenticação via servidor RADIUS
- Redirecionamento para Instagram após conexão
- Compatível com roteador Intelbras AP 310 Empresarial

## Tecnologias Utilizadas

- Node.js & Express
- HTML, CSS & JavaScript
- Protocolo RADIUS para autenticação
- Design responsivo para todos os dispositivos

## Estrutura do Projeto

```
├── public/             # Arquivos estáticos
│   ├── index.html      # Página do portal captivo
│   └── images/         # Imagens (logo, etc.)
├── server.js           # Servidor principal
├── config.js           # Configurações do portal
├── package.json        # Dependências do projeto
├── render.yaml         # Configuração para deploy no Render
└── README.md           # Este arquivo
```

## Implantação

### Local

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure o arquivo config.js com as informações do seu roteador
4. Inicie o servidor: `npm start`

### Deploy no Render

1. Conecte este repositório ao seu painel do Render
2. Selecione "Web Service"
3. Use as seguintes configurações:
   - Build Command: `npm install`
   - Start Command: `npm start`
4. Configure as variáveis de ambiente necessárias
5. Clique em "Create Web Service"

## Configuração do Roteador

Consulte o arquivo de instruções detalhadas no repositório para configurar corretamente seu roteador Intelbras AP 310 Empresarial.

## Desenvolvimento

Para executar o servidor em modo de desenvolvimento:

```bash
npm run dev
```

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Contato

Mamma Mia Eats - [@MammaMiaCuruca](https://www.instagram.com/MammaMiaCuruca)