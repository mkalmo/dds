import { callApi, ApiResponse } from "./api-caller.ts";

export interface BoardData {
    id?: number;
    pbn: string;
    strain: string;
}

export default class Dao {

    async saveBoard(boardData: BoardData): Promise<ApiResponse<BoardData>> {
        return callApi('save-board', 'POST', boardData);
    }

    async getBoards(): Promise<ApiResponse<BoardData[]>> {
        return callApi('get-boards', 'GET', null);
    }
}
