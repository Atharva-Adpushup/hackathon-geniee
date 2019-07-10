import React, { Component } from 'react';
import Bold from '../../../Components/Bold.jsx';
import CollapsePanel from '../../../Components/CollapsePanel.jsx';
import { capitalCase, isFloat } from '../../../common/helpers';
import commonConsts from '../lib/commonConsts';
import { sortBy, each } from 'lodash';

class NetworkwiseData extends Component {
	constructor(props) {
		super(props);

		this.state = {
			networkData: props.networkData,
			cpmCalc: props.cpmCalc,
			customToggleOptions: props.customToggleOptions
		};

		this.sortNetworkData = this.sortNetworkData.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		this.setState({ ...nextProps });
	}

	sortNetworkData(networkData) {
		let networks = [],
			sortedNetworks = {};

		for (let i in networkData) {
			networks.push({
				networkName: i === commonConsts.NETWORKS.dfp ? commonConsts.NETWORKS.adp : i,
				networkCount: networkData[i]
			});
		}

		networks = sortBy(networks, ['networkName']);
		each(networks, n => {
			sortedNetworks[n.networkName] = n.networkCount;
		});

		return sortedNetworks;
	}

	render() {
		const { cpmCalc, customToggleOptions } = this.state;

		let total = 0,
			networkDataArr = [],
			networkData = this.sortNetworkData(this.state.networkData);
		for (let i in networkData) {
			if (!cpmCalc) {
				total += Number(networkData[i]);
			}
			networkDataArr.push(
				<div>
					<Bold>{capitalCase(i)}</Bold> :{' '}
					{isFloat(networkData[i]) ? Number(networkData[i]).toFixed(2) : networkData[i]}
				</div>
			);
		}

		if (cpmCalc) {
			const { impressions, revenue } = cpmCalc;
			total += (revenue * 1000) / impressions;
        }
        total = isNaN(total) ? 0 : total;

		const totalCount = isFloat(total) ? total.toFixed(2) : total,
			title = (
				<div>{this.props.cpm ? (totalCount / Object.keys(networkData).length).toFixed(2) : totalCount}</div>
			);

		return (
			<div style={{ width: '150px' }}>
				<CollapsePanel
					bold={this.props.bold}
					title={title}
					open={customToggleOptions ? customToggleOptions.toggleValue : false}
				>
					{networkDataArr.map((data, key) => {
						return <div key={key}>{data}</div>;
					})}
				</CollapsePanel>
			</div>
		);
	}
}

export default NetworkwiseData;
