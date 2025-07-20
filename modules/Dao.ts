import { callApi, ApiResponse } from "./api-caller.ts";

export interface BoardData {
    id?: number;
    pbn: string;
    strain: string;
    hcp: string;
    difficulty?: number;
}

export default class Dao {

    async saveBoard(boardData: BoardData): Promise<ApiResponse<BoardData>> {
        return callApi('save-board', 'POST', boardData);
    }

    async getBoards(): Promise<ApiResponse<BoardData[]>> {
        return callApi('get-boards', 'GET', null);
    }

    async updateBoardDifficulty(boardId: number, difficulty: number): Promise<ApiResponse<BoardData>> {
        // Use the existing save-board endpoint with the board ID to update difficulty
        return callApi('save-board', 'POST', { id: boardId, difficulty });
    }
}
