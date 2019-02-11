import React, { Component } from 'react';
import { Object } from 'es6-shim';
import { NETWORKS, DEFAULT_PRICE_FLOOR_KEY, PARTNERS } from '../../../../configs/commonConsts';
import CodeBox from '../codeBox';
import SelectBox from '../../../../../../Components/Selectbox/index';
import AdpTags from './AdpTags';
import Adsense from './Adsense';
import MediaNet from './MediaNet';
import OtherNetworks from './OtherNetworks';
import AdX from './AdX';
import SectionOptions from './sectionOptions';

class NetworkOptions extends Component {
	constructor(props) {
		super(props);
		const { ad = false, user } = this.props;
		const hasNetwork = ad && ad.network;
		this.state = {
			network: hasNetwork
				? ad.network
				: ad && user.userType === 'partner' ? 'geniee' : false
		};
		this.submitHandler = this.submitHandler.bind(this);
		this.renderNetwork = this.renderNetwork.bind(this);
		this.networkChangeHandler = this.networkChangeHandler.bind(this);
		this.getCode = this.getCode.bind(this);
		this.filterNetworks = this.filterNetworks.bind(this);
	}

	componentDidMount() {
		const { onUpdate } = this.props;
		if (onUpdate) onUpdate();
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.reset) {
			this.setState({
				network: false
			});
		}
	}

	componentDidUpdate() {
		const { onUpdate } = this.props;
		if (onUpdate) onUpdate();
	}

	getCode() {
		let code;
		const { network } = this.state;
		const { ad } = this.props;
		if (network === 'adpTags') {
			code = ad.networkData && ad.networkData.keyValues ? ad.networkData.keyValues : false;
		} else {
			code = ad.networkData && ad.networkData.adCode ? ad.networkData : false;
		}
		return code;
	}

	filterNetworks = () => {
		const partnersList = PARTNERS.list;

		const activeNetworks = NETWORKS.filter(network => !partnersList.includes(network));

		if (window.isGeniee) {
			const isGCFG = !!window.gcfg;
			const isUSN = !!(isGCFG && Object.prototype.hasOwnProperty.call(window.gcfg, 'usn'));
			const disabledNetworks = PARTNERS.geniee.networks.disabled;
			const activeGenieeNetworks = NETWORKS.filter(network => !disabledNetworks.includes(network));

			// 'isUSN' refers to Geniee UI Access 'Select Network' flag
			if (isUSN) {
				return window.gcfg.usn ? activeGenieeNetworks : ['geniee'];
			}

			return activeGenieeNetworks;
		}

		// Filter all partners networks in default user mode
		return activeNetworks;
	}

	submitHandler(networkData) {
		const { onSubmit } = this.props;
		const { network } = this.state;
		return onSubmit({
			network,
			networkData: { ...networkData, logWritten: false }
		});
	}

	networkChangeHandler(value) {
		this.setState({ network: value });
	}

	renderNetwork() {
		const { ad, zonesData = [], networkConfig = {}, onCancel, buttonType, fromPanel, id, showNotification, isInsertMode } = this.props;
		const { network } = this.state;

		const adExists = !!ad;
		const isAdNetworkData = !!(adExists && ad.networkData);
		const code = adExists && ad.network ? this.getCode() : false;
		const pfKeyExists = isAdNetworkData && ad.networkData.keyValues && Object.keys(ad.networkData.keyValues).length;
		const fpKey = pfKeyExists
				? Object.keys(ad.networkData.keyValues).filter(key => key.match(/FP/g))[0] || DEFAULT_PRICE_FLOOR_KEY
				: DEFAULT_PRICE_FLOOR_KEY;
		const priceFloor = pfKeyExists ? ad.networkData.keyValues[fpKey] : 0;
		const refreshSlot = isAdNetworkData && ad.networkData.refreshSlot
				? ad.networkData.refreshSlot
				: false;
		const overrideActive = isAdNetworkData && ad.networkData.overrideActive
				? ad.networkData.overrideActive
				: false;
		const overrideSizeTo = isAdNetworkData && ad.networkData.overrideSizeTo
				? ad.networkData.overrideSizeTo
				: false;
		const headerBidding = isAdNetworkData && Object.prototype.hasOwnProperty.call(ad.networkData, 'headerBidding')
				? ad.networkData.headerBidding
				: false;
		const dynamicAllocation = isAdNetworkData && Object.prototype.hasOwnProperty.call(ad.networkData, 'dynamicAllocation')
				? ad.networkData.dynamicAllocation
				: true;
		const firstFold = isAdNetworkData && Object.prototype.hasOwnProperty.call(ad.networkData, 'firstFold')
				? ad.networkData.firstFold
				: true;
		const position = isAdNetworkData && Object.prototype.hasOwnProperty.call(ad.networkData, 'position')
				? ad.networkData.position
				: '';
		const customAdCode = isAdNetworkData && Object.prototype.hasOwnProperty.call(ad.networkData, 'adCode')
				? ad.networkData.adCode
				: '';
		const zoneId = isAdNetworkData && Object.prototype.hasOwnProperty.call(ad.networkData, 'zoneId')
				? ad.networkData.zoneId
				: '';
		const isPrimaryAdSize = !!(this.props.primaryAdSize && Object.keys(this.props.primaryAdSize).length);
		const isAdSize = !!(adExists && ad.width && ad.height);
		const primaryAdSize = (isPrimaryAdSize && this.props.primaryAdSize) || (isAdSize && { height: ad.height, width: ad.width }) || {};

		switch (network) {
			case 'adpTags':
				return (
					<AdpTags
						fpKey={fpKey}
						priceFloor={priceFloor}
						headerBidding={headerBidding}
						submitHandler={this.submitHandler}
						onCancel={onCancel}
						code={code}
						refreshSlot={refreshSlot}
						overrideActive={overrideActive}
						overrideSizeTo={overrideSizeTo}
						buttonType={buttonType || 1}
						fromPanel={fromPanel || false}
						id={id || false}
						showNotification={showNotification}
						primaryAdSize={primaryAdSize}
						networkConfig={networkConfig['adpTags']}
					/>
				);
			case 'adsense':
				return (
					<Adsense
						code={code}
						submitHandler={this.submitHandler}
						id={id || false}
						onCancel={onCancel}
						fromPanel={fromPanel || false}
						showNotification={showNotification}
						networkConfig={networkConfig['adsense']}
					/>
				);
			case 'adx':
				return (
					<AdX
						code={code}
						submitHandler={this.submitHandler}
						id={id || false}
						onCancel={onCancel}
						fromPanel={fromPanel || false}
						showNotification={showNotification}
						networkConfig={networkConfig['adx']}
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
						onCancel={onCancel}
						code={code}
						buttonType={buttonType || 1}
						id={id || false}
						fromPanel={fromPanel || false}
						showNotification={showNotification}
						isInsertMode={isInsertMode || false}
						primaryAdSize={primaryAdSize}
						zonesData={zonesData}
						networkConfig={networkConfig['geniee']}
					/>
				);
				break;
			case 'medianet':
				return (
					<MediaNet
						code={code}
						submitHandler={this.submitHandler}
						id={id || false}
						onCancel={onCancel}
						fromPanel={fromPanel || false}
						showNotification={showNotification}
						networkConfig={networkConfig['medianet']}
					/>
				);
			case 'custom':
			case 'dfp':
			default:
				return (
					<OtherNetworks
						code={code}
						submitHandler={this.submitHandler}
						id={id || false}
						onCancel={onCancel}
						showNotification={showNotification}
						networkConfig={networkConfig['custom']}
					/>
				);
		}
	}

	render() {
		const { network } = this.state;
		const filteredNetworks = this.filterNetworks();
		return (
			<div className="networkOptionsRow">
				<SelectBox value={network} label="Select Network" onChange={this.networkChangeHandler}>
					{filteredNetworks.map((item, index) => (
						<option key={index} value={item}>
							{item.charAt(0).toUpperCase() + item.slice(1).replace(/([A-Z])/g, ' $1')}
						</option>
					))}
				</SelectBox>
				<div>{network ? this.renderNetwork() : null}</div>
			</div>
		);
	}
}

export default NetworkOptions;
