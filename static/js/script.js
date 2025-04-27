document.addEventListener('DOMContentLoaded', function() {
    const CONFIG = {
        app: {
            name: 'Mamma Mia Eats',
            version: '2.0.0',
            lastUpdate: '2025-04-27 23:08:53',
            author: 'MammaMiaEats'
        },
        urls: {
            login: '/login',
            redirect: 'https://instagram.com/MammaMiaEats'
        },
        timeouts: {
            connection: 10000,
            redirect: 2000,
            animation: 300
        },
        maxRetries: 3
    };

    const elements = {
        form: document.getElementById('access-form'),
        connectBtn: document.getElementById('connect-btn'),
        termsInput: document.getElementById('terms_accepted'),
        termsLink: document.getElementById('terms-link'),
        modal: document.getElementById('terms-modal'),
        modalCloseBtn: document.querySelector('.close-button'),
        modalCloseFooter: document.getElementById('close-terms')
    };

    const state = {
        isConnecting: false,
        retryCount: 0,
        termsAccepted: false,
        sessionValid: false
    };

    // Forçar desconexão inicial
    fetch('/logout', {
        method: 'POST',
        credentials: 'include'
    }).catch(console.error);

    // Funções UI
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

        showError: (message) => {
            alert(message);
        },

        updateButtonState: () => {
            elements.connectBtn.disabled = !state.termsAccepted;
        }
    };

    // Seleção de opção dos termos
    window.selectOption = function(value) {
        elements.termsInput.value = value;
        
        document.querySelectorAll('.radio-button').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        const selectedBtn = document.querySelector(`.radio-button.${value === 'yes' ? 'accept' : 'decline'}`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }
        
        state.termsAccepted = (value === 'yes');
        UI.updateButtonState();
    };

    // Submissão do formulário
    elements.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!state.termsAccepted) {
            UI.showError('Você precisa aceitar os termos de uso para continuar.');
            return;
        }
        
        if (state.isConnecting) return;
        
        state.isConnecting = true;
        UI.setLoading(true);

        try {
            const response = await fetch(CONFIG.urls.login, {
                method: 'POST',
                body: new FormData(elements.form),
                credentials: 'include'
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Erro de conexão');
            }

            if (data.success) {
                window.location.href = data.redirect_url;
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
    });

    // Gerenciamento do Modal
    const Modal = {
        show: () => {
            elements.modal.style.display = 'flex';
            setTimeout(() => elements.modal.classList.add('active'), 10);
        },

        hide: () => {
            elements.modal.classList.remove('active');
            setTimeout(() => elements.modal.style.display = 'none', CONFIG.timeouts.animation);
        }
    };

    elements.termsLink.addEventListener('click', Modal.show);
    elements.modalCloseBtn.addEventListener('click', Modal.hide);
    elements.modalCloseFooter.addEventListener('click', Modal.hide);
    
    window.addEventListener('click', (e) => {
        if (e.target === elements.modal) {
            Modal.hide();
        }
    });

    // Tecla ESC para fechar modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            Modal.hide();
        }
    });
});
