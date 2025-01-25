import React, { useState } from 'react';
import { useHistory } from "react-router-dom";
import Repository from "../modules/Repository.ts";

const ControlsComp = () => {

    const history = useHistory();

    const [pbn, setPbn] = useState('W:AT97.Q5.Q2.AKT72 KJ86.JT6.AJ987.J 5432.9873.T43.95 Q.AK42.K65.Q8643');

    const playFunc = () => {
        new Repository().storePbn(pbn);

        history.push('/play');
    };

    return (
        <>
            <div className="controls">
                <div>
                    <input
                        value={pbn}
                        onChange={ (e: any) => setPbn(e.target.value)}
                    />
                    <button onClick={playFunc}>
                        Play
                    </button>
                </div>
            </div>

        </>);
}

export default ControlsComp;