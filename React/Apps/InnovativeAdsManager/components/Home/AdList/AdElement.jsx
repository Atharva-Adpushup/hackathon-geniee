import React, { Component } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import PagegroupTrafficEdit from './PagegroupTrafficEdit';
import FormatEdit from './FormatEdit';
import { makeFirstLetterCapitalize, copyToClipBoard } from '../../../lib/helpers';
import { AD_LIST_ACTIONS, USER_AD_LIST_ACTIONS, OPS_AD_LIST_ACTIONS } from '../../../configs/commonConsts';
import Edit from '../../shared/Edit';
import AdNetworkDetails from './AdNetworkDetails';
import Tags from '../../../../../Components/Tags';

class AdElement extends Component {
	constructor(props) {
		super(props);
		this.state = {
			isActive: Object.prototype.hasOwnProperty.call(props.ad, 'isActive') ? props.ad.isActive : true
		};
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
		if (window.confirm(message)) {
			this.props
				.archiveAd(
					this.props.ad.id,
					{
						format: this.props.ad.formatData.format,
						platform: this.props.ad.formatData.platform,
						pagegroups: this.props.ad.pagegroups,
						isActive: !this.state.isActive,
						archivedOn: +new Date(),
						networkData: {
							...this.props.ad.networkData,
							logWritten: false
						}
					},
					this.isSuperUser
				)
				.then(response => {
					if (response) {
						this.setState({
							isActive: !this.state.isActive
						});
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
		const hasPagegroups = !!(this.props.ad.pagegroups && this.props.ad.pagegroups.length);
		const { ad, meta, modalToggle, updateTraffic } = this.props;

		let body = <p>Custom Traffic Edit would be here</p>;
		let header = 'Edit Traffic';

		if (hasPagegroups) {
			header += ' | Pagegroups';
			body = (
				<PagegroupTrafficEdit
					ad={ad}
					meta={meta}
					updateTraffic={updateTraffic}
					updateWrapper={this.updateWrapper}
					onCancel={modalToggle}
					isSuperUser={this.isSuperUser}
				/>
			);
		}
		return this.props.modalToggle({
			header,
			body,
			footer: false
		});
	}

	updateWrapper(data) {
		return window.isSuperUser
			? this.props.updateAd(this.props.ad.id, data)
			: this.props.modifyAdOnServer(this.props.ad.id, data);
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
			case 'formatEdit':
				return this.props.modalToggle({
					header: 'Edit Format Options',
					body: (
						<FormatEdit ad={this.props.ad} onSave={this.updateWrapper} onCancel={this.props.modalToggle} />
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

	renderAdDetails() {
		const { ad } = this.props;
		const toRender = [];

		// Rendering tds. Do not change the order of the code below as it depends upon user mode.
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
		toRender.push(
			this.renderInformation(
				ad.isActive ? (
					<span className="boldTxt text-success">Active</span>
				) : (
					<span className="boldTxt text-error">Archived</span>
				)
			)
		);
		toRender.push(this.renderInformation(this.renderUserActions()));
		return toRender;
	}

	render() {
		const { identifier } = this.props;

		return <tr key={identifier}>{this.renderAdDetails()}</tr>;
	}
}

export default AdElement;
