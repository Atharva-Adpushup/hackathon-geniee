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

		// if (!this.props.updateMode) {
		// 	this.state = {
		// 		position: undefined,
		// 		isAdInFirstFold: props.firstFold || false,
		// 		isAdAsync: true,
		// 		manageCustomCode: false,
		// 		customAdCode: '',
		// 		zoneId: props.zoneId || ''
		// 	};
		// } else {
		// 	this.state = {
		// 		position: this.props.partnerData.position,
		// 		isAdInFirstFold: this.props.partnerData.firstFold,
		// 		isAdAsync: this.props.partnerData.asyncTag,
		// 		zoneId: this.props.partnerData.zoneId
		// 	};
		// }
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

	renderCustomZoneIdInput(zoneId) {
		return (
			<InlineEdit
				rootClassNames="u-margin-b15px"
				type="number"
				validate
				font={400}
				value={zoneId}
				submitHandler={this.onCustomZoneIdSubmit}
				text="Custom Zone Id"
				errorMessage="Custom zone id cannot be blank"
			/>
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
				<Row>
					<Col md={3}>
						<b>Position</b>
					</Col>
					<Col md={9}>
						<SelectBox value={this.state.position} label="Select Position" onChange={this.onChange}>
							{positions.map((pos, index) => (
								<option key={index} value={index}>
									{pos}
								</option>
							))}
						</SelectBox>
					</Col>
				</Row>
				<CustomToggleSwitch
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
				/>
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

				{/* {updateMode ? (
					<Button
						style={{ marginBottom: 20 }}
						disabled={!isAdCreateBtnDisabled}
						className="btn-lightBg btn-save btn-block"
						onClick={updateSettings.bind(null, sectionId, ad.id, {
							position,
							firstFold,
							asyncTag,
							zoneId
						})}
					>
						Update Settings
					</Button>
				) : (
					<div>
						<LabelWithButton
							name="customAdCode"
							className="u-margin-t15px u-margin-b15px"
							onButtonClick={this.toggleCustomAdCode}
							labelText="Custom Ad code"
							layout="horizontal"
							buttonText={customAdCodeText}
						/>
						<Row className="butttonsRow">
							<Col xs={5}>
								<Button className="btn-lightBg btn-cancel btn-block" onClick={this.props.onCancel}>
									Back
								</Button>
							</Col>
							<Col xs={7}>
								<Button
									disabled={!isAdCreateBtnDisabled}
									className="btn-lightBg btn-save btn-block"
									onClick={this.onSave}
								>
									Create Ad
								</Button>
							</Col>
						</Row>
					</div>
				)} */}
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
