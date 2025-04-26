document.addEventListener('DOMContentLoaded', function() {
    // Configurações do Portal
    const CONFIG = {
        // Dados da empresa
        company: {
            name: 'Mamma Mia Eats',
            founded: '2015',
            currentYear: '2025',
            lastUpdate: '2025-04-26 01:25:33'
        },
        
        // Configurações do roteador
        router: {
            serverIP: '10.0.0.1',
            authPort: '1812',
            accountPort: '1813',
            ssid: 'MammaMiaEats_WiFi',
            nasIdentifier: 'AP310_MammaMia'
        },
        
        // URLs de redirecionamento
        urls: {
            success: 'http://mammamia.eats',
            terms: '#',
            facebook: 'https://facebook.com/MammaMiaEats',
            instagram: 'https://instagram.com/MammaMiaEats',
            whatsapp: 'https://wa.me/seunumero'
        },
        
        // Textos personalizáveis
        texts: {
            mainQuestion: 'Você aceita nosso termo de uso?',
            termsLink: 'Ver Termos de Uso',
            connectButton: 'Conectar ao WI-FI',
            successTitle: 'Conectado com Sucesso!',
            welcomeMessage: 'Bem vindo à rede Wi-Fi Mamma Mia Eats.',
            experienceMessage: 'Aproveite sua experiência gastronômica!',
            continueButton: 'Continuar',
            copyright: '© Mamma Mia Eats (2015 - 2025). Todos os direitos reservados.'
        }
    };

    // Elementos do DOM
    const modal = document.getElementById('terms-modal');
    const termsLink = document.getElementById('terms-link');
    const closeBtn = document.getElementsByClassName('close')[0];
    const connectBtn = document.getElementById('connect-btn');
    const accessForm = document.getElementById('access-form');
    const termsRadios = document.getElementsByName('terms-choice');
    
    // Estado da aplicação
    let sessionData = {
        sessionId: null,
        startTime: null,
        clientMac: null,
        lastUpdate: CONFIG.company.lastUpdate
    };

    // Função para validar o formulário
    function validateForm() {
        const termsAccepted = Array.from(termsRadios).find(radio => radio.checked)?.value === 'yes';
        connectBtn.disabled = !termsAccepted;
    }

    // Função para obter MAC do cliente
    async function getClientMac() {
        try {
            const response = await fetch(`http://${CONFIG.router.serverIP}/api/client-mac`);
            const data = await response.json();
            return data.mac_address;
        } catch (error) {
            console.error('Erro ao obter MAC do cliente:', error);
            return null;
        }
    }

    // Função para autenticar com o roteador
    async function authenticateWithRouter(userData) {
        const authEndpoint = `http://${CONFIG.router.serverIP}:${CONFIG.router.authPort}/api/authenticate`;
        
        const authData = {
            ...userData,
            nas_identifier: CONFIG.router.nasIdentifier,
            ssid: CONFIG.router.ssid,
            auth_type: 'external',
            timestamp: new Date().toISOString()
        };

        try {
            const response = await fetch(authEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(authData)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro na autenticação:', error);
            throw error;
        }
    }

    // Função para registrar contabilidade
    async function registerAccounting(accountingData) {
        const accountingEndpoint = `http://${CONFIG.router.serverIP}:${CONFIG.router.accountPort}/api/accounting`;
        
        try {
            await fetch(accountingEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...accountingData,
                    nas_identifier: CONFIG.router.nasIdentifier,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error('Erro no registro de contabilidade:', error);
        }
    }

    // Função para mostrar o popup de sucesso
    function showSuccessPopup() {
        const successPopup = document.getElementById('success-popup');
        
        successPopup.style.display = 'flex';
        setTimeout(() => {
            successPopup.classList.add('active');
        }, 10);

        return new Promise((resolve) => {
            const continueBtn = document.getElementById('continue-btn');
            
            continueBtn.onclick = () => {
                successPopup.classList.remove('active');
                setTimeout(() => {
                    successPopup.style.display = 'none';
                    resolve();
                }, 300);
            };
        });
    }

    // Event Listeners para o modal
    termsLink.onclick = function(e) {
        e.preventDefault();
        modal.style.display = "flex";
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => {
            modal.classList.add('active');
        });
    };

    function closeModal() {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = "none";
            document.body.style.overflow = 'auto';
        }, 300);
    }

    closeBtn.onclick = closeModal;

    window.onclick = function(event) {
        if (event.target == modal) {
            closeModal();
        }
    };

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Event Listeners para validação
    termsRadios.forEach(radio => {
        radio.addEventListener('change', validateForm);
    });

    // Manipular envio do formulário
    accessForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!Array.from(termsRadios).some(radio => radio.checked)) {
            alert('Por favor, responda se aceita os termos de uso.');
            return;
        }

        if (Array.from(termsRadios).find(radio => radio.checked)?.value === 'no') {
            alert('Você precisa aceitar os termos de uso para continuar.');
            return;
        }

        // Iniciar processo de conexão
        connectBtn.textContent = 'Conectando...';
        connectBtn.disabled = true;

        try {
            // Obter MAC do cliente
            sessionData.clientMac = await getClientMac();
            sessionData.startTime = new Date().toISOString();

            // Dados do usuário
            const userData = {
                accepted_terms: true,
                connection_timestamp: sessionData.startTime,
                client_mac: sessionData.clientMac,
                user_agent: navigator.userAgent,
                last_update: CONFIG.company.lastUpdate
            };

            // Autenticar com o roteador
            const authResponse = await authenticateWithRouter(userData);

            if (authResponse.success) {
                sessionData.sessionId = authResponse.session_id;

                // Registrar início da sessão
                await registerAccounting({
                    session_id: sessionData.sessionId,
                    status: 'start'
                });

                // Mostrar popup de sucesso
                await showSuccessPopup();

                // Registrar término da sessão
                await registerAccounting({
                    session_id: sessionData.sessionId,
                    status: 'stop'
                });

                // Redirecionar para página inicial
                window.location.href = CONFIG.urls.success;
            } else {
                throw new Error('Falha na autenticação');
            }
        } catch (error) {
            console.error('Erro no processo de conexão:', error);
            alert('Erro ao conectar. Por favor, tente novamente.');
            connectBtn.textContent = CONFIG.texts.connectButton;
            connectBtn.disabled = false;
        }
    });

    // Inicialização
    validateForm();
});