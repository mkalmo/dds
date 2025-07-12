export interface BoardData {
    id?: number;
    pbn: string;
    strain: string;
    createdAt?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
}

export default class Dao {
    private readonly baseUrl: string;

    constructor(baseUrl: string = './api.php') {
        this.baseUrl = baseUrl;
    }

    async saveBoard(boardData: BoardData): Promise<ApiResponse<BoardData>> {
        try {
            const response = await fetch(`${this.baseUrl}?cmd=save-board`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...boardData,
                    createdAt: boardData.createdAt || new Date().toISOString()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            return {
                success: true,
                data: result
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    async getBoards(): Promise<ApiResponse<BoardData[]>> {
        try {
            const response = await fetch(`${this.baseUrl}?cmd=get-boards`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            return {
                success: true,
                data: result
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
}
