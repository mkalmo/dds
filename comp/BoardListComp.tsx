import React, { Component } from 'react';
import { Link, withRouter, RouteComponentProps } from 'react-router-dom';
import Dao, { BoardData } from "../modules/Dao.ts";
import { showApiError } from "../modules/error-reporter.ts";

interface State {
    boards: BoardData[];
}

class BoardListComp extends Component<RouteComponentProps, State> {
    private dao: Dao = new Dao();

    constructor(props: RouteComponentProps) {
        super(props);
        this.state = {
            boards: []
        }
    }

    async componentDidMount() {
        const result = await this.dao.getBoards();
        if (result.success) {
            this.setState({ boards: result.data || [] });
        } else {
            const errorMsg = result.error || 'Failed to load boards';
            showApiError(errorMsg, 'Load boards');
        }
    }

    private formatHcp = (hcp: string): string => {
        return `HCP: ${hcp}`;
    };

    private handleDifficultyChange = async (boardId: number, difficulty: number): Promise<void> => {
        const result = await this.dao.updateBoardDifficulty(boardId, difficulty);

        if (result.success) {
            this.setState(prevState => ({
                boards: prevState.boards.map(board =>
                    board.id === boardId
                        ? { ...board, difficulty }
                        : board
                )
            }));
        } else {
            showApiError(result.error || 'Failed to update difficulty', 'Update difficulty');
        }
    };

    private renderDifficultyRating = (board: BoardData): JSX.Element => {
        return (
            <div className="difficulty-rating">
                {[1, 2, 3].map(level => (
                    <label key={level} className="difficulty-radio">
                        <input
                            type="radio"
                            name={`difficulty-${board.id}`}
                            value={level}
                            checked={board.difficulty === level}
                            onChange={() => this.handleDifficultyChange(board.id!, level)}
                        />
                    </label>
                ))}
            </div>
        );
    };

    render() {
        const { boards } = this.state;

        return (
            <div className={'board-list'}>
                <div className="board-list-navigation">
                    <Link to="/" className="back-link">← Back</Link>&nbsp;
                    <Link to="/show-print" className="back-link">Print</Link>
                </div>

                {boards.map((board) => (
                    <div
                        key={board.id}
                        className="board-item"
                        title={board.pbn} >

                        {board.id}

                        &nbsp; &nbsp;

                        <span>
                            {this.formatHcp(board.hcp)}
                        </span>

                        &nbsp; &nbsp;

                        {board.strain}

                        &nbsp; &nbsp;

                        {this.renderDifficultyRating(board)}

                        <div className="play-links">
                            <Link to={`/play?pbn=${encodeURIComponent(board.pbn)}&strain=${encodeURIComponent(board.strain)}`}>Play (declarer)</Link>&nbsp;
                            <Link to={`/defense?pbn=${encodeURIComponent(board.pbn)}&strain=${encodeURIComponent(board.strain)}`}>Play (defender)</Link>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
}

export default withRouter(BoardListComp);
