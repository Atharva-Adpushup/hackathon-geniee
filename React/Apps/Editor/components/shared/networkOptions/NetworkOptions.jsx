import React, { Component, PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { networks } from '../../../consts/commonConsts';
import CodeBox from 'shared/codeBox';
import SelectBox from 'shared/select/select';
import AdpTags from './AdpTags';
import Adsense from './Adsense';
import OtherNetworks from './OtherNetworks';
import AdX from './AdX';

class NetworkOptions extends Component {
	constructor(props) {
		super(props);
		this.state = { network: this.props.ad && this.props.ad.network ? this.props.ad.network : false };
		this.submitHandler = this.submitHandler.bind(this);
		this.adCodeSubmit = this.adCodeSubmit.bind(this);
		this.renderNetwork = this.renderNetwork.bind(this);
		this.networkChangeHandler = this.networkChangeHandler.bind(this);
		this.getCode = this.getCode.bind(this);
	}

	componentDidMount() {
		if (this.props.onUpdate) {
			this.props.onUpdate();
		}
	}

	componentDidUpdate() {
		if (this.props.onUpdate) {
			this.props.onUpdate();
		}
	}

	submitHandler(networkData) {
		return this.props.onSubmit({
			network: this.state.network,
			networkData: networkData
		});
	}

	networkChangeHandler(value) {
		this.setState({ network: value });
	}

	adCodeSubmit(adCode) {
		this.submitHandler({
			adCode: adCode
		});
	}

	getCode() {
		let code;
		if (this.state.network == 'adpTags') {
			code =
				this.props.ad.networkData && this.props.ad.networkData.keyValues
					? this.props.ad.networkData.keyValues
					: false;
		} else {
			code = this.props.ad.networkData && this.props.ad.networkData.adCode ? this.props.ad.networkData : false;
		}
		return code;
	}

	renderNetwork() {
		let adExists = this.props.ad ? true : false,
			code = adExists && this.props.ad.network ? this.getCode() : false,
			pfKeyExists =
				adExists &&
				this.props.ad.networkData &&
				this.props.ad.networkData.keyValues &&
				Object.keys(this.props.ad.networkData.keyValues).length,
			fpKey = pfKeyExists
				? Object.keys(this.props.ad.networkData.keyValues).filter(key => key.match(/FP/g))[0] || 'FP_SA'
				: 'FP_SA',
			priceFloor = pfKeyExists ? this.props.ad.networkData.keyValues[fpKey] : 0,
			headerBidding =
				adExists && this.props.ad.networkData && this.props.ad.networkData.hasOwnProperty('headerBidding')
					? this.props.ad.networkData.headerBidding
					: true;

		switch (this.state.network) {
			case 'adpTags':
				return (
					<AdpTags
						fpKey={fpKey}
						priceFloor={priceFloor}
						headerBidding={headerBidding}
						submitHandler={this.submitHandler}
						onCancel={this.props.onCancel}
						code={code}
					/>
				);
				break;
			case 'adsense':
				return <Adsense code={code} submitHandler={this.submitHandler} onCancel={this.props.onCancel} />;
				break;
			case 'adx':
				return <AdX code={code} submitHandler={this.submitHandler} onCancel={this.props.onCancel} />;
				break;
			case 'custom':
			case 'dfp':
			default:
				return <OtherNetworks code={code} submitHandler={this.submitHandler} onCancel={this.props.onCancel} />;
				break;
		}
	}

	render() {
		return (
			<div className="networkOptionsRow">
				<SelectBox value={this.state.network} label="Select Network" onChange={this.networkChangeHandler}>
					{networks.map((item, index) => (
						<option key={index} value={item}>
							{item.charAt(0).toUpperCase() + item.slice(1).replace(/([A-Z])/g, ' $1')}
						</option>
					))}
				</SelectBox>
				<div>{this.state.network ? this.renderNetwork() : null}</div>
			</div>
		);
	}
}

export default NetworkOptions;
