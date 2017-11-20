import React, { Component } from 'react';
import Bold from '../../../Components/Bold.jsx';
import CollapsePanel from '../../../Components/CollapsePanel.jsx';
import { capitalCase, isFloat } from '../lib/helpers';
import commonConsts from '../lib/commonConsts';

class NetworkwiseData extends Component {
    constructor(props) {
        super(props);

        this.state = {
            networkData: props.networkData,
            cpmCalc: props.cpmCalc,
            customToggleOptions: props.customToggleOptions
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ ...nextProps });
    }

    render() {
        const { networkData, cpmCalc, customToggleOptions } = this.state;

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

        const title = <div>{isFloat(total) ? total.toFixed(2) : total}</div>;

        return (<div style={{ width: '150px' }}>
            <CollapsePanel title={title} open={customToggleOptions ? customToggleOptions.toggleValue : false}>
                {(
                    networkDataArr.map((data, key) => {
                        return <div key={key}>{data}</div>
                    })
                )}
            </CollapsePanel>
        </div>);
    }
}

export default NetworkwiseData;