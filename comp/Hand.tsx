import React from 'react';

type Props = {
    num: number,
}

const Hand = (props: Props) => {

    return (
        <div className="hand">
            &#9824; A K 10 4<br/>
            &#9829; 5 2 7<br/>
            &#9830; J Q<br/>
            &#9827; K 8 6 2<br/>
        </div>
    );
}

export default Hand;