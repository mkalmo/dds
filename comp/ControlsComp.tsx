import React, { useState } from 'react';
import { Link, useHistory } from "react-router-dom";

const ControlsComp = () => {

    const history = useHistory();

    const [pbn, setPbn] = useState('W:AT97.Q5.Q2.AKT72 KJ86.JT6.AJ987.J 5432.9873.T43.95 Q.AK42.K65.Q8643');
    const [count, setCount] = useState(1);

    const playFunc = () => {
        history.push({
            pathname: '/play',
            search: `?pbn=${encodeURIComponent(pbn)}`
        });
    };

    return (
        <>
            <div className="controls">
                <div>
                    <input
                        value={pbn}
                        onChange={(e: any) => setPbn(e.target.value)}
                    />
                    <button onClick={playFunc}>
                        Play
                    </button>
                    <br />
                    <input
                        value={count}
                        onChange={(e: any) => setCount(e.target.value)}
                    />
                    <Link to={`print/${count}`}>Print</Link>
                </div>
            </div>

        </>);
}

export default ControlsComp;