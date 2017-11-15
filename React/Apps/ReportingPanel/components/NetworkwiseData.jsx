import React from 'react';
import Bold from '../../../Components/Bold.jsx';
import { capitalCase, isFloat } from '../lib/helpers';

const NetworkwiseData = props => {
    const { networkData } = props;

    let total = 0, networkDataArr = [];
    for (let i in networkData) {
        total += Number(networkData[i]);
        networkDataArr.push(<div><Bold>{capitalCase(i)}</Bold> : {networkData[i]}</div>)
    }

    return (<div>
        <div className="network-total"><Bold>Total</Bold> : {isFloat(total) ? total.toFixed(2) : total}</div>
        {(
            networkDataArr.map((data, key) => {
                return <div key={key}>{data}</div>
            })
        )}
    </div>);
};

export default NetworkwiseData;