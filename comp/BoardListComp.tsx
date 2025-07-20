import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Dao, { BoardData } from "../modules/Dao.ts";
import { formatStrain } from "../modules/common.ts";
import { Strain } from "../modules/constants.ts";
import { showApiError } from "../modules/error-reporter.ts";

interface BoardListCompProps {
    onBoardSelect?: (board: BoardData) => void;
    className?: string;
}

interface BoardListCompState {
    boards: BoardData[];
    error: string | null;
}

class BoardListComp extends Component<BoardListCompProps, BoardListCompState> {
    private dao: Dao;

    constructor(props: BoardListCompProps) {
        super(props);
        this.state = {
            boards: [],
            error: null
        };
        this.dao = new Dao();
    }

    async componentDidMount() {
        try {
            const result = await this.dao.getBoards();
            if (result.success) {
                this.setState({
                    boards: result.data || [],
                    error: null
                });
            } else {
                const errorMsg = result.error || 'Failed to load boards';
                this.setState({ error: errorMsg });
                showApiError(errorMsg, 'Load boards');
            }
        } catch (error) {
            const errorMsg = 'Failed to load boards';
            this.setState({ error: errorMsg });
            showApiError(error, 'Load boards');
        }
    }

    private formatHcp = (hcp: string): string => {
        return `HCP: ${hcp} (S/N)`;
    };

    private handleBoardClick = (board: BoardData): void => {
        if (this.props.onBoardSelect) {
            this.props.onBoardSelect(board);
        }
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
        const { boards, error } = this.state;
        const { className } = this.props;

        return (
            <div className={`board-list ${className || ''}`}>
                <div className="board-list-navigation">
                    <Link to="/" className="back-link">← Back</Link>
                </div>

                {error && (
                    <div className="board-list-error">
                        Error: {error}
                    </div>
                )}

                {!error && boards.length === 0 && (
                    <div className="board-list-empty">
                        No saved boards found.
                    </div>
                )}

                {!error && boards.length > 0 && (
                    <div className="board-list-header">
                        <h2>Saved Boards ({boards.length})</h2>
                    </div>
                )}

                {boards.map((board) => (
                    <div
                        key={board.id}
                        className="board-item"
                        onClick={() => this.handleBoardClick(board)}
                        title={board.pbn}
                    >
                        <div className="board-item-header">
                            <span className="board-id">{board.id}</span>
                            <span className="board-strain">
                                {formatStrain(board.strain as Strain)}
                            </span>
                        </div>

                        <div className="board-hcp">
                            {this.formatHcp(board.hcp)}
                        </div>

                        {this.renderDifficultyRating(board)}
                    </div>
                ))}
            </div>
        );
    }
}

export default BoardListComp;
