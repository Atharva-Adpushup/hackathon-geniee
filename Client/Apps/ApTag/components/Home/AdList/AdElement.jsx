/* eslint-disable no-alert */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, OverlayTrigger, Tooltip, Button } from '@/Client/helpers/react-bootstrap-imports';
import { makeFirstLetterCapitalize } from '../../../../../helpers/commonFunctions';
import CopyButtonWrapperContainer from '../../../../../Containers/CopyButtonWrapperContainer';
import { ADCODE, AMP_MESSAGE } from '../../../configs/commonConsts';
import CustomButton from '../../../../../Components/CustomButton/index';
import AdNetworkDetails from './AdNetworkDetails';
import LazyLoadSettings from './LazyLoadSettings';
import EditBox from '../../../../../Components/EditBox/index';
import Tags from '../../../../../Components/Tags/index';

class AdElement extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showNetworkDetails: false,
			showLazyload: false,
			editName: false,
			isActive: Object.prototype.hasOwnProperty.call(props.ad, 'isActive')
				? props.ad.isActive
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
		const { updateAd, modifyAdOnServer, user, ad, siteId } = this.props;
		return user.isSuperUser ? updateAd(ad.id, siteId, data) : modifyAdOnServer(siteId, ad.id, data);
	}

	renderInformation = (label, value) => (
		<p>
			{label}: <strong>{value}</strong>
		</p>
	);

	renderAdDetails() {
		const { ad, updateAd, networkConfig, user, siteId } = this.props;
		const { showLazyload, showNetworkDetails, editName, isActive } = this.state;
		const isAMP = ad.formatData.type === 'amp';

		let code = isAMP ? this.getAMPAdCode(ad) : ADCODE;
		const customAttributes = ad.maxHeight ? ` max-height="${ad.maxHeight}"` : '';
		code = code
			? code.replace(/__AD_ID__/g, ad.id).replace(/__CUSTOM_ATTRIBS__/, customAttributes)
			: null;

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
				<pre style={{ wordBreak: 'break-word' }}>{code}</pre>{' '}
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
							onClick={() => this.toggleHandler('showLazyload')}
						>
							Lazyload Settings
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
