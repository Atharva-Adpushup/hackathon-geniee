import React, { Component, PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { networks, defaultPriceFloorKey } from '../../../consts/commonConsts';
import CodeBox from 'shared/codeBox';
import SelectBox from 'shared/select/select';
import AdpTags from './AdpTags';
import Adsense from './Adsense';
import OtherNetworks from './OtherNetworks';
import AdX from './AdX';
import SectionOptions from './sectionOptions.jsx';

class NetworkOptions extends Component {
	constructor(props) {
		super(props);
		this.state = {
			network:
				this.props.ad && this.props.ad.network
					? this.props.ad.network
					: this.props.ad && currentUser.userType == 'partner' ? 'geniee' : false
		};
		this.submitHandler = this.submitHandler.bind(this);
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
				? Object.keys(this.props.ad.networkData.keyValues).filter(key => key.match(/FP/g))[0] ||
					defaultPriceFloorKey
				: defaultPriceFloorKey,
			priceFloor = pfKeyExists ? this.props.ad.networkData.keyValues[fpKey] : 0,
			headerBidding =
				adExists && this.props.ad.networkData && this.props.ad.networkData.hasOwnProperty('headerBidding')
					? this.props.ad.networkData.headerBidding
					: true,
			dynamicAllocation =
				adExists && this.props.ad.networkData && this.props.ad.networkData.hasOwnProperty('dynamicAllocation')
					? this.props.ad.networkData.dynamicAllocation
					: true,
			firstFold =
				adExists && this.props.ad.networkData && this.props.ad.networkData.hasOwnProperty('firstFold')
					? this.props.ad.networkData.firstFold
					: true,
			position =
				adExists && this.props.ad.networkData && this.props.ad.networkData.hasOwnProperty('position')
					? this.props.ad.networkData.position
					: '',
			customAdCode =
				adExists && this.props.ad.networkData && this.props.ad.networkData.hasOwnProperty('adCode')
					? this.props.ad.networkData.adCode
					: '',
			zoneId =
				adExists && this.props.ad.networkData && this.props.ad.networkData.hasOwnProperty('zoneId')
					? this.props.ad.networkData.zoneId
					: '';

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
						buttonType={this.props.buttonType || 1}
						fromPanel={this.props.fromPanel ? this.props.fromPanel : false}
						id={this.props.id ? this.props.id : false}
						showNotification={this.props.showNotification}
					/>
				);
				break;
			case 'adsense':
				return (
					<Adsense
						code={code}
						submitHandler={this.submitHandler}
						onCancel={this.props.onCancel}
						fromPanel={this.props.fromPanel ? this.props.fromPanel : false}
						showNotification={this.props.showNotification}
					/>
				);
				break;
			case 'adx':
				return (
					<AdX
						code={code}
						submitHandler={this.submitHandler}
						onCancel={this.props.onCancel}
						fromPanel={this.props.fromPanel ? this.props.fromPanel : false}
						showNotification={this.props.showNotification}
					/>
				);
				break;
			case 'geniee':
				return (
					<SectionOptions
						firstFold={firstFold}
						position={position}
						customAdCode={customAdCode}
						zoneId={zoneId}
						fpKey={fpKey}
						priceFloor={priceFloor}
						headerBidding={dynamicAllocation}
						submitHandler={this.submitHandler}
						onCancel={this.props.onCancel}
						code={code}
						buttonType={this.props.buttonType || 1}
						fromPanel={this.props.fromPanel ? this.props.fromPanel : false}
						id={this.props.id ? this.props.id : false}
						showNotification={this.props.showNotification}
					/>
				);
				break;
			case 'custom':
			case 'dfp':
			default:
				return (
					<OtherNetworks
						code={code}
						submitHandler={this.submitHandler}
						onCancel={this.props.onCancel}
						showNotification={this.props.showNotification}
					/>
				);
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
