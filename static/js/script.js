document.addEventListener('DOMContentLoaded', function() {
    const CONFIG = {
        app: {
            name: 'Mamma Mia Eats',
            version: '2.0.0',
            lastUpdate: '2025-04-27 23:21:21',
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

    // UI Controller
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

    // Form submission
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
            const formData = new FormData(elements.form);
            const response = await fetch(CONFIG.urls.connect, {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                window.location.href = data.redirect_url;
            } else {
                throw new Error(data.message || 'Erro ao conectar');
            }

        } catch (error) {
            console.error('Erro:', error);
            UI.showError(error.message || 'Erro ao conectar. Tente novamente.');
        } finally {
            state.isConnecting = false;
            UI.setLoading(false);
        }
    });

    // Modal Controller
    const Modal = {
        show: () => {
            elements.modal.style.display = 'flex';
            setTimeout(() => elements.modal.classList.add('active'), 10);
        },

        hide: () => {
            elements.modal.classList.remove('active');
            setTimeout(() => elements.modal.style.display = 'none', 300);
        }
    };

    // Modal event listeners
    elements.termsLink.addEventListener('click', Modal.show);
    elements.modalCloseBtn.addEventListener('click', Modal.hide);
    elements.modalCloseFooter.addEventListener('click', Modal.hide);
    
    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === elements.modal) {
            Modal.hide();
        }
    });

    // Close modal on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            Modal.hide();
        }
    });
});
