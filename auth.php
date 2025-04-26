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
        'lastUpdate' => '2025-04-26 02:34:19'
    ],
    'router' => [
        'ip' => '10.0.0.1',
        'login_url' => 'http://10.0.0.1/login',
        'auth_port' => '1812',
        'acct_port' => '1813',
        'nas_identifier' => 'AP310_MammaMia',
        'ssid' => 'MammaMiaEats_WiFi'
    ]
];

// Função para registrar logs
function writeLog($message) {
    $logFile = 'auth.log';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message\n";
    file_put_contents($logFile, $logMessage, FILE_APPEND);
}

// Função para validar MAC address
function isValidMac($mac) {
    return preg_match('/^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/', $mac);
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
        'auth_type' => 'terms_accepted'
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
    curl_close($ch);

    writeLog("Auth attempt - MAC: $clientMac, IP: $clientIp, Response: $httpCode");

    return $httpCode >= 200 && $httpCode < 300;
}

// Processar requisição
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Validar dados recebidos
    if (!isset($input['clientMac']) || !isset($input['clientIp'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Missing required parameters'
        ]);
        exit;
    }

    $clientMac = $input['clientMac'];
    $clientIp = $input['clientIp'];

    // Validar MAC
    if (!isValidMac($clientMac)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Invalid MAC address'
        ]);
        exit;
    }

    // Tentar autenticar
    $success = authenticateWithRouter($clientMac, $clientIp);

    if ($success) {
        echo json_encode([
            'success' => true,
            'message' => 'Authentication successful',
            'sessionId' => uniqid('SESSION_'),
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Authentication failed'
        ]);
    }
} else {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Method not allowed'
    ]);
}