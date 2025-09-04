import React, { Component } from 'react';
import Dao from "../modules/Dao.ts";
import {createBoard, createExercise} from "../modules/generator.ts";
import Wasm, { DDSModule } from "../modules/Wasm.ts";
import Exercise from "../modules/Exercise.ts";
import PrintBoardComp from "./PrintBoardComp.tsx";
import { showApiError } from "../modules/error-reporter.ts";

declare var Module: DDSModule;

interface State {
    entries: Entry[];
}

interface Entry {
    id: number;
    exercise: Exercise;
}

class ShowPrintBoardListComp extends Component<{}, State> {
    private dao: Dao;

    constructor(props: {}) {
        super(props);
        this.dao = new Dao();
        this.state = {
            entries: []
        };
    }

    async componentDidMount() {
        const result = await this.dao.getBoards();
        if (!result.success) {
            showApiError(result.error, 'Load boards for printing');
            return;
        }

        const boards = result.data || [];
        const wasm = new Wasm(Module);

        const entries = boards
            // .filter(b => b.id >= 11 && b.id <= 27)
            .map(b => {
            return {
                id: b.id,
                exercise: createExercise(createBoard(b.pbn, wasm), wasm)
            };
        });

        this.setState({ entries });
    }

    render() {
        return (
            <>
                { this.state.entries.map(entry =>
                    <PrintBoardComp num={entry.id}
                                    key={entry.id}
                                    exercise={entry.exercise} />)
                }
            </>
        );
    }
}

export default ShowPrintBoardListComp;
