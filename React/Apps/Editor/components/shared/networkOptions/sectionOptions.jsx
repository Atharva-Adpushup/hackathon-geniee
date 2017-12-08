import React, { PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import SelectBox from 'shared/select/select.js';
import CustomToggleSwitch from 'components/shared/customToggleSwitch.jsx';
import LabelWithButton from 'components/shared/labelWithButton.jsx';
import CodeBox from 'shared/codeBox';
import requiredIf from 'react-required-if';
import InlineEdit from 'shared/inlineEdit/index.jsx';
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
		if (!this.state.position) {
			this.props.showNotification({
				mode: 'error',
				title: 'Incomplete Values',
				message: 'Please select a position'
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

	renderCustomZoneIdInput(zoneId) {
		return (
			<Row className="mT-10">
				<Col xs={6} className={this.props.fromPanel ? 'u-padding-r10px' : ''}>
					<strong>Geniee Zone Id</strong>
				</Col>
				<Col xs={6} className={this.props.fromPanel ? 'u-padding-l10px' : ''}>
					<input
						type="text"
						placeholder="Enter Geniee Zone Id"
						className="inputBasic mB-10"
						value={zoneId}
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
			{ updateMode, updateSettings, sectionId, ad } = this.props,
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
				{/* <Row>
					<Col md={3} className={this.props.fromPanel ? 'u-padding-r10px' : ''}>
						<b>Position</b>
					</Col>
					<Col md={9} className={this.props.fromPanel ? 'u-padding-l10px' : ''}>
						<SelectBox value={this.state.position} label="Select Position" onChange={this.onChange}>
							{positions.map((pos, index) => (
								<option key={index} value={index}>
									{pos}
								</option>
							))}
						</SelectBox>
					</Col>
				</Row> */}
				{/* <CustomToggleSwitch
					labelText="First fold"
					className="u-margin-t15px u-margin-b15px"
					defaultLayout
					checked={this.state.isAdInFirstFold}
					name="adInFirstFold"
					onChange={this.onFirstFoldChange}
					layout="horizontal"
					size="m"
					id="js-ad-in-first-fold"
					on="Yes"
					off="No"
					defaultLayout={this.props.fromPanel ? false : true}
					name={this.props.id ? `firstFold-${this.props.id}` : 'firstFold'}
					id={this.props.id ? `js-first-fold-switch-${this.props.id}` : 'js-first-fold-switch'}
					customComponentClass={this.props.fromPanel ? 'u-padding-0px' : ''}
				/>
				<CustomToggleSwitch
					labelText="Async tag"
					className="u-margin-t15px u-margin-b15px"
					disabled
					defaultLayout
					checked={this.state.isAdAsync}
					name="adIsAsync"
					layout="horizontal"
					size="m"
					id="js-ad-is-async"
					on="Yes"
					off="No"
					defaultLayout={this.props.fromPanel ? false : true}
					name={this.props.id ? `asyncTag-${this.props.id}` : 'asyncTag'}
					id={this.props.id ? `js-async-tag-switch-${this.props.id}` : 'js-async-tag-switch'}
					customComponentClass={this.props.fromPanel ? 'u-padding-0px' : ''}
				/> */}
				{updateMode && !zoneId ? null : this.renderCustomZoneIdInput(zoneId)}

				<AdpTags
					fpKey={this.props.fpKey}
					priceFloor={this.props.priceFloor}
					headerBidding={this.props.headerBidding}
					submitHandler={this.submitHandler}
					onCancel={this.props.onCancel}
					code={this.props.code}
					buttonType={this.props.buttonType || 1}
					fromPanel={this.props.fromPanel ? this.props.fromPanel : false}
					id={this.props.id ? this.props.id : false}
					showNotification={this.props.showNotification}
					geniee={true}
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
