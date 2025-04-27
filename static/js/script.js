document.addEventListener('DOMContentLoaded', function() {
    // Configurações
    const CONFIG = {
        app: {
            name: 'Mamma Mia Eats',
            version: '2.0.0',
            lastUpdate: '2025-04-27 00:44:22',
            author: 'MammaMiaEats'
        },
        urls: {
            login: '/login',
            redirect: 'https://instagram.com/MammaMiaEats'
        },
        timeouts: {
            connection: 10000,    // 10 segundos para timeout da conexão
            redirect: 2000,       // 2 segundos antes do redirecionamento
            animation: 300        // 300ms para animações
        },
        maxRetries: 3
    };

    // Elementos do DOM
    const elements = {
        form: document.getElementById('access-form'),
        connectBtn: document.getElementById('connect-btn'),
        termsRadios: document.querySelectorAll('input[name="terms_accepted"]'),
        termsLink: document.getElementById('terms-link'),
        modal: document.getElementById('terms-modal'),
        modalCloseBtn: document.querySelector('.close-button'),
        modalCloseFooter: document.getElementById('close-terms'),
        successPopup: document.getElementById('success-popup'),
        errorPopup: document.getElementById('error-popup'),
        continueBtn: document.getElementById('continue-btn'),
        errorRetryBtn: document.querySelector('.error-popup .popup-button'),
        errorMessage: document.querySelector('.error-message')
    };

    // Estado da aplicação
    const state = {
        isConnecting: false,
        retryCount: 0,
        termsAccepted: false
    };

    // Gerenciador de UI
    const UI = {
        setLoading: (loading) => {
            const btn = elements.connectBtn;
            if (loading) {
                btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Conectando...';
                btn.disabled = true;
            } else {
                btn.innerHTML = '<span class="button-text">Conectar</span><i class="fas fa-arrow-right"></i>';
                btn.disabled = !state.termsAccepted;
            }
        },

        showPopup: (popup) => {
            popup.style.display = 'flex';
            setTimeout(() => popup.classList.add('active'), 10);
        },

        hidePopup: (popup) => {
            popup.classList.remove('active');
            setTimeout(() => popup.style.display = 'none', CONFIG.timeouts.animation);
        },

        showError: (message) => {
            elements.errorMessage.textContent = message;
            UI.showPopup(elements.errorPopup);
        },

        updateButtonState: () => {
            elements.connectBtn.disabled = !state.termsAccepted;
        }
    };

    // Gerenciador do Modal
    const Modal = {
        show: () => {
            elements.modal.style.display = 'flex';
            setTimeout(() => elements.modal.classList.add('active'), 10);
            document.body.style.overflow = 'hidden';
        },

        hide: () => {
            elements.modal.classList.remove('active');
            setTimeout(() => {
                elements.modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, CONFIG.timeouts.animation);
        }
    };

    // Gerenciador de Conexão
    const Connection = {
        async connect(formData) {
            if (state.isConnecting) return;
            
            state.isConnecting = true;
            UI.setLoading(true);

            try {
                const response = await fetch(CONFIG.urls.login, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Erro de conexão');
                }

                if (data.success) {
                    UI.showPopup(elements.successPopup);
                    setTimeout(() => {
                        window.location.href = data.redirect_url || CONFIG.urls.redirect;
                    }, CONFIG.timeouts.redirect);
                } else {
                    throw new Error(data.message);
                }

            } catch (error) {
                console.error('Erro na conexão:', error);
                
                if (state.retryCount < CONFIG.maxRetries) {
                    state.retryCount++;
                    UI.showError(`${error.message}. Tentativa ${state.retryCount} de ${CONFIG.maxRetries}`);
                } else {
                    UI.showError('Número máximo de tentativas excedido. Por favor, tente novamente mais tarde.');
                }
            } finally {
                state.isConnecting = false;
                UI.setLoading(false);
            }
        }
    };

    // Event Listeners
    elements.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!state.termsAccepted) {
            UI.showError('Por favor, aceite os termos de uso para continuar.');
            return;
        }
        await Connection.connect(new FormData(elements.form));
    });

    elements.termsRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.termsAccepted = e.target.value === 'yes';
            UI.updateButtonState();
        });
    });

    elements.termsLink.addEventListener('click', (e) => {
        e.preventDefault();
        Modal.show();
    });

    elements.modalCloseBtn.addEventListener('click', Modal.hide);
    elements.modalCloseFooter.addEventListener('click', Modal.hide);

    elements.errorRetryBtn.addEventListener('click', () => {
        UI.hidePopup(elements.errorPopup);
    });

    elements.continueBtn.addEventListener('click', () => {
        UI.hidePopup(elements.successPopup);
    });

    // Fechamento do modal ao clicar fora
    elements.modal.addEventListener('click', (e) => {
        if (e.target === elements.modal) {
            Modal.hide();
        }
    });

    // Tecla ESC para fechar modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            Modal.hide();
            UI.hidePopup(elements.errorPopup);
            UI.hidePopup(elements.successPopup);
        }
    });

    // Verificação de conexão
    window.addEventListener('online', () => {
        if (state.isConnecting) {
            location.reload();
        }
    });

    window.addEventListener('offline', () => {
        UI.showError('Conexão com a internet perdida. Verifique sua conexão WiFi.');
    });

    // Inicialização
    UI.updateButtonState();

    // Debug info no console (apenas em desenvolvimento)
    if (window.location.hostname === 'localhost') {
        console.info(`${CONFIG.app.name} v${CONFIG.app.version}`);
        console.info(`Last Update: ${CONFIG.app.lastUpdate}`);
        console.info(`Author: ${CONFIG.app.author}`);
    }
});