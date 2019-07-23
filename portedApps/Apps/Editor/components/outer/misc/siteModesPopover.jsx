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
		const isPublishMode = props.mode && props.mode === siteModes.PUBLISH,
			isPartnerGeniee = this.checkPartnerGeniee(props);

		this.checkApStatus(props);
		this.state = {
			apStatus: isPartnerGeniee ? status.SUCCESS : status.PENDING,
			controlStatus: (isPublishMode || isPartnerGeniee) ? status.TRUE : status.FALSE
		};
	}

	checkPartnerGeniee(props) {
		const _props = props || this.props,
			isPartner = !!(_props && _props.partner),
			isPartnerGeniee = !!(isPartner && _props.partner === 'geniee');

		return isPartnerGeniee;
	}

	componentWillReceiveProps(nextProps) {
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

	handleControlStatusOnChange() {
		this.setState({
			controlStatus: !this.state.controlStatus
		});
	}

	renderAdPushupSnippetPanel() {
		return (
			<Panel
				header="AdPushup snippet"
				className={
					this.state.apStatus == status.PENDING
						? 'pending'
						: this.state.apStatus == status.SUCCESS ? 'completed' : 'notcompleted'
				}
				eventKey={2}
			>
				<div>
					We can't optimize your site if AdPushup snippet isn't installed! :){' '}
					<a
						className="btn btn-sm btn-lightBg publishHelperhelp"
						onClick={this.showGuider.bind(null, components.ADPUSHUP_INSTALLATION_GUIDER)}
					>
						Read more
					</a>
				</div>
			</Panel>
		);
	}

	renderControlTagsConversionPanel() {
		return (
			<Panel
				header="Control Ad Setup"
				className={this.state.controlStatus ? 'completed' : 'notcompleted'}
				eventKey={4}
			>
				<div>
					We strongly recommend setting up Control Ads on your site. They can help you track
					AdPushup performance, act as fallback in case of failure and much more. Please take
					a moment out to understand them.
					<a
						className="btn btn-sm btn-lightBg publishHelperhelp"
						onClick={this.showGuider.bind(null, components.CONTROL_CONVERSION_GUIDER)}
					>
						Read more
					</a>
					<br />
				</div>
				<input
					type="checkbox"
					className="maincheckbox"
					id="ctrlconverted"
					checked={this.state.controlStatus}
					onChange={this.handleControlStatusOnChange.bind(this)}
				/>
				<label htmlFor="ctrlconverted">
					Yes, I understand what control ads are, and have set them up.
				</label>
			</Panel>
		);
	}

	render() {
		const positionOffsets = this.getPositionOffsets(),
			style = {
				position: 'absolute',
				top: positionOffsets.top,
				left: positionOffsets.left,
				zIndex: 10000,
				backgroundColor: 'white',
				boxShadow: '0 1px 10px 0 rgba(0, 0, 0, 0.3)',
				width: '300px'
			},
			isPartnerGeniee = this.checkPartnerGeniee(),
			isNotPendingStatus = this.state.apStatus !== status.PENDING,
			allDone = this.props.url && this.state.apStatus === status.SUCCESS && this.state.controlStatus;

		if (!this.props.isVisible) {
			return null;
		}

		if (this.props.mode === siteModes.PUBLISH) {
			setTimeout(() => {
				if (confirm('Do you wish to pause AdPushup ?')) {
					this.masterSave(siteModes.DRAFT);
				} else {
					this.props.hideMenu();
				}
			}, 0);

			return null;
		}

		if (this.props.mode === siteModes.DRAFT && allDone && isNotPendingStatus) {
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
								<div>
									You should have at least one Page Group set up.<a
										className="btn btn-sm btn-lightBg publishHelperhelp"
										onClick={this.showGuider.bind(null, components.PAGE_GROUP_GUIDER)}
									>
										Read more
									</a>
								</div>
							</Panel>
							{isPartnerGeniee ? null : this.renderAdPushupSnippetPanel()}
							{isPartnerGeniee ? null : this.renderControlTagsConversionPanel()}
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
