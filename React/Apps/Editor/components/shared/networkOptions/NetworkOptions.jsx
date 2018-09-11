import React, { Component, PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { networks, defaultPriceFloorKey } from '../../../consts/commonConsts';
import CodeBox from '../codeBox';
import SelectBox from '../select/select';
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
					: this.props.ad && currentUser.userType == 'partner'
						? 'geniee'
						: false
		};
		this.submitHandler = this.submitHandler.bind(this);
		this.renderNetwork = this.renderNetwork.bind(this);
		this.networkChangeHandler = this.networkChangeHandler.bind(this);
		this.getCode = this.getCode.bind(this);
		this.filterNetworks = this.filterNetworks.bind(this);
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

	componentWillReceiveProps(nextProps) {
		if (nextProps.reset) {
			this.setState({
				network: false
			});
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

	filterNetworks() {
		if (window.isGeniee) {
			const isGCFG = !!window.gcfg,
				isUSN = !!(isGCFG && window.gcfg.hasOwnProperty('usn'));

			// 'isUSN' refers to Geniee UI Access 'Select Network' flag
			if (isUSN) {
				return window.gcfg.usn ? networks.filter(network => network != 'adpTags') : ['geniee'];
			}

			return networks.filter(network => network != 'adpTags');
		}

		return networks;
	}

	renderNetwork() {
		const props = this.props;
		let adExists = props.ad ? true : false,
			code = adExists && props.ad.network ? this.getCode() : false,
			pfKeyExists =
				adExists &&
				props.ad.networkData &&
				props.ad.networkData.keyValues &&
				Object.keys(props.ad.networkData.keyValues).length,
			fpKey = pfKeyExists
				? Object.keys(props.ad.networkData.keyValues).filter(key => key.match(/FP/g))[0] || defaultPriceFloorKey
				: defaultPriceFloorKey,
			priceFloor = pfKeyExists ? props.ad.networkData.keyValues[fpKey] : 0,
			refreshSlot =
				adExists && props.ad.networkData && props.ad.networkData.refreshSlot
					? props.ad.networkData.refreshSlot
					: false,
			overrideActive =
				adExists && props.ad.networkData && props.ad.networkData.overrideActive
					? props.ad.networkData.overrideActive
					: false,
			overrideSizeTo =
				adExists && props.ad.networkData && props.ad.networkData.overrideSizeTo
					? props.ad.networkData.overrideSizeTo
					: false,
			headerBidding =
				adExists && props.ad.networkData && props.ad.networkData.hasOwnProperty('headerBidding')
					? props.ad.networkData.headerBidding
					: false,
			dynamicAllocation =
				adExists && props.ad.networkData && props.ad.networkData.hasOwnProperty('dynamicAllocation')
					? props.ad.networkData.dynamicAllocation
					: true,
			firstFold =
				adExists && props.ad.networkData && props.ad.networkData.hasOwnProperty('firstFold')
					? props.ad.networkData.firstFold
					: true,
			position =
				adExists && props.ad.networkData && props.ad.networkData.hasOwnProperty('position')
					? props.ad.networkData.position
					: '',
			customAdCode =
				adExists && props.ad.networkData && props.ad.networkData.hasOwnProperty('adCode')
					? props.ad.networkData.adCode
					: '',
			zoneId =
				adExists && props.ad.networkData && props.ad.networkData.hasOwnProperty('zoneId')
					? props.ad.networkData.zoneId
					: '',
			isPrimaryAdSize = !!(props.primaryAdSize && Object.keys(props.primaryAdSize).length),
			isAdSize = !!(adExists && props.ad.width && props.ad.height),
			primaryAdSize =
				(isPrimaryAdSize && props.primaryAdSize) ||
				(isAdSize && { height: props.ad.height, width: props.ad.width }) ||
				{},
			isZonesData = !!(props.zonesData && props.zonesData.length),
			zonesData = isZonesData ? props.zonesData : [];

		switch (this.state.network) {
			case 'adpTags':
				return (
					<AdpTags
						fpKey={fpKey}
						priceFloor={priceFloor}
						headerBidding={headerBidding}
						submitHandler={this.submitHandler}
						onCancel={props.onCancel}
						code={code}
						refreshSlot={refreshSlot}
						overrideActive={overrideActive}
						overrideSizeTo={overrideSizeTo}
						buttonType={props.buttonType || 1}
						fromPanel={props.fromPanel ? props.fromPanel : false}
						id={props.id ? props.id : false}
						showNotification={props.showNotification}
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
						refreshSlot={refreshSlot}
						headerBidding={dynamicAllocation}
						submitHandler={this.submitHandler}
						onCancel={this.props.onCancel}
						code={code}
						buttonType={this.props.buttonType || 1}
						fromPanel={this.props.fromPanel ? this.props.fromPanel : false}
						id={this.props.id ? this.props.id : false}
						showNotification={this.props.showNotification}
						isInsertMode={this.props.isInsertMode || false}
						primaryAdSize={primaryAdSize}
						zonesData={zonesData}
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
		let filteredNetworks = this.filterNetworks();
		return (
			<div className="networkOptionsRow">
				<SelectBox value={this.state.network} label="Select Network" onChange={this.networkChangeHandler}>
					{filteredNetworks.map((item, index) => (
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
