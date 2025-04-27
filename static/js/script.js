document.addEventListener('DOMContentLoaded', function() {
    // ... (configurações existentes) ...

    // Função para selecionar opção
    window.selectOption = function(value) {
        document.getElementById('terms_accepted').value = value;
        
        // Remove classe selected de todos os botões
        document.querySelectorAll('.radio-button').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Adiciona classe selected ao botão clicado
        const selectedBtn = document.querySelector(`.radio-button.${value === 'yes' ? 'accept' : 'decline'}`);
        if (selectedBtn) {
            selectedBtn.classList.add('selected');
        }
        
        // Atualiza estado do botão conectar
        UI.updateButtonState();
        state.termsAccepted = (value === 'yes');
    };

    // Modal handling
    const modal = document.getElementById('terms-modal');
    const termsLink = document.getElementById('terms-link');
    const closeBtn = document.querySelector('.close-button');
    const closeTermsBtn = document.getElementById('close-terms');

    termsLink.addEventListener('click', () => {
        modal.style.display = 'flex';
        setTimeout(() => modal.classList.add('active'), 10);
    });

    function closeModal() {
        modal.classList.remove('active');
        setTimeout(() => modal.style.display = 'none', 300);
    }

    closeBtn.addEventListener('click', closeModal);
    closeTermsBtn.addEventListener('click', closeModal);
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // ... (resto do JavaScript mantido igual) ...
});
