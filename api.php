<?php

const DATA_FILE = 'data.json';

header('Content-Type: application/json');

$cmd = $_GET['cmd'] ?? '';

if ($cmd === 'save-board') {
    $postData = json_decode(file_get_contents('php://input'), true);

    // save to DATA_FILE

} else if ($cmd === 'get-boards') {

    // read from DATA_FILE

} else {
    http_response_code(400);
    echo json_encode(['error' => 'Unknown command']);
}
