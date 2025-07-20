<?php

class BoardDto {
    public ?int $id;
    public string $pbn;
    public string $strain;
    public string $hcp;
    public ?int $difficulty;

    public function __construct(
        ?int $id = null,
        string $pbn = '',
        string $strain = '',
        string $hcp = '',
        ?int $difficulty = null
    ) {
        $this->id = $id;
        $this->pbn = $pbn;
        $this->strain = $strain;
        $this->hcp = $hcp;
        $this->difficulty = $difficulty;
    }

    /**
     * Create from array data
     */
    public static function fromArray(array $data): BoardDto {
        return new BoardDto(
            $data['id'] ?? null,
            $data['pbn'] ?? '',
            $data['strain'] ?? '',
            $data['hcp'] ?? '',
            $data['difficulty'] ?? null
        );
    }

    /**
     * Validate required fields for creation
     */
    public function validateForCreation(): array {
        $errors = [];
        if (empty($this->pbn)) $errors[] = 'pbn';
        if (empty($this->strain)) $errors[] = 'strain';
        if (empty($this->hcp)) $errors[] = 'hcp';
        return $errors;
    }

    /**
     * Merge update data with existing board data
     */
    public function mergeWith(array $updateData): BoardDto {
        $merged = clone $this;
        
        if (isset($updateData['pbn'])) $merged->pbn = $updateData['pbn'];
        if (isset($updateData['strain'])) $merged->strain = $updateData['strain'];
        if (isset($updateData['hcp'])) $merged->hcp = $updateData['hcp'];
        if (isset($updateData['difficulty'])) $merged->difficulty = $updateData['difficulty'];
        
        return $merged;
    }
}

class BoardRepository {
    private string $dataFile;

    public function __construct(string $dataFile = 'data.json') {
        $this->dataFile = $dataFile;
    }

    /**
     * Load data from file
     */
    private function loadData(): array {
        if (!file_exists($this->dataFile)) {
            return ['boards' => [], 'nextId' => 1];
        }
        return json_decode(file_get_contents($this->dataFile), true);
    }

    /**
     * Save data to file
     */
    private function saveData(array $data): bool {
        return file_put_contents($this->dataFile, json_encode($data, JSON_PRETTY_PRINT)) !== false;
    }

    /**
     * Find a board by ID
     */
    public function findById(int $id): ?BoardDto {
        $data = $this->loadData();
        foreach ($data['boards'] as $boardData) {
            if ($boardData['id'] === $id) {
                return BoardDto::fromArray($boardData);
            }
        }
        return null;
    }

    /**
     * Get all boards
     */
    public function findAll(): array {
        $data = $this->loadData();
        return array_map(function($boardData) {
            return BoardDto::fromArray($boardData);
        }, $data['boards']);
    }

    public function create(BoardDto $board): BoardDto {
        $errors = $board->validateForCreation();
        if (!empty($errors)) {
            throw new RuntimeException('Missing required fields: ' . implode(', ', $errors));
        }

        $data = $this->loadData();
        $newId = $data['nextId'];
        $data['nextId'] = $newId + 1;

        $board->id = $newId;

        $data['boards'][] = json_decode(json_encode($board), true);

        if (!$this->saveData($data)) {
            throw new RuntimeException('Failed to save board');
        }

        return $board;
    }

    /**
     * Update an existing board
     */
    public function update(int $id, array $updateData): BoardDto {
        $existingBoard = $this->findById($id);
        if ($existingBoard === null) {
            throw new RuntimeException('Board not found');
        }

        $updatedBoard = $existingBoard->mergeWith($updateData);

        $data = $this->loadData();
        for ($i = 0; $i < count($data['boards']); $i++) {
            if ($data['boards'][$i]['id'] === $id) {
                $data['boards'][$i] = json_decode(json_encode($updatedBoard), true);
                break;
            }
        }

        if (!$this->saveData($data)) {
            throw new RuntimeException('Failed to update board');
        }

        return $updatedBoard;
    }

    /**
     * Save a board (create or update based on presence of ID)
     */
    public function save(array $boardData): BoardDto {
        if (isset($boardData['id'])) {
            return $this->update(intval($boardData['id']), $boardData);
        } else {
            $board = BoardDto::fromArray($boardData);

            return $this->create($board);
        }
    }
}
