<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Configurações
$CONFIG = [
    'company' => [
        'name' => 'Mamma Mia Eats',
        'user' => 'MammaMiaEats',
        'lastUpdate' => '2025-04-26 02:43:24'
    ],
    'router' => [
        'ip' => '10.0.0.1',
        'login_url' => 'http://10.0.0.1/login',
        'status_url' => 'http://10.0.0.1/status',
        'logout_url' => 'http://10.0.0.1/logout',
        'auth_port' => '1812',
        'acct_port' => '1813',
        'nas_identifier' => 'AP310_MammaMia',
        'ssid' => 'MammaMiaEats_WiFi'
    ],
    'session' => [
        'timeout' => 3600, // 1 hora
        'cleanup_probability' => 0.01 // 1% chance de limpar sessões antigas
    ]
];

// Diretório para logs e sessões
define('LOG_DIR', __DIR__ . '/logs');
define('SESSION_DIR', __DIR__ . '/sessions');

// Criar diretórios se não existirem
if (!file_exists(LOG_DIR)) mkdir(LOG_DIR, 0755, true);
if (!file_exists(SESSION_DIR)) mkdir(SESSION_DIR, 0755, true);

// Função para registrar logs
function writeLog($message, $type = 'info') {
    $logFile = LOG_DIR . '/auth_' . date('Y-m-d') . '.log';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp][$type] $message\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

// Função para validar MAC address
function isValidMac($mac) {
    return preg_match('/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/', $mac);
}

// Função para validar endereço IP
function isValidIP($ip) {
    return filter_var($ip, FILTER_VALIDATE_IP);
}

// Função para gerar ID de sessão único
function generateSessionId() {
    return uniqid('SESSION_', true) . '_' . bin2hex(random_bytes(8));
}

// Função para salvar sessão
function saveSession($sessionId, $data) {
    $filename = SESSION_DIR . '/' . $sessionId . '.json';
    $data['created_at'] = time();
    $data['last_updated'] = time();
    file_put_contents($filename, json_encode($data));
}

// Função para limpar sessões antigas
function cleanupSessions() {
    if (rand(1, 100) <= ($CONFIG['session']['cleanup_probability'] * 100)) {
        $files = glob(SESSION_DIR . '/*.json');
        $now = time();
        
        foreach ($files as $file) {
            $data = json_decode(file_get_contents($file), true);
            if ($now - $data['last_updated'] > $CONFIG['session']['timeout']) {
                unlink($file);
                writeLog("Cleaned up expired session: " . basename($file, '.json'), 'cleanup');
            }
        }
    }
}

// Função para autenticar no roteador
function authenticateWithRouter($clientMac, $clientIp) {
    global $CONFIG;
    
    $data = http_build_query([
        'username' => $clientMac,
        'password' => 'authenticated_by_terms',
        'mac' => $clientMac,
        'ip' => $clientIp,
        'nas_id' => $CONFIG['router']['nas_identifier'],
        'ssid' => $CONFIG['router']['ssid'],
        'auth_type' => 'terms_accepted',
        'timestamp' => date('c')
    ]);

    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $CONFIG['router']['login_url'],
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $data,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/x-www-form-urlencoded'
        ]
    ]);

    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $error = curl_error($ch);
    curl_close($ch);

    writeLog("Auth attempt - MAC: $clientMac, IP: $clientIp, Response: $httpCode, Error: $error");

    return [
        'success' => ($httpCode >= 200 && $httpCode < 300),
        'httpCode' => $httpCode,
        'response' => $response,
        'error' => $error
    ];
}

// Processar requisição
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        // Validar dados recebidos
        if (!isset($input['clientMac']) || !isset($input['clientIp'])) {
            throw new Exception('Missing required parameters');
        }

        $clientMac = strtoupper($input['clientMac']);
        $clientIp = $input['clientIp'];

        // Validar MAC e IP
        if (!isValidMac($clientMac)) {
            throw new Exception('Invalid MAC address');
        }
        if (!isValidIP($clientIp)) {
            throw new Exception('Invalid IP address');
        }

        // Limpar sessões antigas
        cleanupSessions();

        // Tentar autenticar
        $authResult = authenticateWithRouter($clientMac, $clientIp);

        if ($authResult['success']) {
            // Gerar e salvar sessão
            $sessionId = generateSessionId();
            $sessionData = [
                'mac' => $clientMac,
                'ip' => $clientIp,
                'auth_time' => date('c'),
                'last_activity' => time()
            ];
            
            saveSession($sessionId, $sessionData);
            writeLog("Authentication successful - Session: $sessionId, MAC: $clientMac", 'success');

            echo json_encode([
                'success' => true,
                'message' => 'Authentication successful',
                'sessionId' => $sessionId,
                'timestamp' => date('c')
            ]);
        } else {
            throw new Exception('Router authentication failed: ' . $authResult['error']);
        }
    } catch (Exception $e) {
        http_response_code(400);
        writeLog("Error: " . $e->getMessage(), 'error');
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
}