import React from 'react';
import Bold from '../../../Components/Bold.jsx';
import { capitalCase, isFloat } from '../lib/helpers';
import commonConsts from '../lib/commonConsts';

const NetworkwiseData = props => {
    const { networkData, cpmCalc } = props;

    let total = 0, networkDataArr = [];
    for (let i in networkData) {

        if (!cpmCalc) {
            total += Number(networkData[i]);
        }
        networkDataArr.push(<div><Bold>{i === commonConsts.NETWORKS.dfp ? 'Adp' : capitalCase(i)}</Bold> : {networkData[i]}</div>)
    }

    if (cpmCalc) {
        const { impressions, revenue } = cpmCalc;
        total += (revenue * 1000) / impressions;
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