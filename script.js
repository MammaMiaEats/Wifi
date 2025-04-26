// ... (previous CONFIG code remains the same)

// Função para obter o IP do cliente
async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) throw new Error('Falha ao obter IP do cliente');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Erro ao obter IP do cliente:', error);
        return '0.0.0.0';
    }
}

// Função para autenticar com o backend PHP
async function authenticateWithBackend(clientMac, clientIp) {
    try {
        const response = await fetch('auth.php', {
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

// Update the form submission handler
accessForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    if (!validateForm()) {
        alert(CONFIG.texts.errorMessages.termsRequired);
        return;
    }

    const originalButtonText = connectBtn.textContent;
    connectBtn.textContent = CONFIG.texts.connectingButton;
    connectBtn.disabled = true;

    try {
        // Obter MAC e IP do cliente
        const clientMac = await getClientMac();
        const clientIp = await getClientIP();

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
        connectBtn.textContent = originalButtonText;
        connectBtn.disabled = false;
    }
});

// ... (rest of the code remains the same)