<?php

const DATA_FILE = 'data.json';
const ID_FILE = 'id.txt';

header('Content-Type: application/json');

$cmd = $_GET['cmd'] ?? '';

if ($cmd === 'save-board') {
    $postData = json_decode(file_get_contents('php://input'), true);

    if (!$postData) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON data']);
        exit;
    }

    $postData['id'] = nextId();

    $data = loadData();

    $data['boards'][] = $postData;

    if (saveData($data)) {
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
        throw new RuntimeException('File not found');
    }

    $data = ['boards' => []];
    $existingData = json_decode(file_get_contents(DATA_FILE), true);

    if ($existingData && isset($existingData['boards'])) {
        $data = $existingData;
    }

    return $data;
}

function saveData($data): bool {
    return file_put_contents(DATA_FILE,
            json_encode($data, JSON_PRETTY_PRINT)) !== false;
}

function nextId(): int {
    if (!file_exists(ID_FILE)) {
        throw new RuntimeException('id file not found');
    }

    $nextId = intval(file_get_contents(ID_FILE)) + 1;

    file_put_contents(ID_FILE, $nextId);

    return $nextId;
}
