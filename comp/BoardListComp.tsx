import React, { Component } from 'react';
import Dao, { BoardData } from "../modules/Dao.ts";
import { formatStrain } from "../modules/common.ts";
import { Strain } from "../modules/constants.ts";

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
        const result = await this.dao.getBoards();
        if (result.success) {
            this.setState({ 
                boards: result.data || [], 
                error: null 
            });
        } else {
            this.setState({ 
                error: result.error || 'Failed to load boards' 
            });
        }
    }

    private formatDate = (isoString: string): string => {
        return new Date(isoString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    private truncatePbn = (pbn: string, maxLength: number = 50): string => {
        return pbn.length > maxLength ? `${pbn.substring(0, maxLength)}...` : pbn;
    };

    private handleBoardClick = (board: BoardData): void => {
        if (this.props.onBoardSelect) {
            this.props.onBoardSelect(board);
        }
    };

    render() {
        const { boards, error } = this.state;
        const { className } = this.props;

        return (
            <div className={`board-list ${className || ''}`}>
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
                        
                        <div className="board-pbn">
                            {this.truncatePbn(board.pbn)}
                        </div>
                    </div>
                ))}
            </div>
        );
    }
}

export default BoardListComp;
