<?php

const DATA_FILE = 'data.json';

header('Content-Type: application/json');

$cmd = $_GET['cmd'] ?? '';

if ($cmd === 'save-board') {
    $raw = file_get_contents('php://input');

    $postData = json_decode($raw, true);

    if (!$postData) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON data']);
        exit;
    }

    $json = loadData();

    $nextId = $json['nextId'];
    $json['nextId'] = intval($nextId) + 1;

    $postData['id'] = $nextId;
    $postData['createdAt'] = date("c");
    $json['boards'][] = $postData;

    if (saveData($json)) {
        echo json_encode($postData);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save board']);
    }

} else if ($cmd === 'get-boards') {

    $data = loadData();
    echo json_encode($data['boards']);

} else {
    http_response_code(400);
    echo json_encode(['error' => 'Unknown command']);
}

function loadData(): array {
    if (!file_exists(DATA_FILE)) {
        return ['boards' => [], 'nextId' => 1];
    }

    return json_decode(file_get_contents(DATA_FILE), true);
}

function saveData($data): bool {
    return file_put_contents(DATA_FILE,
            json_encode($data, JSON_PRETTY_PRINT)) !== false;
}

function varDumpToString($variable) {
    ob_start();                 // Start output buffering
    var_dump($variable);       // Dump the variable
    $output = ob_get_clean();  // Get buffer contents and clean buffer
    return $output;            // Return the captured output as a string
}