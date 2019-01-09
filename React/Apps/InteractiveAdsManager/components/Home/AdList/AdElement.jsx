import React, { Component } from 'react';
import { Row, Col, OverlayTrigger, Tooltip, Button, Modal } from 'react-bootstrap';
import { makeFirstLetterCapitalize, copyToClipBoard } from '../../../lib/helpers';
import { adCode, adCodeVideo, ampMessage, AD_LIST_ACTIONS } from '../../../configs/commonConsts';
import Edit from '../../shared/Edit';
import { CustomButton } from '../../shared/index';
import { USER_AD_LIST_ACTIONS, OPS_AD_LIST_ACTIONS } from '../../../configs/commonConsts';
import AdNetworkDetails from './AdNetworkDetails';
import AdEventDetails from './AdEventDetails';
import LazyLoadSettings from './LazyLoadSettings';
import Tags from '../../../../../Components/Tags';

class AdElement extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showNetworkDetails: false,
			showEventDetails: false,
			showLazyload: false,
			editName: false,
			isActive: Object.prototype.hasOwnProperty.call(props.ad, 'isActive') ? props.ad.isActive : true,
			show: true
		};
		this.toggleHandler = this.toggleHandler.bind(this);
		this.renderAdDetails = this.renderAdDetails.bind(this);
		this.disableAd = this.disableAd.bind(this);
		this.updateWrapper = this.updateWrapper.bind(this);
		this.incrementIdentifier = this.incrementIdentifier.bind(this);
		this.getIdentifier = this.getIdentifier.bind(this);
		this.renderInformation = this.renderInformation.bind(this);
		this.renderActions = this.renderActions.bind(this);
		this.renderTrafficMode = this.renderTrafficMode.bind(this);
		this.editName = this.editName.bind(this);
		this.userActionsHandler = this.userActionsHandler.bind(this);
		this.editTraffic = this.editTraffic.bind(this);

		this.identifier = 0;
		this.isSuperUser = !!(window.iam && window.iam.isSuperUser);
	}

	toggleHandler(property) {
		this.setState({
			[property]: !this.state[property]
		});
	}

	getIdentifier() {
		this.incrementIdentifier();
		return this.identifier;
	}

	incrementIdentifier() {
		this.identifier += 1;
	}

	disableAd() {
		const message = this.state.isActive
			? 'Are you sure you want to archive this ad?'
			: 'Are you sure you want to unarchive this ad?';
		if (confirm(message)) {
			this.setState(
				{
					isActive: !this.state.isActive
				},
				() => {
					this.updateWrapper({
						isActive: this.state.isActive,
						archivedOn: +new Date()
					});
				}
			);
		}
	}

	getAMPAdCode(ad) {
		return ad.formatData.network && ad.formatData.networkData && ad.formatData.networkData.adCode
			? ad.formatData.networkData.adCode
			: ampMessage;
	}

	renderTrafficMode() {
		const { ad } = this.props;
		if (ad.pagegroups && ad.pagegroups.length) {
			return (
				<div>
					<p>Pagegroups</p>
					<Tags labels={ad.pagegroups} labelClasses="custom-label" />
				</div>
			);
		}
		return <p>Custom</p>;
	}

	renderActions(actions) {
		return actions.map((element, index) => {
			const action = AD_LIST_ACTIONS[element.name];
			return (
				<OverlayTrigger
					placement="bottom"
					overlay={
						<Tooltip id={`ad-${this.props.ad.id}-${action.tooltipText}`}>{action.tooltipText}</Tooltip>
					}
					key={`ad-${this.props.ad.id}-${action.tooltipText}`}
				>
					<span className="adDetails-icon" style={{ cursor: 'pointer' }} onClick={element.handler}>
						<i className={`${action.iconClass} ad-action-icon mr-5 ${index === 0 ? 'ml-5' : ''}`} />
					</span>
				</OverlayTrigger>
			);
		});
	}

	renderInformation(value, actions = []) {
		return (
			<td
				key={`${this.props.ad.id}-infoKey-${this.getIdentifier()}`}
				className="ad-td"
				style={{ maxWidth: '100px' }}
			>
				{value}
				{actions.length ? this.renderActions(actions) : null}
			</td>
		);
	}

	userActionsHandler(action) {
		switch (action) {
			case 'archive':
				return this.disableAd();
			case 'networkEdit':
				return this.props.modalToggle({
					header: 'Edit Network Options',
					body: (
						<AdNetworkDetails
							ad={this.props.ad}
							onSubmit={this.updateWrapper}
							onCancel={this.props.modalToggle}
						/>
					),
					footer: false
				});
			default:
				return null;
		}
	}

	renderUserActions() {
		const actions = this.isSuperUser ? OPS_AD_LIST_ACTIONS : USER_AD_LIST_ACTIONS;

		return actions.map((action, index) => (
			<a
				key={`adAction-${this.props.ad.id}-${index}`}
				href="#"
				className="action-button"
				onClick={e => {
					e.preventDefault();
					this.userActionsHandler(action.key);
				}}
			>
				{action.displayText}
			</a>
		));
	}

	updateWrapper(data) {
		return window.isSuperUser
			? this.props.updateAd(this.props.ad.id, data)
			: this.props.modifyAdOnServer(this.props.ad.id, data);
	}

	editName() {
		const { ad, modalToggle } = this.props;
		return modalToggle({
			header: 'Edit Ad Name',
			body: (
				<Edit
					label="Ad Name"
					name={`name-${ad.id}`}
					value={ad.name ? ad.name : `Ad-${ad.id}`}
					leftSize={3}
					rightSize={9}
					onSave={this.updateWrapper}
					onCancel={modalToggle}
				/>
			),
			footer: false
		});
	}

	editTraffic() {
		const hasPagegroups = !!(this.props.ad.pagegroups && this.props.ad.pagegroups.length);
		return hasPagegroups;
	}

	renderAdDetails() {
		const { ad, updateAd } = this.props;
		const isAMP = ad.formatData.type === 'amp';
		const toRender = [];

		let code = isAMP ? this.getAMPAdCode(ad) : adCode;
		code = code ? code.replace(/__AD_ID__/g, ad.id) : null;

		if (this.state.showNetworkDetails) {
			return (
				<AdNetworkDetails
					ad={ad}
					onCancel={this.toggleHandler.bind(null, 'showNetworkDetails')}
					onSubmit={updateAd}
				/>
			);
		} else if (this.state.showEventDetails) {
			return (
				<AdEventDetails
					ad={ad}
					onCancel={this.toggleHandler.bind(null, 'showEventDetails')}
					onSubmit={updateAd}
				/>
			);
		} else if (this.state.editName) {
			return (
				<Edit
					label="Ad Name"
					name={`name-${ad.id}`}
					value={ad.name ? ad.name : `Ad-${ad.id}`}
					onSave={this.updateWrapper}
					onCancel={this.toggleHandler.bind(null, 'editName')}
					leftSize={3}
					rightSize={9}
				/>
			);
		} else if (this.state.showLazyload) {
			return (
				<LazyLoadSettings
					checked={ad.enableLazyLoading}
					id={ad.id}
					changeHandler={updateAd.bind(null, ad.id)}
					cancelHandler={this.toggleHandler.bind(null, 'showLazyload')}
				/>
			);
		}
		toRender.push(this.renderInformation(ad.id, [{ name: 'copy', handler: copyToClipBoard.bind(null, ad.id) }]));
		toRender.push(
			this.renderInformation(ad.name, [
				{ name: 'copy', handler: copyToClipBoard.bind(null, ad.name) },
				{ name: 'edit', handler: this.editName }
			])
		);
		toRender.push(this.renderInformation(makeFirstLetterCapitalize(ad.formatData.platform)));
		toRender.push(this.renderInformation(makeFirstLetterCapitalize(ad.formatData.format)));
		toRender.push(this.renderInformation(`${ad.width}x${ad.height}`));
		if (this.isSuperUser) {
			toRender.push(this.renderInformation(ad.network ? ad.network.toUpperCase() : 'Not Set'));
		}
		toRender.push(this.renderInformation(this.renderTrafficMode(), [{ name: 'edit', handler: this.editTraffic }]));
		if (this.isSuperUser) {
			toRender.push(
				this.renderInformation(
					ad.isActive ? (
						<span className="boldTxt text-success">Active</span>
					) : (
						<span className="boldTxt text-error">Archived</span>
					)
				)
			);
		}
		toRender.push(this.renderInformation(this.renderUserActions()));
		return toRender;
		// return (
		// 	<React.Fragment>
		{
			/* <div key={`adDetails${ad.id}`}> */
		}
		{
			/* {!this.state.isActive ? <Tags labels={['Archived']} labelClasses="custom-label" /> : null} */
		}
		{
			/* {this.renderInformation(ad.id)} */
		}
		{
			/* <p>
					Name: <strong>{ad.name ? ad.name : `Ad-${ad.id}`}</strong>{' '}
					<OverlayTrigger placement="bottom" overlay={<Tooltip id="ad-name-edit">Edit Ad Name</Tooltip>}>
						<span
							className="adDetails-icon"
							onClick={this.toggleHandler.bind(null, 'editName')}
							style={{ cursor: 'pointer' }}
						>
							<i className="btn-icn-edit" />
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
					ad.width === 'responsive' ? makeFirstLetterCapitalize(ad.width) : `${ad.width}x${ad.height}`
				)}
				{window.isSuperUser ? (
					<div>
						{this.renderInformation(
							'Network',
							ad.network && ad.networkData ? ad.network.toUpperCase() : 'Not Set'
						)}
						{this.renderInformation('Status', ad.isActive ? 'Active' : 'Archived')}
					</div>
				) : null}
				<pre style={{ wordBreak: 'break-word' }}>{code}</pre>{' '}
				{window.isSuperUser ? (
					<div>
						<CustomButton
							label="Network Details"
							handler={this.toggleHandler.bind(null, 'showNetworkDetails')}
						/>
						<CustomButton
							label="Lazyload Settings"
							handler={this.toggleHandler.bind(null, 'showLazyload')}
						/>
					</div>
				) : null}
				{!isAMP ? <CustomButton label="Copy Adcode" handler={copyToClipBoard.bind(null, code)} /> : null} */
		}
	}

	render() {
		const { identifier } = this.props;

		return (
			<tr key={identifier}>{this.renderAdDetails()}</tr>
			// <div key={`adELement-${ad.id}`}>
			// 	<OverlayTrigger
			// 		placement="bottom"
			// 		overlay={
			// 			<Tooltip id="delete-ad-tooltip">{this.state.isActive ? 'Archive Ad' : 'Unarchive Ad'}</Tooltip>
			// 		}
			// 	>
			// 		<Button className="btn-close" onClick={this.disableAd.bind(null, ad)}>
			// 			x
			// 		</Button>
			// 	</OverlayTrigger>
			// 	<Col xs={3} className="ad-image">
			// 		<img src={`/assets/images/tagManager/${ad.formatData.type}.png`} />
			// 	</Col>
			// 	<Col xs={9} className="ad-details">
			// 		{this.renderAdDetails()}
			// 	</Col>
			// 	<div style={{ clear: 'both' }} />
			// </div>
		);
	}
}

export default AdElement;
