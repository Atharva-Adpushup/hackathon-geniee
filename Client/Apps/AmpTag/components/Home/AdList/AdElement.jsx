/* eslint-disable no-alert */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Col, OverlayTrigger, Tooltip, Button } from '@/Client/helpers/react-bootstrap-imports';
import CopyButtonWrapperContainer from '../../../../../Containers/CopyButtonWrapperContainer';
import { DISPLAYADCODE, STICKYADCODE } from '../../../configs/commonConsts';
import CustomButton from '../../../../../Components/CustomButton/index';
import RefreshSettings from './RefreshSettings';
import EditBox from '../../../../../Components/EditBox/index';
import Tags from '../../../../../Components/Tags/index';

class AdElement extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showNetworkDetails: false,
			showLazyload: false,
			showRefresh: false,
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

	disableAd() {
		const { isActive } = this.state;
		const { ad } = this.props;
		const message = isActive
			? 'Are you sure you want to archive this ad?'
			: 'Are you sure you want to unarchive this ad?';
		if (window.confirm(message)) {
			this.setState(
				{
					isActive: !isActive
				},
				() => this.updateWrapper({ ad: { ...ad, isActive: !isActive, archivedOn: +new Date() } })
			);
		}
	}

	toggleHandler(property) {
		this.setState(state => ({ [property]: !state[property] }));
	}

	updateWrapper(data) {
		const { updateAd, modifyAdOnServer, user, ad, siteId, adsToUpdateOnMasterSave } = this.props;
		adsToUpdateOnMasterSave(ad.id);
		return user.isSuperUser
			? updateAd(ad.id, siteId, data.ad)
			: modifyAdOnServer(siteId, ad.id, data.ad);
	}

	renderInformation = (label, value) => (
		<p>
			{label}: <strong>{value}</strong>
		</p>
	);

	renderAdDetails() {
		const { user, siteId, ad, adsCount, networkCode, dfpMessage } = this.props;

		const { id, name } = ad;
		const {
			width,
			height,
			isRefreshEnabled,
			refreshInterval = 30,
			formatData,
			networkData: { dfpAdunitCode }
		} = ad;
		const { type } = formatData;
		const { editName, isActive, showRefresh } = this.state;

		const dynamicAttribsArr = [];
		const totalAmpSlots = adsCount.toString();

		dynamicAttribsArr.push(`data-siteid="${siteId}"`);
		dynamicAttribsArr.push(`data-totalAmpSlots=${totalAmpSlots}`);

		if (isRefreshEnabled) {
			dynamicAttribsArr.push(`data-enable-refresh="${refreshInterval}"`);
		}

		const dynamicAttribsStr = dynamicAttribsArr.length ? ` ${dynamicAttribsArr.join(' ')} ` : ' ';
		const ADCODE = type === 'display' ? DISPLAYADCODE : STICKYADCODE;
		let code = ADCODE;

		code = code
			? code
					.replace(/__WIDTH__/, width)
					.replace(/__HEIGHT__/, height)
					.replace(/__DYNAMIC_ATTRIBS__/, dynamicAttribsStr)
					.replace(/__NETWORK_CODE__/, networkCode)
					.replace(/__AD_UNIT_CODE__/, dfpAdunitCode)
			: null;

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
					value={name || `Ad-${id}`}
					onSave={this.updateWrapper}
					onCancel={() => this.toggleHandler('editName')}
					leftSize={3}
					rightSize={9}
				/>
			);
		}

		return (
			<div key={`adDetails${id}`}>
				{user.isSuperUser && !isActive ? (
					<Tags labels={['Archived']} labelClasses="custom-label" />
				) : null}
				{this.renderInformation('Id', id)}
				<p>
					Name: <strong>{name || `Ad-${id}`}</strong>{' '}
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
				{this.renderInformation('Size', `${ad.width}x${ad.height}`)}
				{ad.width === 'responsive' && !!ad.maxHeight
					? this.renderInformation('Max Height', ad.maxHeight)
					: null}
				{user.isSuperUser ? (
					<div>
						{this.renderInformation('Network', 'Adp Tags ')}
						{this.renderInformation('Status', ad.isActive ? 'Active' : 'Archived')}
					</div>
				) : null}
				<pre style={{ wordBreak: 'break-word' }}>{dfpAdunitCode ? code : dfpMessage}</pre>{' '}
				{user.isSuperUser ? (
					<React.Fragment>
						<CustomButton
							variant="secondary"
							className="u-margin-l3 u-margin-t3 pull-right"
							onClick={() => this.toggleHandler('showRefresh')}
						>
							Edit Refresh
						</CustomButton>
						{dfpAdunitCode ? (
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
		const {
			formatData: { type }
		} = ad;
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
					<img src={`/assets/images/tagManager/${type}.png`} alt="Ad Type" />
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
