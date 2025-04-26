document.addEventListener('DOMContentLoaded', function() {
    // Configurações do Portal
    const CONFIG = {
        // Dados da empresa
        company: {
            name: 'Mamma Mia Eats',
            founded: '2015',
            currentYear: '2025',
            lastUpdate: '2025-04-26 04:11:23',
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
        
        // URLs de redirecionamento
        redirectUrl: 'https://instagram.com/MammaMiaEats',
        
        // Tempos de delay (em milissegundos)
        delays: {
            redirect: 2000,    // Tempo antes do redirecionamento
            animation: 300,    // Duração das animações
            retry: 1000,      // Tempo entre tentativas
            timeout: 10000    // Tempo limite para requisições
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
            welcomeMessage: 'Bem-vindo à rede Wi-Fi Mamma Mia Eats.',
            experienceMessage: 'Aproveite sua experiência gastronômica!',
            continueButton: 'Continuar',
            copyright: `© Mamma Mia Eats (2015 - 2025). Todos os direitos reservados.`,
            errorMessages: {
                networkError: 'Erro de conexão com o roteador. Verifique sua conexão Wi-Fi.',
                authError: 'Falha na autenticação. Por favor, tente novamente.',
                generalError: 'Ops! Algo deu errado. Por favor, tente novamente.',
                termsRequired: 'Por favor, responda se aceita os termos de uso.',
                termsNotAccepted: 'É necessário aceitar os termos de uso para continuar.',
                routerTimeout: 'Tempo de conexão excedido. Verifique se o roteador está funcionando.',
                serverError: 'Erro no servidor. Por favor, tente novamente em alguns minutos.',
                invalidMAC: 'Não foi possível identificar seu dispositivo. Verifique se está conectado ao Wi-Fi.',
                disconnected: 'Sua conexão com a internet foi perdida. Reconecte-se e tente novamente.',
                retryMessage: 'Tentando conectar novamente...',
                maxRetries: 'Número máximo de tentativas excedido. Por favor, tente novamente mais tarde.'
            }
        },
        
        // Configurações de retry
        retry: {
            maxAttempts: 3,
            initialDelay: 1000,
            maxDelay: 5000
        }
    };

    // Elementos do DOM
    const elements = {
        modal: document.getElementById('terms-modal'),
        termsLink: document.getElementById('terms-link'),
        closeBtn: document.getElementsByClassName('close')[0],
        closeBtnBottom: document.querySelector('.close-btn'),
        connectBtn: document.getElementById('connect-btn'),
        accessForm: document.getElementById('access-form'),
        termsRadios: document.querySelectorAll('input[name="terms-choice"]'),
        successPopup: document.getElementById('success-popup'),
        errorPopup: document.getElementById('error-popup'),
        errorMessage: document.querySelector('.error-message'),
        errorBtn: document.querySelector('.error-btn')
    };

    // Estado da aplicação
    let state = {
        sessionId: null,
        startTime: null,
        clientMac: null,
        retryCount: 0,
        lastError: null,
        isConnecting: false
    };

    // Funções de utilidade
    const utils = {
        sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
        
        formatDate: (date) => {
            return new Intl.DateTimeFormat('pt-BR', {
                year: 'numeric',
                month: 'long',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }).format(date);
        },
        
        showError: (message) => {
            elements.errorMessage.textContent = message;
            elements.errorPopup.style.display = 'flex';
            elements.errorPopup.classList.add('active');
        },
        
        hideError: () => {
            elements.errorPopup.classList.remove('active');
            setTimeout(() => {
                elements.errorPopup.style.display = 'none';
            }, CONFIG.delays.animation);
        }
    };

    // Funções de API
    const api = {
        getClientMac: async () => {
            try {
                const response = await fetch(CONFIG.api.mac);
                if (!response.ok) throw new Error('Falha ao obter MAC address');
                const data = await response.json();
                return data.mac;
            } catch (error) {
                console.error('Erro ao obter MAC address:', error);
                throw new Error(CONFIG.texts.errorMessages.invalidMAC);
            }
        },

        getClientIP: async () => {
            try {
                const response = await fetch('https://api.ipify.org?format=json');
                if (!response.ok) throw new Error('Falha ao obter IP');
                const data = await response.json();
                return data.ip;
            } catch (error) {
                console.error('Erro ao obter IP:', error);
                throw new Error(CONFIG.texts.errorMessages.networkError);
            }
        },

        authenticate: async (clientMac, clientIp) => {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), CONFIG.delays.timeout);

                const response = await fetch(CONFIG.api.auth, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        clientMac,
                        clientIp,
                        timestamp: new Date().toISOString()
                    }),
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || CONFIG.texts.errorMessages.authError);
                }

                const data = await response.json();
                return data;

            } catch (error) {
                if (error.name === 'AbortError') {
                    throw new Error(CONFIG.texts.errorMessages.routerTimeout);
                }
                throw error;
            }
        }
    };

    // Continua no próximo bloco...
	    // Continuação do script.js...

    // Gerenciamento do Modal
    const modalManager = {
        open: (modal) => {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            requestAnimationFrame(() => {
                modal.classList.add('active');
            });
        },

        close: (modal) => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, CONFIG.delays.animation);
        },

        init: () => {
            // Event listeners para o modal de termos
            elements.termsLink.onclick = (e) => {
                e.preventDefault();
                modalManager.open(elements.modal);
            };

            elements.closeBtn.onclick = () => modalManager.close(elements.modal);
            elements.closeBtnBottom.onclick = () => modalManager.close(elements.modal);

            // Fechar modal clicando fora
            window.onclick = (event) => {
                if (event.target === elements.modal) {
                    modalManager.close(elements.modal);
                }
            };

            // Fechar com ESC
            document.addEventListener('keydown', (event) => {
                if (event.key === 'Escape' && elements.modal.classList.contains('active')) {
                    modalManager.close(elements.modal);
                }
            });
        }
    };

    // Gerenciamento do Formulário
    const formManager = {
        validateForm: () => {
            let termsAccepted = false;
            elements.termsRadios.forEach(radio => {
                if (radio.checked && radio.value === 'yes') {
                    termsAccepted = true;
                }
            });
            elements.connectBtn.disabled = !termsAccepted;
            return termsAccepted;
        },

        showLoading: () => {
            elements.connectBtn.innerHTML = CONFIG.texts.connectingButton;
            elements.connectBtn.disabled = true;
        },

        hideLoading: () => {
            elements.connectBtn.innerHTML = CONFIG.texts.connectButton;
            elements.connectBtn.disabled = false;
        },

        init: () => {
            elements.termsRadios.forEach(radio => {
                radio.addEventListener('change', formManager.validateForm);
            });

            elements.accessForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                if (!formManager.validateForm()) {
                    utils.showError(CONFIG.texts.errorMessages.termsRequired);
                    return;
                }
                await connectionManager.connect();
            });
        }
    };

    // Gerenciamento da Conexão
    const connectionManager = {
        showSuccess: () => {
            return new Promise((resolve) => {
                modalManager.open(elements.successPopup);
                const continueBtn = document.getElementById('continue-btn');
                continueBtn.onclick = () => {
                    modalManager.close(elements.successPopup);
                    resolve();
                };
            });
        },

        connect: async () => {
            if (state.isConnecting) return;
            state.isConnecting = true;
            state.retryCount = 0;
            
            try {
                formManager.showLoading();

                // Verificar conexão com a internet
                if (!navigator.onLine) {
                    throw new Error(CONFIG.texts.errorMessages.disconnected);
                }

                // Obter MAC e IP
                const [clientMac, clientIp] = await Promise.all([
                    api.getClientMac(),
                    api.getClientIP()
                ]);

                state.clientMac = clientMac;

                // Tentativas de autenticação com retry
                while (state.retryCount < CONFIG.retry.maxAttempts) {
                    try {
                        const authResult = await api.authenticate(clientMac, clientIp);
                        
                        if (authResult.success) {
                            state.sessionId = authResult.sessionId;
                            state.startTime = new Date().toISOString();

                            await connectionManager.showSuccess();

                            // Redirecionar após delay
                            setTimeout(() => {
                                window.location.href = CONFIG.redirectUrl;
                            }, CONFIG.delays.redirect);
                            
                            return;
                        }
                    } catch (error) {
                        state.lastError = error;
                        state.retryCount++;

                        if (state.retryCount < CONFIG.retry.maxAttempts) {
                            elements.connectBtn.innerHTML = `
                                <span class="loading-spinner"></span>
                                ${CONFIG.texts.errorMessages.retryMessage} (${state.retryCount}/${CONFIG.retry.maxAttempts})
                            `;
                            
                            await utils.sleep(CONFIG.retry.initialDelay * state.retryCount);
                            continue;
                        }
                        
                        throw error;
                    }
                }

                throw new Error(CONFIG.texts.errorMessages.maxRetries);

            } catch (error) {
                console.error('Erro no processo de conexão:', error);
                utils.showError(error.message || CONFIG.texts.errorMessages.generalError);
            } finally {
                state.isConnecting = false;
                formManager.hideLoading();
            }
        }
    };

    // Inicialização
    const init = () => {
        modalManager.init();
        formManager.init();
        formManager.validateForm();

        // Configurar botão de fechar erro
        elements.errorBtn.onclick = utils.hideError;
    };

    // Iniciar aplicação
    init();
});