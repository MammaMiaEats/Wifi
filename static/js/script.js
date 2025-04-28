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
        termsAccepted: false
    };

    const UI = {
        setLoading(isLoading) {
            const btn = elements.connectBtn;
            btn.innerHTML = isLoading
                ? '<i class="fas fa-circle-notch fa-spin"></i> Conectando...'
                : '<span class="button-text">Conectar</span><i class="fas fa-arrow-right"></i>';
            btn.disabled = isLoading || !state.termsAccepted;
        },

        showError(message = 'Ocorreu um erro. Tente novamente.') {
            alert(message);
        },

        updateButtonState() {
            elements.connectBtn.disabled = !state.termsAccepted;
        }
    };

    const Modal = {
        show() {
            elements.modal.style.display = 'flex';
            elements.modal.setAttribute('aria-hidden', 'false');
            setTimeout(() => elements.modal.classList.add('active'), 10);
        },

        hide() {
            elements.modal.classList.remove('active');
            elements.modal.setAttribute('aria-hidden', 'true');
            setTimeout(() => elements.modal.style.display = 'none', 300);
        }
    };

    // Controlar seleção dos termos
    window.selectOption = (value) => {
        elements.termsInput.value = value;

        document.querySelectorAll('.radio-button').forEach(btn => btn.classList.remove('selected'));
        const selectedBtn = document.querySelector(`.radio-button.${value === 'yes' ? 'accept' : 'decline'}`);
        if (selectedBtn) selectedBtn.classList.add('selected');

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
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 7000); // 7 segundos
        
        const formData = new FormData(elements.form);
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
        if (error.name === 'AbortError') {
            UI.showError('Tempo de conexão excedido. Tente novamente.');
        } else {
            UI.showError(error.message || 'Erro ao conectar. Tente novamente.');
        }
    } finally {
        state.isConnecting = false;
        UI.setLoading(false);
    }
});


    // Eventos do Modal
    elements.termsLink.addEventListener('click', (e) => {
        e.preventDefault();
        Modal.show();
    });
    elements.modalCloseBtn.addEventListener('click', Modal.hide);
    elements.modalCloseFooter.addEventListener('click', Modal.hide);

    // Fechar modal ao clicar fora ou pressionar ESC
    window.addEventListener('click', (e) => {
        if (e.target === elements.modal) {
            Modal.hide();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            Modal.hide();
        }
    });
});
