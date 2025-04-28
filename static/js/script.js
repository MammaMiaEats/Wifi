document.addEventListener('DOMContentLoaded', () => {
    const CONFIG = {
        app: {
            name: 'Mamma Mia Eats',
            version: '2.1.0',
            lastUpdate: '2025-04-27 23:59:59',
            author: 'MammaMiaEats'
        },
        urls: {
            connect: '/connect',
            redirect: 'https://instagram.com/MammaMiaEats'
        }
    };

    // Capturar parâmetros de URL do portal captivo
    const urlParams = {};
    window.location.search.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
        urlParams[key] = decodeURIComponent(value);
    });

    // Obter referências aos elementos DOM
    const elements = {
        form: document.getElementById('wifi-form'),
        connectBtn: document.getElementById('connect'),
        termsAcceptBtn: document.querySelector('.btn.accept'),
        termsDeclineBtn: document.querySelector('.btn.decline'),
        termsInput: document.getElementById('terms'),
        termsLink: document.getElementById('terms-link'),
        modal: document.getElementById('terms-modal'),
        modalCloseBtn: document.querySelector('.close-button'),
        modalCloseFooter: document.getElementById('close-terms'),
        loadingIndicator: document.getElementById('loading')
    };

    // Estado da aplicação
    const state = {
        isConnecting: false,
        termsAccepted: false
    };

    // Funções de UI
    const UI = {
        setLoading(isLoading) {
            if (!elements.connectBtn) return;
            
            elements.connectBtn.disabled = isLoading || !state.termsAccepted;
            
            if (elements.loadingIndicator) {
                elements.loadingIndicator.style.display = isLoading ? 'block' : 'none';
            }
        },

        showError(message = 'Ocorreu um erro. Tente novamente.') {
            alert(message);
        },

        updateButtonState() {
            if (elements.connectBtn) {
                elements.connectBtn.disabled = !state.termsAccepted;
            }
        }
    };

    // Modal de termos (se existir)
    const Modal = {
        show() {
            if (!elements.modal) return;
            
            elements.modal.style.display = 'flex';
            elements.modal.setAttribute('aria-hidden', 'false');
            setTimeout(() => elements.modal.classList.add('active'), 10);
        },

        hide() {
            if (!elements.modal) return;
            
            elements.modal.classList.remove('active');
            elements.modal.setAttribute('aria-hidden', 'true');
            setTimeout(() => elements.modal.style.display = 'none', 300);
        }
    };

    // Função para aceitar os termos
    window.accept = function() {
        state.termsAccepted = true;
        if (elements.termsInput) {
            elements.termsInput.value = 'yes';
        }
        UI.updateButtonState();
    };

    // Função para recusar os termos
    window.decline = function() {
        state.termsAccepted = false;
        if (elements.termsInput) {
            elements.termsInput.value = 'no';
        }
        UI.updateButtonState();
    };

    // Função para conectar ao WiFi
    window.connectWifi = async function() {
        if (!state.termsAccepted) {
            UI.showError('Você precisa aceitar os termos de uso para continuar.');
            return;
        }
        if (state.isConnecting) return;
        
        state.isConnecting = true;
        UI.setLoading(true);

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 7000); // 7 segundos
            
            const formData = new FormData();
            formData.append('terms', 'yes');
            formData.append('mac', urlParams.mac || '');
            formData.append('ip', urlParams.ip || '');
            formData.append('login_url', urlParams['link-login-only'] || urlParams['link-login'] || '');
            formData.append('username', 'MammaMiaEats');
            formData.append('password', 'MammaMiaEats');
            formData.append('dst', urlParams.dst || CONFIG.urls.redirect);
            
            const response = await fetch(CONFIG.urls.connect, {
                method: 'POST',
                body: formData,
                signal: controller.signal
            });
            
            clearTimeout(timeout);

            if (!response.ok) {
                throw new Error(`Erro de conexão (${response.status})`);
            }

            const data = await response.json();
            
            if (data.success) {
                window.location.href = data.redirect_url || CONFIG.urls.redirect;
            } else {
                throw new Error(data.message || 'Erro ao conectar');
            }
        } catch (error) {
            console.error('Erro:', error);
            
            // Plano B: tentar autenticação direta com MikroTik se a API falhar
            if (error.name === 'AbortError') {
                UI.showError('Tempo de conexão excedido. Tentando método alternativo...');
                tryAlternativeAuth();
            } else {
                if (urlParams['link-login']) {
                    UI.showError('Erro ao conectar. Tentando método alternativo...');
                    tryAlternativeAuth();
                } else {
                    UI.showError(error.message || 'Erro ao conectar. Tente novamente.');
                }
            }
        } finally {
            state.isConnecting = false;
            UI.setLoading(false);
        }
    };

    // Função de autenticação alternativa (direta com MikroTik)
    function tryAlternativeAuth() {
        if (urlParams['link-login']) {
            const mikrotikUrl = new URL(urlParams['link-login']);
            mikrotikUrl.searchParams.append('username', 'MammaMiaEats');
            mikrotikUrl.searchParams.append('password', 'MammaMiaEats');
            mikrotikUrl.searchParams.append('dst', urlParams.dst || CONFIG.urls.redirect);
            window.location.href = mikrotikUrl.toString();
        }
    }

    // Configurar eventos para o modal de termos (se existir)
    if (elements.termsLink) {
        elements.termsLink.addEventListener('click', (e) => {
            e.preventDefault();
            Modal.show();
        });
    }
    
    if (elements.modalCloseBtn) {
        elements.modalCloseBtn.addEventListener('click', Modal.hide);
    }
    
    if (elements.modalCloseFooter) {
        elements.modalCloseFooter.addEventListener('click', Modal.hide);
    }

    // Fechar modal ao clicar fora ou pressionar ESC
    window.addEventListener('click', (e) => {
        if (elements.modal && e.target === elements.modal) {
            Modal.hide();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            Modal.hide();
        }
    });
});
