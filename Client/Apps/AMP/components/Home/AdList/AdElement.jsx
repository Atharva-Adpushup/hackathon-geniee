/* eslint-disable no-alert */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, OverlayTrigger, Tooltip, Button } from '@/Client/helpers/react-bootstrap-imports';
import { makeFirstLetterCapitalize } from '../../../../../helpers/commonFunctions';
import CopyButtonWrapperContainer from '../../../../../Containers/CopyButtonWrapperContainer';
import { DISPLAYADCODE, STICKYADCODE, AMP_MESSAGE, SIZES } from '../../../configs/commonConsts';
import CustomButton from '../../../../../Components/CustomButton/index';
// import AdNetworkDetails from './AdNetworkDetails';
// import LazyLoadSettings from './LazyLoadSettings';
import MultiSizeSettings from './MultiSizeSettings';
import RefreshSettings from './RefreshSettings';
import EditBox from '../../../../../Components/EditBox/index';
import Tags from '../../../../../Components/Tags/index';
import { computeDownWardCompatibleSizes } from '../../../lib/helpers';

class AdElement extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showNetworkDetails: false,
			showLazyload: false,
			showMultiSize: false,
			showRefresh: false,
			editName: false,
			isActive: Object.prototype.hasOwnProperty.call(props.doc.ad, 'isActive')
				? props.doc.ad.isActive
				: true
		};
		this.toggleHandler = this.toggleHandler.bind(this);
		this.renderAdDetails = this.renderAdDetails.bind(this);
		this.disableAd = this.disableAd.bind(this);
		this.updateWrapper = this.updateWrapper.bind(this);
	}

	getAMPAdCode = ({ formatData }) =>
		formatData.network && formatData.networkData && formatData.networkData.adCode
			? formatData.networkData.adCode
			: AMP_MESSAGE;

	disableAd() {
		const { isActive } = this.state;
		const message = isActive
			? 'Are you sure you want to archive this ad?'
			: 'Are you sure you want to unarchive this ad?';
		if (window.confirm(message)) {
			this.setState(
				{
					isActive: !isActive
				},
				() => this.updateWrapper({ isActive: !isActive, archivedOn: +new Date() })
			);
		}
	}

	toggleHandler(property) {
		this.setState(state => ({ [property]: !state[property] }));
	}

	updateWrapper(data) {
		const { updateAd, modifyAdOnServer, user, doc, siteId, adsToUpdateOnMasterSave } = this.props;
		adsToUpdateOnMasterSave(doc.id);
		return user.isSuperUser
			? updateAd(doc.id, siteId, data)
			: modifyAdOnServer(siteId, doc.id, data);
	}

	renderInformation = (label, value) => (
		<p>
			{label}: <strong>{value}</strong>
		</p>
	);

	renderAdDetails() {
		const { updateAd, networkConfig, user, siteId, doc } = this.props;
		const { ad, id, name } = doc;
		const { width, height, isMultiSize, isRefreshEnabled, refreshInterval = 30, type } = ad;
		const {
			showLazyload,
			showNetworkDetails,
			editName,
			isActive,
			showMultiSize,
			showRefresh
		} = this.state;
		const isAMP = ad.type === 'amp';

		const refresh = isRefreshEnabled ? `data-enable-refresh="${refreshInterval}"` : '';
		const availableSizes = SIZES[type.toUpperCase()].MOBILE;
		const size = `${width}x${height}`;
		const downwardCompatibleSizes = computeDownWardCompatibleSizes(availableSizes, size);

		const multiSize = isMultiSize ? `data-multi-size='${downwardCompatibleSizes}'` : '';
		const ADCODE = type === 'display' ? DISPLAYADCODE : STICKYADCODE;
		let code = isAMP ? this.getAMPAdCode(ad) : ADCODE;
		const customAttributes = ad.maxHeight ? ` max-height="${ad.maxHeight}"` : '';
		code = code
			? code
					.replace(/__AD_ID__/g, id)
					.replace(/__WIDTH__/, width)
					.replace(/__HEIGHT__/, height)
					.replace(/__REFRESH_INTERVAL__/, refresh)
					.replace(/__MULTI_SIZE__/, multiSize)
			: null;

		// if (showNetworkDetails) {
		// 	return (
		// 		<AdNetworkDetails
		// 			ad={ad}
		// 			siteId={siteId}
		// 			onCancel={() => this.toggleHandler('showNetworkDetails')}
		// 			onSubmit={updateAd}
		// 			networkConfig={networkConfig}
		// 			user={user}
		// 		/>
		// 	);
		// }

		if (showMultiSize) {
			return (
				<MultiSizeSettings
					ad={ad}
					siteId={siteId}
					onCancel={() => this.toggleHandler('showMultiSize')}
					onSubmit={this.updateWrapper}
					user={user}
				/>
			);
		}

		if (showRefresh) {
			return (
				<RefreshSettings
					ad={ad}
					siteId={siteId}
					onCancel={() => this.toggleHandler('showRefresh')}
					onSubmit={this.updateWrapper}
					user={user}
				/>
			);
		}

		if (editName) {
			return (
				<EditBox
					label="Ad Name"
					name={`name-${id}`}
					value={name ? name : `Ad-${id}`}
					onSave={this.updateWrapper}
					onCancel={() => this.toggleHandler('editName')}
					leftSize={3}
					rightSize={9}
				/>
			);
		}
		// if (showLazyload) {
		// 	return (
		// 		<LazyLoadSettings
		// 			checked={ad.enableLazyLoading}
		// 			id={ad.id}
		// 			onChange={payload => updateAd(ad.id, siteId, payload)}
		// 			onCancel={() => this.toggleHandler('showLazyload')}
		// 		/>
		// 	);
		// }
		return (
			<div key={`adDetails${id}`}>
				{user.isSuperUser && !isActive ? (
					<Tags labels={['Archived']} labelClasses="custom-label" />
				) : null}
				{this.renderInformation('Id', id)}
				<p>
					Name: <strong>{name ? name : `Ad-${id}`}</strong>{' '}
					<OverlayTrigger
						placement="bottom"
						overlay={<Tooltip id="ad-name-edit">Edit Ad Name</Tooltip>}
					>
						<span
							className="adDetails-icon u-text-red"
							onClick={() => this.toggleHandler('editName')}
							style={{ cursor: 'pointer' }}
						>
							<FontAwesomeIcon icon="edit" />
						</span>
					</OverlayTrigger>
				</p>
				{/* {this.renderInformation('Platform', makeFirstLetterCapitalize(ad.formatData.platform))}
				{this.renderInformation(
					'Type',
					`${makeFirstLetterCapitalize(ad.formatData.type)} ${
						ad.formatData.placement ? makeFirstLetterCapitalize(ad.formatData.placement) : ''
					}`
				)} */}
				{this.renderInformation(
					'Size',
					ad.width === 'responsive'
						? makeFirstLetterCapitalize(ad.width)
						: `${ad.width}x${ad.height}`
				)}
				{ad.width === 'responsive' && !!ad.maxHeight
					? this.renderInformation('Max Height', ad.maxHeight)
					: null}
				{user.isSuperUser ? (
					<div>
						{this.renderInformation(
							'Network',
							ad.network && ad.networkData ? ad.network.toUpperCase() : 'Not Set'
						)}
						{this.renderInformation('Status', ad.isActive ? 'Active' : 'Archived')}
					</div>
				) : null}
				<pre style={{ wordBreak: 'break-word' }}>{code}</pre>{' '}
				{user.isSuperUser && ad.type !== 'amp' ? (
					<React.Fragment>
						<CustomButton
							variant="secondary"
							className="u-margin-l3 u-margin-t3 pull-right"
							onClick={() => this.toggleHandler('showMultiSize')}
						>
							Edit Multi size
						</CustomButton>
						<CustomButton
							variant="secondary"
							className="u-margin-l3 u-margin-t3 pull-right"
							onClick={() => this.toggleHandler('showRefresh')}
						>
							Edit Refresh
						</CustomButton>
						<CopyButtonWrapperContainer content={code} className="u-margin-t3 pull-right">
							<CustomButton variant="secondary">Copy AdCode</CustomButton>
						</CopyButtonWrapperContainer>
					</React.Fragment>
				) : null}
			</div>
		);
	}

	render() {
		const { doc } = this.props;
		const { ad } = doc;
		const { isActive } = this.state;

		return (
			<div key={`adElement-${doc.id}`}>
				<OverlayTrigger
					placement="bottom"
					overlay={
						<Tooltip id="delete-ad-tooltip">{isActive ? 'Archive Ad' : 'Unarchive Ad'}</Tooltip>
					}
				>
					<Button className="btn-close" onClick={this.disableAd}>
						x
					</Button>
				</OverlayTrigger>
				<Col xs={3} className="ad-image">
					<img src={`/assets/images/tagManager/${ad.type}.png`} alt="Ad Type" />
				</Col>
				<Col xs={9} className="ad-details">
					{this.renderAdDetails()}
				</Col>
				<div style={{ clear: 'both' }} />
			</div>
		);
	}
}

export default AdElement;
