/* eslint-disable no-alert */
import React, { Component } from 'react';
import { OverlayTrigger, Tooltip } from '@/Client/helpers/react-bootstrap-imports';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import PagegroupTrafficEdit from './PagegroupTrafficEdit';
import FormatEdit from './FormatEdit';
import { makeFirstLetterCapitalize } from '../../../../../helpers/commonFunctions';
import CopyButtonWrapperContainer from '../../../../../Containers/CopyButtonWrapperContainer';
import {
	AD_LIST_ACTIONS,
	USER_AD_LIST_ACTIONS,
	OPS_AD_LIST_ACTIONS
} from '../../../configs/commonConsts';
import Edit from '../../../../../Components/EditBox/index';
import AdNetworkDetails from './AdNetworkDetails';
import FluidEdit from './FluidEdit';
import CloseButtonEdit from './CloseButtonEdit';
import Tags from '../../../../../Components/Tags';
import CustomButton from '../../../../../Components/CustomButton/index';

class AdElement extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isActive: Object.prototype.hasOwnProperty.call(props.ad, 'isActive')
				? props.ad.isActive
				: true
		};
		this.renderAdDetails = this.renderAdDetails.bind(this);
		this.toggleAdStatus = this.toggleAdStatus.bind(this);
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
		this.isSuperUser = !!props.user.isSuperUser;
	}

	getIdentifier() {
		this.incrementIdentifier();
		return this.identifier;
	}

	incrementIdentifier() {
		this.identifier += 1;
	}

	toggleAdStatus() {
		const { isActive } = this.state;
		const { ad, archiveAd, user, siteId, dataForAuditLogs } = this.props;
		const message = isActive
			? 'Are you sure you want to archive this ad?'
			: 'Are you sure you want to unarchive this ad?';
		if (window.confirm(message)) {
			archiveAd(
				ad.id,
				siteId,
				{
					format: ad.formatData.format,
					platform: ad.formatData.platform,
					pagegroups: ad.pagegroups,
					isActive: !isActive,
					archivedOn: +new Date(),
					networkData: {
						...ad.networkData,
						logWritten: false
					}
				},
				user.isSuperUser,
				dataForAuditLogs
			).then(response => {
				if (response) {
					this.setState(
						{
							isActive: !isActive
						},
						() => {
							if (user.isSuperUser)
								window.alert('Kindly, do not forget to do Master Save to presist this change.');
						}
					);
				}
				return true;
			});
		}
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
		const {
			ad,
			meta,
			modalToggle,
			updateTraffic,
			user,
			channels,
			siteId,
			dataForAuditLogs
		} = this.props;
		const hasPagegroups = !!(ad.pagegroups && ad.pagegroups.length);

		let body = <p>Custom Traffic Edit would be here</p>;
		let header = 'Edit Traffic';

		if (hasPagegroups) {
			header += ' | Pagegroups';
			body = (
				<PagegroupTrafficEdit
					ad={ad}
					meta={meta}
					user={user}
					channels={channels}
					dataForAuditLogs={dataForAuditLogs}
					updateTraffic={updateTraffic}
					updateWrapper={this.updateWrapper}
					onCancel={modalToggle}
					isSuperUser={this.isSuperUser}
					siteId={siteId}
				/>
			);
		}
		return modalToggle({
			header,
			body,
			footer: false
		});
	}

	updateWrapper(data) {
		const { user, ad, updateAd, modifyAdOnServer, siteId, dataForAuditLogs } = this.props;
		return user.isSuperUser
			? updateAd(ad.id, siteId, data)
			: modifyAdOnServer(ad.id, siteId, data, dataForAuditLogs);
	}

	userActionsHandler(action) {
		const { modalToggle, ad, dataForAuditLogs } = this.props;
		switch (action) {
			case 'archive':
			case 'unarchive':
				return this.toggleAdStatus();
			case 'networkEdit':
				return modalToggle({
					header: 'Edit Network Options',
					body: (
						<AdNetworkDetails
							ad={ad}
							dataForAuditLogs={dataForAuditLogs}
							onSubmit={this.updateWrapper}
							onCancel={modalToggle}
						/>
					),
					footer: false
				});
			case 'formatEdit':
				return modalToggle({
					header: 'Edit Format Options',
					body: (
						<FormatEdit
							ad={ad}
							dataForAuditLogs={dataForAuditLogs}
							onSave={this.updateWrapper}
							onCancel={modalToggle}
						/>
					),
					footer: false
				});
			case 'fluidEdit':
				return modalToggle({
					header: 'Edit Fluid Value',
					body: (
						<FluidEdit
							ad={ad}
							dataForAuditLogs={dataForAuditLogs}
							onSubmit={this.updateWrapper}
							onCancel={modalToggle}
						/>
					),
					footer: false
				});
			case 'closeButtonEdit':
				return modalToggle({
					header: 'Edit Close Button Value',
					body: (
						<CloseButtonEdit
							ad={ad}
							dataForAuditLogs={dataForAuditLogs}
							onSubmit={this.updateWrapper}
							onCancel={modalToggle}
						/>
					),
					footer: false
				});

			default:
				return null;
		}
	}

	renderTrafficMode() {
		const { ad } = this.props;
		if (ad.pagegroups && ad.pagegroups.length) {
			return (
				<div>
					<p>Pagegroups</p>
					<Tags
						labels={ad.pagegroups && ad.pagegroups.length ? ad.pagegroups : 'All'}
						labelClasses="custom-label"
					/>
				</div>
			);
		}
		return <p>All</p>;
	}

	renderActions(actions, value) {
		const { ad } = this.props;
		return actions.map((element, index) => {
			const action = AD_LIST_ACTIONS[element.name];
			return (
				<OverlayTrigger
					placement="bottom"
					overlay={<Tooltip id={`ad-${ad.id}-${action.tooltipText}`}>{action.tooltipText}</Tooltip>}
					key={`ad-${ad.id}-${action.tooltipText}`}
				>
					<React.Fragment>
						{element.name === 'copy' && (
							<CopyButtonWrapperContainer content={value}>
								<FontAwesomeIcon
									icon={action.iconClass}
									className={`u-text-red adDetails-icon u-margin-r2 ${
										index === 0 ? 'u-margin-l2' : ''
									}`}
								/>
							</CopyButtonWrapperContainer>
						)}

						{element.name !== 'copy' && (
							<FontAwesomeIcon
								icon={action.iconClass}
								className={`u-text-red adDetails-icon u-margin-r2 ${
									index === 0 ? 'u-margin-l2' : ''
								}`}
								onClick={element.handler}
							/>
						)}
					</React.Fragment>
				</OverlayTrigger>
			);
		});
	}

	renderInformation(value, actions = [], maxWidth = '80px') {
		const { ad } = this.props;
		return (
			<td
				key={`${ad.id}-infoKey-${this.getIdentifier()}`}
				className="ad-td"
				style={{ maxWidth, wordBreak: 'break-word' }}
			>
				{value}
				{actions.length ? this.renderActions(actions, value) : null}
			</td>
		);
	}

	renderUserActions() {
		const actions = this.isSuperUser ? OPS_AD_LIST_ACTIONS : USER_AD_LIST_ACTIONS;
		const { ad } = this.props;

		return actions
			.filter(
				action =>
					(ad.isActive && action.key !== 'unarchive') || (!ad.isActive && action.key !== 'archive')
			)
			.map(action => {
				if (action.key === 'closeButtonEdit' && ad.formatData.type !== 'sticky') {
					return '';
				}

				if (
					action.key !== 'archive' &&
					action.key !== 'unarchive' &&
					ad.formatData.type === 'interstitial'
				) {
					return '';
				}

				return (
					<CustomButton
						key={`adAction-${ad.id}-${action.key}`}
						variant="secondary"
						className="u-margin-b3"
						onClick={() => this.userActionsHandler(action.key)}
					>
						{action.displayText}
					</CustomButton>
				);
			});
	}

	renderAdDetails() {
		const { ad } = this.props;
		const toRender = [];

		// Rendering tds. Do not change the order of the code below as it depends upon user mode.
		toRender.push(this.renderInformation(ad.id, [{ name: 'copy' }]));
		toRender.push(
			this.renderInformation(ad.name, [{ name: 'copy' }, { name: 'edit', handler: this.editName }])
		);
		toRender.push(this.renderInformation(makeFirstLetterCapitalize(ad.formatData.platform)));
		toRender.push(this.renderInformation(makeFirstLetterCapitalize(ad.formatData.format)));
		toRender.push(this.renderInformation(`${ad.width}x${ad.height}`));
		if (this.isSuperUser) {
			toRender.push(this.renderInformation(ad.network ? ad.network.toUpperCase() : 'Not Set'));
		}
		toRender.push(
			this.renderInformation(this.renderTrafficMode(), [
				{ name: 'edit', handler: this.editTraffic }
			])
		);
		toRender.push(
			this.renderInformation(
				ad.isActive ? (
					<span className="u-text-bold u-text-success">Active</span>
				) : (
					<span className="u-text-bold u-text-error">Archived</span>
				)
			)
		);
		toRender.push(this.renderInformation(this.renderUserActions(), [], '100px'));
		return toRender;
	}

	render() {
		const { identifier } = this.props;
		return (
			<tr key={identifier} className="ad-tr">
				{this.renderAdDetails()}
			</tr>
		);
	}
}

export default AdElement;
