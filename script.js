document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const modal = document.getElementById('terms-modal');
    const termsLink = document.getElementById('terms-link');
    const closeBtn = document.getElementsByClassName('close')[0];
    const termsCheckbox = document.getElementById('terms-accept');
    const connectBtn = document.getElementById('connect-btn');
    const accessForm = document.getElementById('access-form');
    const nomeInput = document.getElementById('nome');
    const sobrenomeInput = document.getElementById('sobrenome');

    // Função para validar o formulário
    function validateForm() {
        const isNomeValid = nomeInput.value.trim().length > 0;
        const isSobrenomeValid = sobrenomeInput.value.trim().length > 0;
        const isTermsAccepted = termsCheckbox.checked;
        
        connectBtn.disabled = !(isNomeValid && isSobrenomeValid && isTermsAccepted);
    }

    // Event Listeners para validação em tempo real
    nomeInput.addEventListener('input', validateForm);
    sobrenomeInput.addEventListener('input', validateForm);
    termsCheckbox.addEventListener('change', validateForm);

    // Abrir modal dos termos
    termsLink.onclick = function(e) {
        e.preventDefault();
        modal.style.display = "block";
        document.body.style.overflow = 'hidden';
    }

    // Fechar modal
    closeBtn.onclick = function() {
        modal.style.display = "none";
        document.body.style.overflow = 'auto';
    }

    // Fechar modal ao clicar fora
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
            document.body.style.overflow = 'auto';
        }
    }

    // Fechar modal com tecla ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.style.display === "block") {
            modal.style.display = "none";
            document.body.style.overflow = 'auto';
        }
    });

    // Manipular envio do formulário
    accessForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (!termsCheckbox.checked) {
            alert('Por favor, aceite os termos de uso para continuar.');
            return;
        }

        // Dados do formulário
        const formData = {
            nome: nomeInput.value.trim(),
            sobrenome: sobrenomeInput.value.trim(),
            timestamp: new Date().toISOString()
        };

        // Aqui você pode adicionar o código para enviar os dados para seu servidor
        console.log('Dados do formulário:', formData);

        // Simular processo de conexão
        connectBtn.textContent = 'Conectando...';
        connectBtn.disabled = true;

        // Simular delay de conexão (remova em produção)
        setTimeout(() => {
            alert('Conectado com sucesso! Bem-vindo à nossa rede.');
            // Aqui você pode adicionar o redirecionamento após a autenticação
            // window.location.href = 'sua-url-de-redirecionamento';
        }, 1500);
    });

    // Prevenir envio do formulário com Enter nos campos de texto
    [nomeInput, sobrenomeInput].forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (!connectBtn.disabled) {
                    connectBtn.click();
                }
            }
        });
    });
});