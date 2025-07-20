<?php

require_once 'BoardRepository.php';

const DATA_FILE = 'data.json';

header('Content-Type: application/json');

$cmd = $_GET['cmd'] ?? '';

$repository = new BoardRepository(DATA_FILE);

if ($cmd === 'save-board') {
    $raw = file_get_contents('php://input');

    $postData = json_decode($raw, true);

    if (!$postData) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON data']);
        exit;
    }

    echo json_encode($repository->save($postData));

} else if ($cmd === 'get-boards') {
        echo json_encode($repository->findAll());

} else {
    http_response_code(400);
    echo json_encode(['error' => 'Unknown command']);
}
