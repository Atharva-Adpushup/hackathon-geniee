/* eslint-disable no-alert */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, OverlayTrigger, Tooltip, Button } from '@/Client/helpers/react-bootstrap-imports';
import { makeFirstLetterCapitalize } from '../../../../../helpers/commonFunctions';
import CopyButtonWrapperContainer from '../../../../../Containers/CopyButtonWrapperContainer';
import { ADCODE, REWARDED_AD_CODE } from '../../../configs/commonConsts';
import CustomButton from '../../../../../Components/CustomButton/index';
import AdNetworkDetails from './AdNetworkDetails';
import LazyLoadSettings from './LazyLoadSettings';
import EditBox from '../../../../../Components/EditBox/index';
import Tags from '../../../../../Components/Tags/index';
import FluidEdit from './FluidEdit';
import RewardedVideoSettings from './RewardedVideoSettings';

class AdElement extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showNetworkDetails: false,
			showLazyload: false,
			showFluidVal: false,
			showRewardedVideo: false,
			editName: false,
			isActive: Object.prototype.hasOwnProperty.call(props.ad, 'isActive')
				? props.ad.isActive
				: true,
			codeLengthToShow: 500
		};
		this.toggleHandler = this.toggleHandler.bind(this);
		this.renderAdDetails = this.renderAdDetails.bind(this);
		this.disableAd = this.disableAd.bind(this);
		this.updateWrapper = this.updateWrapper.bind(this);
	}

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
		const { updateAd, modifyAdOnServer, user, ad, siteId } = this.props;
		return user.isSuperUser ? updateAd(ad.id, siteId, data) : modifyAdOnServer(siteId, ad.id, data);
	}

	renderInformation = (label, value) => (
		<p>
			{label}: <strong>{value}</strong>
		</p>
	);

	renderAdDetails() {
		const { ad, updateAd, networkConfig, user, siteId, networkCode, dfpMessage } = this.props;
		const {
			networkData: { dfpAdunitCode, dfpAdunit },
			rewardTriggerFunction,
			customScript,
			modalText
		} = ad;
		const {
			showLazyload,
			showNetworkDetails,
			editName,
			isActive,
			showFluidVal,
			showRewardedVideo
		} = this.state;

		const isRewarded = ad.formatData.type === 'rewardedAds';
		let code = isRewarded ? REWARDED_AD_CODE : ADCODE;
		let triggerRewardedAd = !customScript ? 'triggerRewardedAd()' : atob(customScript);

		const customAttributes = ad.maxHeight ? ` max-height="${ad.maxHeight}"` : '';
		code = code
			? code
					.replace(/__AD_ID__/g, ad.id)
					.replace(/__CUSTOM_ATTRIBS__/, customAttributes)
					.replace(/__AD_UNIT__/, dfpAdunit)
					.replace(/__NETWORK_CODE__/, networkCode)
					.replace(
						/__POST_REWARDED_FUNCTION__/g,
						rewardTriggerFunction && atob(rewardTriggerFunction)
					)
					.replace(/__MODAL_TEXT__/, modalText)
					.replace(/__TRIGGER_REWARDED_AD__/, triggerRewardedAd)
			: null;

		if (ad.formatData.type === 'rewardedAds') {
			ad.width = 1;
			ad.height = 1;
		}

		if (showFluidVal) {
			return (
				<FluidEdit
					ad={ad}
					siteId={siteId}
					onCancel={() => this.toggleHandler('showFluidVal')}
					onSubmit={this.updateWrapper}
					user={user}
				/>
			);
		}

		if (showNetworkDetails) {
			return (
				<AdNetworkDetails
					ad={ad}
					siteId={siteId}
					onCancel={() => this.toggleHandler('showNetworkDetails')}
					onSubmit={updateAd}
					networkConfig={networkConfig}
					user={user}
				/>
			);
		}
		if (editName) {
			return (
				<EditBox
					label="Ad Name"
					name={`name-${ad.id}`}
					value={ad.name ? ad.name : `Ad-${ad.id}`}
					onSave={this.updateWrapper}
					onCancel={() => this.toggleHandler('editName')}
					leftSize={3}
					rightSize={9}
				/>
			);
		}
		if (showLazyload) {
			return (
				<LazyLoadSettings
					checked={ad.enableLazyLoading}
					id={ad.id}
					onChange={payload => updateAd(ad.id, siteId, payload)}
					onCancel={() => this.toggleHandler('showLazyload')}
				/>
			);
		}

		if (showRewardedVideo) {
			return (
				<RewardedVideoSettings
					ad={ad}
					siteId={siteId}
					onCancel={() => this.toggleHandler('showRewardedVideo')}
					onSubmit={this.updateWrapper}
					user={user}
				/>
			);
		}
		return (
			<div key={`adDetails${ad.id}`}>
				{user.isSuperUser && !isActive ? (
					<Tags labels={['Archived']} labelClasses="custom-label" />
				) : null}
				{this.renderInformation('Id', ad.id)}
				<p>
					Name: <strong>{ad.name ? ad.name : `Ad-${ad.id}`}</strong>{' '}
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
				{this.renderInformation('Platform', makeFirstLetterCapitalize(ad.formatData.platform))}
				{this.renderInformation(
					'Type',
					`${makeFirstLetterCapitalize(ad.formatData.type)} ${
						ad.formatData.placement ? makeFirstLetterCapitalize(ad.formatData.placement) : ''
					}`
				)}
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
				<pre
					style={
						!isRewarded || (isRewarded && dfpAdunitCode)
							? { wordBreak: 'break-word', height: '225px' }
							: null
					}
				>
					{isRewarded ? (dfpAdunit || dfpAdunitCode ? code : dfpMessage) : code}
				</pre>{' '}
				{user.isSuperUser && ad.formatData.type !== 'amp' ? (
					<React.Fragment>
						<CustomButton
							variant="secondary"
							className="u-margin-l3 u-margin-t3 pull-right"
							onClick={() => this.toggleHandler('showNetworkDetails')}
						>
							Network Details
						</CustomButton>
						<CustomButton
							variant="secondary"
							className="u-margin-l3 u-margin-t3 pull-right"
							onClick={() => this.toggleHandler('showFluidVal')}
						>
							Edit Fluid
						</CustomButton>
						<CustomButton
							variant="secondary"
							className="u-margin-l3 u-margin-t3 pull-right"
							onClick={() => this.toggleHandler('showLazyload')}
						>
							Lazyload Settings
						</CustomButton>
						{isRewarded ? (
							<CustomButton
								variant="secondary"
								className="u-margin-l3 u-margin-t3 pull-right"
								onClick={() => this.toggleHandler('showRewardedVideo')}
							>
								Rewarded Video Settings
							</CustomButton>
						) : null}

						{!isRewarded || (isRewarded && dfpAdunitCode) ? (
							<CopyButtonWrapperContainer content={code} className="u-margin-t3 pull-right">
								<CustomButton variant="secondary">Copy AdCode</CustomButton>
							</CopyButtonWrapperContainer>
						) : null}
					</React.Fragment>
				) : null}
			</div>
		);
	}

	render() {
		const { ad } = this.props;
		const { isActive } = this.state;

		return (
			<div key={`adElement-${ad.id}`}>
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
					<img src={`/assets/images/tagManager/${ad.formatData.type}.png`} alt="Ad Type" />
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
