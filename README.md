# Portal Captive - Mamma Mia Eats

Portal de autenticação WiFi para o restaurante Mamma Mia Eats.

## Configuração do Roteador

### Roteador Intelbras AP 310 Empresarial

1. Configuração do PortalCaptive:
   - Tipo: Configuração externa (Autenticador)
   - Autenticação: Radius ou Externo
   - Servidor: 10.0.0.1
   - Porta de autenticação: 1812
   - Porta de contabilidade: 1813
   - Habilitar Walled Garden

2. Configurações de Rede:
   - SSID: MammaMiaEats_WiFi
   - Identificador NAS: AP310_MammaMia

## Personalização

### Arquivos Principais

1. `index.html`: Estrutura da página
   - Logo
   - Textos
   - Links de redes sociais
   - Termos de uso

2. `styles.css`: Estilos e aparência
   - Cores
   - Fontes
   - Layouts
   - Animações

3. `script.js`: Funcionalidades
   - Configurações do roteador
   - Autenticação
   - Popups
   - Redirecionamentos

### Como Personalizar

1. Textos e Links:
   - Edite as constantes no início do `script.js`
   - Atualize os textos no `index.html`

2. Aparência:
   - Modifique as variáveis CSS em `:root`
   - Ajuste os estilos no `styles.css`

3. Configurações do Roteador:
   - Atualize o objeto `CONFIG.router` no `script.js`

4. Redes Sociais:
   - Altere os links no `CONFIG.urls`
   - Atualize os ícones no `index.html`

## Última Atualização

- Data: 2025-04-26 01:21:28 UTC
- Autor: MammaMiaEats

## Licença

Todos os direitos reservados © MammaMiaEats 2025