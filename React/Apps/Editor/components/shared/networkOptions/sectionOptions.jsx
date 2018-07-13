import React, { PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import SelectBox from '../select/select.js';
import CustomToggleSwitch from '../customToggleSwitch.jsx';
import LabelWithButton from '../labelWithButton.jsx';
import CodeBox from '../codeBox';
import requiredIf from 'react-required-if';
import InlineEdit from '../inlineEdit/index.jsx';
import AdpTags from './AdpTags.jsx';

const positions = ['Unknown', 'Header', 'Under the article/column', 'Sidebar', 'Footer'];

class sectionOptions extends React.Component {
	constructor(props) {
		super(props);
		// Bind all methods 'this' so that 'this' keyword inside
		// them correctly points to class instance object while execution
		this.onChange = this.onChange.bind(this);
		this.onFirstFoldChange = this.onFirstFoldChange.bind(this);
		this.toggleCustomAdCode = this.toggleCustomAdCode.bind(this);
		this.onCustomAdCodeChange = this.onCustomAdCodeChange.bind(this);
		this.onCustomZoneIdSubmit = this.onCustomZoneIdSubmit.bind(this);
		this.renderCustomZoneIdInput = this.renderCustomZoneIdInput.bind(this);
		this.submitHandler = this.submitHandler.bind(this);

		// Set initial state
		this.state = {
			position: props.position,
			isAdInFirstFold: props.firstFold,
			isAdAsync: true,
			manageCustomCode: false,
			customAdCode: props.customAdCode,
			zoneId: props.zoneId
		};
	}

	onCustomZoneIdSubmit(zoneId) {
		this.setState({ zoneId });
	}

	submitHandler(networkData) {
		if (!this.state.zoneId) {
			this.props.showNotification({
				mode: 'error',
				title: 'Incomplete Values',
				message: 'Custom Zone is a required field'
			});
			return;
		}
		let toSend = {
			...networkData,
			dynamicAllocation: networkData.headerBidding,
			position: this.state.position,
			adCode: this.state.customAdCode,
			firstFold: this.state.isAdInFirstFold,
			asyncTag: this.state.isAdAsync,
			zoneId: this.state.zoneId
		};
		delete toSend.headerBidding;
		this.props.submitHandler(toSend);
	}

	onChange(position) {
		this.setState({ position });
	}

	onFirstFoldChange() {
		this.setState({
			isAdInFirstFold: !this.state.isAdInFirstFold
		});
	}

	onCustomAdCodeChange(adCode) {
		this.setState(
			{
				customAdCode: adCode
			},
			() => {
				this.toggleCustomAdCode();
			}
		);
	}

	toggleCustomAdCode() {
		this.setState({
			manageCustomCode: !this.state.manageCustomCode
		});
	}

	renderCustomZoneIdInput(zoneId, isInsertMode) {
		const isDisabledMode = !!(zoneId && !isInsertMode);

		return (
			<Row className="mT-10">
				<Col xs={6} className={this.props.fromPanel ? 'u-padding-r10px' : ''}>
					<strong>Geniee Zone Id</strong>
				</Col>
				<Col xs={6} className={this.props.fromPanel ? 'u-padding-l10px' : ''}>
					<input
						type="number"
						placeholder="Enter Geniee Zone Id"
						className="inputBasic mB-10"
						readOnly={isDisabledMode}
						disabled={isDisabledMode}
						value={zoneId}
						style={{ width: '100%' }}
						onChange={ev => {
							this.setState({ zoneId: ev.target.value });
						}}
					/>
				</Col>
			</Row>
		);
	}

	render() {
		const customAdCodeText = this.state.customAdCode ? 'Edit' : 'Add',
			isAdCreateBtnDisabled = !!(this.state.position !== null && typeof this.state.position !== 'undefined'),
			{ updateMode, updateSettings, sectionId, ad, isInsertMode, primaryAdSize } = this.props,
			{ position, isAdInFirstFold: firstFold, isAdAsync: asyncTag, zoneId } = this.state;

		if (this.state.manageCustomCode) {
			return (
				<CodeBox
					showButtons
					code={this.state.customAdCode}
					onSubmit={this.onCustomAdCodeChange}
					onCancel={this.toggleCustomAdCode}
				/>
			);
		}

		return (
			<div
				className="containerButtonBar sectionOptions mT-10"
				style={updateMode ? { paddingBottom: 0, marginRight: 15, marginLeft: 15 } : {}}
			>
				{updateMode && !zoneId ? null : this.renderCustomZoneIdInput(zoneId, isInsertMode)}

				<AdpTags
					fpKey={this.props.fpKey}
					priceFloor={this.props.priceFloor}
					headerBidding={this.props.headerBidding}
					refreshSlot={this.props.refreshSlot}
					overrideActive={this.props.overrideActive}
					overrideSizeTo={this.props.overrideSizeTo}
					submitHandler={this.submitHandler}
					onCancel={this.props.onCancel}
					code={this.props.code}
					buttonType={this.props.buttonType || 1}
					fromPanel={this.props.fromPanel ? this.props.fromPanel : false}
					id={this.props.id ? this.props.id : false}
					showNotification={this.props.showNotification}
					geniee={true}
					isInsertMode={isInsertMode}
					primaryAdSize={primaryAdSize}
				/>
			</div>
		);
	}
}

sectionOptions.propTypes = {
	updateMode: PropTypes.bool,
	ad: requiredIf(PropTypes.object, props => props.updateMode),
	partnerData: requiredIf(PropTypes.object, props => props.updateMode),
	updateSettings: requiredIf(PropTypes.func, props => props.updateMode),
	// onCreateAd: requiredIf(PropTypes.func, props => !props.updateMode),
	onCancel: requiredIf(PropTypes.func, props => !props.updateMode),
	sectionId: PropTypes.string
};

export default sectionOptions;
