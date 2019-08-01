import React, { Component } from 'react';
import { networks, defaultPriceFloorKey, partners } from '../../constants/visualEditor';
import SelectBox from '../SelectBox/index';
import AdpTags from './AdpTags';
import Adsense from './Adsense';
import MediaNet from './MediaNet';
import OtherNetworks from './OtherNetworks';
import AdX from './AdX';

class NetworkOptions extends Component {
	constructor(props) {
		super(props);
		const { ad } = this.props;
		this.state = {
			network: ad && ad.network ? ad.network : false
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
		const { ad } = this.props;
		const { network } = this.state;
		if (network === 'adpTags') {
			code = ad.networkData && ad.networkData.keyValues ? ad.networkData.keyValues : false;
		} else {
			code = ad.networkData && ad.networkData.adCode ? ad.networkData : false;
		}
		return code;
	}

	filterNetworks = () => {
		const partnersList = partners.list;
		const activeNetworks = networks.filter(network => !partnersList.includes(network));

		if (window.isGeniee) {
			const isGCFG = !!window.gcfg;
			const isUSN = !!(isGCFG && Object.prototype.hasOwnProperty.call(window.gcfg, 'usn'));
			const disabledNetworks = partners.geniee.networks.disabled;
			const activeGenieeNetworks = networks.filter(network => !disabledNetworks.includes(network));

			// 'isUSN' refers to Geniee UI Access 'Select Network' flag
			if (isUSN) {
				return window.gcfg.usn ? activeGenieeNetworks : ['geniee'];
			}

			return activeGenieeNetworks;
		}

		// Filter all partners networks in default user mode
		return activeNetworks;
	};

	networkChangeHandler(value) {
		this.setState({ network: value });
	}

	submitHandler(networkData) {
		const { onSubmit } = this.props;
		const { network } = this.state;

		return onSubmit({
			network,
			networkData: { ...networkData }
		});
	}

	renderNetwork() {
		const props = this.props;
		const { network } = this.state;

		const adExists = !!props.ad;
		const isAdNetworkData = !!(adExists && props.ad.networkData);
		const code = adExists && props.ad.network ? this.getCode() : false;
		const pfKeyExists =
			isAdNetworkData &&
			props.ad.networkData.keyValues &&
			Object.keys(props.ad.networkData.keyValues).length;
		const fpKey = pfKeyExists
			? Object.keys(props.ad.networkData.keyValues).filter(key => key.match(/FP/g))[0] ||
			  defaultPriceFloorKey
			: defaultPriceFloorKey;
		const priceFloor = pfKeyExists ? props.ad.networkData.keyValues[fpKey] : 0;
		const refreshSlot =
			isAdNetworkData && props.ad.networkData.refreshSlot
				? props.ad.networkData.refreshSlot
				: false;
		const refreshInterval =
			isAdNetworkData && props.ad.networkData.refreshInterval
				? props.ad.networkData.refreshInterval
				: null;
		const overrideActive =
			isAdNetworkData && props.ad.networkData.overrideActive
				? props.ad.networkData.overrideActive
				: false;
		const overrideSizeTo =
			isAdNetworkData && props.ad.networkData.overrideSizeTo
				? props.ad.networkData.overrideSizeTo
				: false;
		const headerBidding =
			isAdNetworkData && Object.prototype.hasOwnProperty.call(props.ad.networkData, 'headerBidding')
				? props.ad.networkData.headerBidding
				: false;
		const dynamicAllocation =
			isAdNetworkData &&
			Object.prototype.hasOwnProperty.call(props.ad.networkData, 'dynamicAllocation')
				? props.ad.networkData.dynamicAllocation
				: true;
		const firstFold =
			isAdNetworkData && Object.prototype.hasOwnProperty.call(props.ad.networkData, 'firstFold')
				? props.ad.networkData.firstFold
				: true;
		const position =
			isAdNetworkData && Object.prototype.hasOwnProperty.call(props.ad.networkData, 'position')
				? props.ad.networkData.position
				: '';
		const customAdCode =
			isAdNetworkData && Object.prototype.hasOwnProperty.call(props.ad.networkData, 'adCode')
				? props.ad.networkData.adCode
				: '';
		const zoneId =
			isAdNetworkData && Object.prototype.hasOwnProperty.call(props.ad.networkData, 'zoneId')
				? props.ad.networkData.zoneId
				: '';
		const isPrimaryAdSize = !!(props.primaryAdSize && Object.keys(props.primaryAdSize).length);
		const isAdSize = !!(adExists && props.ad.width && props.ad.height);
		const primaryAdSize =
			(isPrimaryAdSize && props.primaryAdSize) ||
			(isAdSize && { height: props.ad.height, width: props.ad.width }) ||
			{};
		const isZonesData = !!(props.zonesData && props.zonesData.length);
		const zonesData = isZonesData ? props.zonesData : [];
		const networkConfig = props.networkConfig || {};

		switch (network) {
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
						refreshInterval={refreshInterval}
						overrideActive={overrideActive}
						overrideSizeTo={overrideSizeTo}
						buttonType={props.buttonType || 1}
						fromPanel={props.fromPanel ? props.fromPanel : false}
						id={props.id ? props.id : false}
						showNotification={props.showNotification}
						primaryAdSize={primaryAdSize}
						networkConfig={networkConfig.adpTags}
					/>
				);
			case 'adsense':
				return (
					<Adsense
						ad={props.ad}
						code={code}
						submitHandler={this.submitHandler}
						id={props.id ? props.id : false}
						onCancel={props.onCancel}
						fromPanel={props.fromPanel ? props.fromPanel : false}
						showNotification={props.showNotification}
						networkConfig={networkConfig.adsense}
					/>
				);
			case 'adx':
				return (
					<AdX
						code={code}
						submitHandler={this.submitHandler}
						id={props.id ? props.id : false}
						onCancel={props.onCancel}
						fromPanel={props.fromPanel ? props.fromPanel : false}
						showNotification={props.showNotification}
						networkConfig={networkConfig.adx}
					/>
				);
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
						refreshInterval={refreshInterval}
						headerBidding={dynamicAllocation}
						submitHandler={this.submitHandler}
						onCancel={props.onCancel}
						code={code}
						buttonType={props.buttonType || 1}
						fromPanel={props.fromPanel ? props.fromPanel : false}
						id={props.id ? props.id : false}
						showNotification={props.showNotification}
						isInsertMode={props.isInsertMode || false}
						primaryAdSize={primaryAdSize}
						zonesData={zonesData}
						networkConfig={networkConfig.geniee}
					/>
				);
			case 'medianet':
				return (
					<MediaNet
						code={code}
						submitHandler={this.submitHandler}
						id={props.id ? props.id : false}
						onCancel={props.onCancel}
						fromPanel={props.fromPanel ? props.fromPanel : false}
						showNotification={props.showNotification}
						networkConfig={networkConfig.medianet}
					/>
				);
			case 'custom':
			case 'dfp':
			default:
				return (
					<OtherNetworks
						code={code}
						submitHandler={this.submitHandler}
						id={props.id ? props.id : false}
						onCancel={props.onCancel}
						showNotification={props.showNotification}
						networkConfig={networkConfig.custom}
					/>
				);
		}
	}

	render() {
		const filteredNetworks = this.filterNetworks();
		const { network } = this.state;
		return (
			<div className="networkOptionsRow">
				<SelectBox
					id="network-selection"
					title="Select Network"
					onSelect={this.networkChangeHandler}
					options={filteredNetworks.map(item => ({
						name: item.charAt(0).toUpperCase() + item.slice(1).replace(/([A-Z])/g, ' $1'),
						value: item
					}))}
					selected={network}
				/>
				<div>{network ? this.renderNetwork() : null}</div>
			</div>
		);
	}
}

export default NetworkOptions;
