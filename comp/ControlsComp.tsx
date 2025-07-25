import React, { useState } from 'react';
import { Link, useHistory } from "react-router-dom";
import Dao, { BoardData } from "../modules/Dao.ts";
import Wasm, { DDSModule } from "../modules/Wasm.ts";
import Deal from "../modules/Deal.ts";
import { Player } from "../modules/constants.ts";
import { showApiError } from "../modules/error-reporter.ts";

declare var Module: DDSModule;

const ControlsComp = () => {

    const history = useHistory();
    const dao = new Dao();

    const [pbn, setPbn] = useState('W:AT97.Q5.Q2.AKT72 KJ86.JT6.AJ987.J 5432.9873.T43.95 Q.AK42.K65.Q8643');
    const [count, setCount] = useState(1);
    const [message, setMessage] = useState<string>('');

    const playFunc = () => {
        history.push({
            pathname: '/play',
            search: `?pbn=${encodeURIComponent(pbn)}`
        });
    };

    const saveFunc = async () => {
        // Calculate strain for the board
        const strain = new Wasm(Module).calcDDTable(pbn).getBestStrain();

        // Calculate HCP for South and North players
        const deal = Deal.fromPBN(pbn);
        const southHcp = deal.getHcp(Player.South);
        const northHcp = deal.getHcp(Player.North);
        const hcp = `${southHcp}/${northHcp}`;

        const boardData: BoardData = {
            pbn,
            strain,
            hcp
        };

        const result = await dao.saveBoard(boardData);

        if (result.success) {
            setMessage(`Board saved successfully! ID: ${result.data?.id}`);
            setTimeout(() => setMessage(''), 3000); // Clear status after 3 seconds
        } else {
            const errorMsg = result.error || 'Failed to save board';
            showApiError(errorMsg, 'Save board');
        }
    };

    return (
        <>
            <div className="controls">
                <div>
                    <div>
                        <label>PBN:</label>
                        <br />
                        <input
                            value={pbn}
                            onChange={(e: any) => setPbn(e.target.value)}
                            style={{ width: '500px' }}
                        />
                    </div>
                    <br />
                    <div>
                        <button onClick={playFunc}>
                            Play
                        </button>
                        <button onClick={saveFunc} style={{ marginLeft: '10px' }}>
                            Save
                        </button>
                        {message && (
                            <span style={{
                                marginLeft: '10px',
                                color: 'green'
                            }}>
                                {message}
                            </span>
                        )}
                    </div>
                    <br />
                    <div>
                        <input
                            value={count}
                            onChange={(e: any) => setCount(e.target.value)}
                        />
                        <Link to={`generate-print/${count}`}>Print</Link>
                    </div>
                    <br />
                    <div>
                        <Link to="/boards">View Saved Boards</Link>
                    </div>
                </div>
            </div>

        </>);
}

export default ControlsComp;