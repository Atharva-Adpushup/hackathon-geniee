import React, { PropTypes } from 'react';
import Utils from 'libs/utils';
import Glass from 'components/shared/glass.jsx';
import { isApInstalled } from 'libs/dataSyncService';
import { status, siteModes, components } from 'consts/commonConsts';
import Panel from 'react-bootstrap/lib/Panel';
import Accordion from 'react-bootstrap/lib/Accordion';

class siteModesPopover extends React.Component {
	constructor(props) {
		super(props);
		const isPublishMode = props.mode && props.mode === siteModes.PUBLISH;
		const isPartnerGeniee = this.checkPartnerGeniee(props);

		this.checkApStatus(props);
		this.checkLiveStatus();
		this.state = {
			apStatus: isPartnerGeniee ? status.SUCCESS : status.PENDING,
			controlStatus: isPublishMode || isPartnerGeniee ? status.TRUE : status.FALSE
		};
		this.showGuider = this.showGuider.bind(this);
		this.checkLiveStatus = this.checkLiveStatus.bind(this);
		this.renderGAMPanel = this.renderGAMPanel.bind(this);
		this.handleStatusOnChange = this.handleStatusOnChange.bind(this);
		this.computeAdsTxtStatusLabel = this.computeAdsTxtStatusLabel.bind(this);
	}

	checkPartnerGeniee(props) {
		const _props = props || this.props,
			isPartner = !!(_props && _props.partner),
			isPartnerGeniee = !!(isPartner && _props.partner === 'geniee');

		return isPartnerGeniee;
	}

	componentWillReceiveProps(nextProps) {
		this.checkLiveStatus();
		this.checkApStatus(nextProps);
	}

	masterSave(mode) {
		this.props.masterSave(mode);
	}

	showGuider(guider) {
		// this.props.showComponent(guider);
	}

	onGlassClick() {
		this.props.hideMenu();
	}

	checkApStatus(props) {
		const isPartnerGeniee = this.checkPartnerGeniee();

		if (!props.isVisible || !props.mode === siteModes.DRAFT || isPartnerGeniee) {
			return false;
		}

		this.setState({ apStatus: status.PENDING });
		isApInstalled(props.url || window.ADP_SITE_DOMAIN, window.ADP_SITE_ID)
			.then(apStatus => {
				if (apStatus && apStatus.ap) {
					this.setState({ apStatus: status.SUCCESS });
				} else {
					this.setState({ apStatus: status.FAILED });
				}
			})
			.fail(() => {
				this.setState({ apStatus: status.FAILED });
			});
	}

	checkLiveStatus() {
		const self = this;
		return Utils.ajax({
			method: 'GET',
			url: '/api/site/live',
			data: {
				siteId: window.ADP_SITE_ID
			}
		})
			.then(response => {
				const { data = {} } = response;
				self.setState(state => ({
					...state,
					...data
				}));
			})
			.catch(err => {
				const { data = {} } = err;
				self.setState(
					state => ({
						...state,
						...data
					}),
					() => window.alert('Site live status check fail. Please try again later.')
				);
			});
	}

	getPositionOffsets() {
		const leftArrowOffset = 7,
			// Below variable adds the left offset adjustment done to make arrow
			// appear pixel-perfect
			targetLeftPosition = this.props.position.width / 2 + leftArrowOffset * 2,
			positionObj = {
				// 7px offset is popover arrow height
				top: this.props.position.top + this.props.position.height + 7,
				left: this.props.position.left + targetLeftPosition - 300
			};

		return positionObj;
	}

	handleStatusOnChange(e) {
		const { target } = e;
		const key = target.getAttribute('data-key');
		const value = this.state[key];

		this.setState({
			[key]: !value
		});
	}

	computeAdsTxtStatusLabel(value) {
		switch (value) {
			case 1:
				return 'All Good';
			case 2:
				return 'AdPushup Ads.txt entries not found';
			case 3:
				return 'Some entries are missing';
			case 4:
				return "Cannot find publisher's ads.txt";
			default:
			case 5:
				return 'Ads.txt status invalid. You can bypass using the checkbox below.';
		}
	}

	renderAdPushupSnippetPanel() {
		return (
			<Panel
				header="AdPushup snippet"
				className={
					this.state.apStatus == status.PENDING
						? 'pending'
						: this.state.apStatus == status.SUCCESS
						? 'completed'
						: 'notcompleted'
				}
				eventKey={2}
			>
				<div>We can't optimize your site if AdPushup snippet isn't installed! :) </div>
			</Panel>
		);
	}

	renderAdsTxtPanel() {
		const { adsTxtStatus } = this.state;
		const isAdsTxtValid = adsTxtStatus == 1;

		return (
			<Panel
				header="AdsTxt Setup"
				className={isAdsTxtValid ? 'completed' : 'notcompleted'}
				eventKey={6}
			>
				<div>
					AdsTxt is required for proper functioning. Current AdsTxt Status:{' '}
					<strong>{this.computeAdsTxtStatusLabel(adsTxtStatus)}</strong>
				</div>
				<input
					type="checkbox"
					className="maincheckbox"
					id="adsTxtSetupCheckbox"
					checked={isAdsTxtValid}
					data-key="adsTxtStatus"
					onChange={() => {
						const value = adsTxtStatus == 1 ? 5 : 1;
						this.setState(state => ({ ...state, adsTxtStatus: value }));
					}}
				/>
				<label htmlFor="adsTxtSetupCheckbox">Yes, I understand what I am doing.</label>
			</Panel>
		);
	}

	renderAdsensePanel() {
		const { adsenseStatus } = this.state;

		return (
			<Panel
				header="Adsense Setup"
				className={adsenseStatus ? 'completed' : 'notcompleted'}
				eventKey={5}
			>
				<div>
					If you are using Adsense as demand partner and wish to ads sync automatically in the
					Adsense Panel then it is mandatory to add Adsense Publisher Id in the Admin Panel. You can
					bypass this validation by checking the box below.
					<br />
				</div>
				<input
					type="checkbox"
					className="maincheckbox"
					id="adsenseSetupCheckbox"
					checked={adsenseStatus}
					data-key="adsenseStatus"
					onChange={this.handleStatusOnChange}
				/>
				<label htmlFor="adsenseSetupCheckbox">Yes, I understand what I am doing.</label>
			</Panel>
		);
	}

	renderGAMPanel() {
		const { gamStatus } = this.state;
		return (
			<Panel header="GAM Status" className={gamStatus ? 'completed' : 'notcompleted'} eventKey={4}>
				<div>
					We can't optimize your site if Google AdManager isn't selected! Please connect AdPushup
					Operations Team.
				</div>
			</Panel>
		);
	}

	renderControlTagsConversionPanel() {
		return (
			<Panel
				header="Control Ad Setup"
				className={this.state.controlStatus ? 'completed' : 'notcompleted'}
				eventKey={3}
			>
				<div>
					We strongly recommend setting up Control Ads on your site. They can help you track
					AdPushup performance, act as fallback in case of failure and much more. Please take a
					moment out to understand them.
				</div>
				<input
					type="checkbox"
					className="maincheckbox"
					id="ctrlconverted"
					data-key="controlStatus"
					onChange={this.handleStatusOnChange}
					checked={this.state.controlStatus}
				/>
				<label htmlFor="ctrlconverted">
					Yes, I understand what control ads are, and have set them up.
				</label>
			</Panel>
		);
	}

	render() {
		const positionOffsets = this.getPositionOffsets();
		const style = {
			position: 'absolute',
			top: positionOffsets.top,
			left: positionOffsets.left,
			zIndex: 10000,
			backgroundColor: 'white',
			boxShadow: '0 1px 10px 0 rgba(0, 0, 0, 0.3)',
			width: '300px'
		};
		const isPartnerGeniee = this.checkPartnerGeniee();
		const { url, mode, isVisible, hideMenu } = this.props;
		const { apStatus, controlStatus, adsenseStatus, gamStatus, adsTxtStatus } = this.state;

		const isNotPendingStatus = apStatus !== status.PENDING;
		const allDone =
			url &&
			apStatus === status.SUCCESS &&
			controlStatus &&
			adsenseStatus &&
			gamStatus &&
			adsTxtStatus == 1;

		if (!isVisible) {
			return null;
		}

		if (mode === siteModes.PUBLISH) {
			setTimeout(() => {
				if (confirm('Do you wish to pause AdPushup ?')) {
					this.masterSave(siteModes.DRAFT);
				} else {
					hideMenu();
				}
			}, 0);

			return null;
		}

		if (mode === siteModes.DRAFT && allDone && isNotPendingStatus) {
			setTimeout(() => {
				this.masterSave(siteModes.PUBLISH);
			}, 0);
		}

		return (
			<div>
				<Glass clickHandler={this.onGlassClick.bind(this)} />

				<div style={style} className="publishHelperWrap">
					<div className="publishHelperHeading">
						Please complete the following before AdPushup goes live on the site!
					</div>
					<div className="publishHelperWrapInner">
						<Accordion>
							<Panel
								header="Page Group Setup"
								className={this.props.url ? 'completed' : 'notcompleted'}
								eventKey={1}
							>
								<div>You should have at least one Page Group set up.</div>
							</Panel>
							{isPartnerGeniee ? null : this.renderAdPushupSnippetPanel()}
							{isPartnerGeniee ? null : this.renderControlTagsConversionPanel()}
							{this.renderGAMPanel()}
							{this.renderAdsensePanel()}
							{this.renderAdsTxtPanel()}
						</Accordion>
					</div>
				</div>
			</div>
		);
	}
}

siteModesPopover.defaultProps = {};

siteModesPopover.propTypes = {
	mode: PropTypes.number.isRequired,
	position: PropTypes.object
};

export default siteModesPopover;
