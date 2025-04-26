document.addEventListener('DOMContentLoaded', function() {
    // Configurações do Portal
    const CONFIG = {
        // Dados da empresa
        company: {
            name: 'Mamma Mia Eats',
            founded: '2015',
            currentYear: '2025',
            lastUpdate: '2025-04-26 02:46:39',
            user: 'MammaMiaEats'
        },
        
        // Configurações do roteador
        router: {
            serverIP: window.location.hostname || '10.0.0.1',
            authPort: '1812',
            accountPort: '1813',
            ssid: 'MammaMiaEats_WiFi',
            nasIdentifier: 'AP310_MammaMia'
        },
        
        // URL de redirecionamento
        redirectUrl: 'https://instagram.com/MammaMiaCuruca',
        
        // Tempos de delay (em milissegundos)
        delays: {
            redirect: 2000,    // Tempo antes do redirecionamento
            animation: 300,    // Duração das animações
            simulation: 1000   // Tempo de simulação em modo desenvolvimento
        },
        
        // API endpoints
        api: {
            auth: 'auth.php',
            mac: 'getmac.php'
        },
        
        // Textos personalizáveis
        texts: {
            mainQuestion: 'Você aceita nosso termo de uso?',
            termsLink: 'Ver Termos de Uso',
            connectButton: 'Conectar ao WI-FI',
            connectingButton: '<span class="loading-spinner"></span>Conectando...',
            successTitle: 'Conectado com Sucesso!',
            welcomeMessage: 'Bem vindo à rede Wi-Fi Mamma Mia Eats.',
            experienceMessage: 'Aproveite sua experiência gastronômica!',
            continueButton: 'Continuar',
            copyright: `© Mamma Mia Eats (2015 - 2025). Todos os direitos reservados.`,
            errorMessages: {
                networkError: 'Erro de conexão com o roteador. Verifique sua conexão.',
                authError: 'Erro na autenticação. Por favor, tente novamente.',
                generalError: 'Ocorreu um erro. Por favor, tente novamente.',
                termsRequired: 'Por favor, responda se aceita os termos de uso.',
                termsNotAccepted: 'Você precisa aceitar os termos de uso para continuar.'
            }
        }
    };

    // Elementos do DOM
    const modal = document.getElementById('terms-modal');
    const termsLink = document.getElementById('terms-link');
    const closeBtn = document.getElementsByClassName('close')[0];
    const closeBtnBottom = document.querySelector('.close-btn');
    const connectBtn = document.getElementById('connect-btn');
    const accessForm = document.getElementById('access-form');
    const termsRadios = document.querySelectorAll('input[name="terms-choice"]');
    const successPopup = document.getElementById('success-popup');
    
    // Estado da aplicação
    let sessionData = {
        sessionId: null,
        startTime: null,
        clientMac: null,
        lastUpdate: CONFIG.company.lastUpdate
    };

    // Função para obter o MAC address do cliente
    async function getClientMac() {
        try {
            const response = await fetch(CONFIG.api.mac);
            if (!response.ok) throw new Error('Falha ao obter MAC address');
            const data = await response.json();
            return data.mac;
        } catch (error) {
            console.error('Erro ao obter MAC address:', error);
            return null;
        }
    }

    // Função para obter o IP do cliente
    async function getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            if (!response.ok) throw new Error('Falha ao obter IP do cliente');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.error('Erro ao obter IP do cliente:', error);
            return null;
        }
    }

    // Função para autenticar com o backend PHP
    async function authenticateWithBackend(clientMac, clientIp) {
        try {
            const response = await fetch(CONFIG.api.auth, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    clientMac,
                    clientIp,
                    timestamp: new Date().toISOString()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || CONFIG.texts.errorMessages.authError);
            }

            return {
                success: true,
                sessionId: data.sessionId
            };
        } catch (error) {
            console.error('Erro na autenticação:', error);
            throw new Error(CONFIG.texts.errorMessages.authError);
        }
    }

    // Função para validar o formulário
    function validateForm() {
        let termsAccepted = false;
        termsRadios.forEach(radio => {
            if (radio.checked && radio.value === 'yes') {
                termsAccepted = true;
            }
        });
        connectBtn.disabled = !termsAccepted;
        return termsAccepted;
    }

    // Função para mostrar o popup de sucesso
    function showSuccessPopup() {
        return new Promise((resolve) => {
            successPopup.style.display = 'flex';
            successPopup.offsetHeight; // Force reflow
            successPopup.classList.add('active');

            const continueBtn = document.getElementById('continue-btn');
            continueBtn.onclick = () => {
                successPopup.classList.remove('active');
                setTimeout(() => {
                    successPopup.style.display = 'none';
                    resolve();
                }, CONFIG.delays.animation);
            };
        });
    }

    // Função para fechar o modal
    function closeModal() {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }, CONFIG.delays.animation);
    }

    // Event Listeners para o modal
    termsLink.onclick = function(e) {
        e.preventDefault();
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
    };

    // Event listeners para fechar o modal
    closeBtn.onclick = closeModal;
    closeBtnBottom.onclick = closeModal;
    
    window.onclick = function(event) {
        if (event.target === modal) {
            closeModal();
        }
    };

    // Fechar modal com tecla ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Event Listeners para validação
    termsRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            validateForm();
        });
    });

    // Manipular envio do formulário
    accessForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateForm()) {
            alert(CONFIG.texts.errorMessages.termsRequired);
            return;
        }

        connectBtn.innerHTML = CONFIG.texts.connectingButton;
        connectBtn.disabled = true;

        try {
            // Obter MAC e IP do cliente
            const [clientMac, clientIp] = await Promise.all([
                getClientMac(),
                getClientIP()
            ]);

            if (!clientMac || !clientIp) {
                throw new Error(CONFIG.texts.errorMessages.networkError);
            }

            // Autenticar com o backend PHP
            const authResult = await authenticateWithBackend(clientMac, clientIp);

            if (authResult.success) {
                sessionData.sessionId = authResult.sessionId;
                sessionData.clientMac = clientMac;
                sessionData.startTime = new Date().toISOString();

                // Mostrar popup de sucesso
                await showSuccessPopup();

                // Redirecionar após delay
                setTimeout(() => {
                    window.location.href = CONFIG.redirectUrl;
                }, CONFIG.delays.redirect);
            } else {
                throw new Error(CONFIG.texts.errorMessages.authError);
            }
        } catch (error) {
            console.error('Erro no processo de conexão:', error);
            alert(error.message || CONFIG.texts.errorMessages.generalError);
            connectBtn.innerHTML = CONFIG.texts.connectButton;
            connectBtn.disabled = false;
        }
    });

    // Inicialização
    validateForm();
});