import React, { PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import SelectBox from '../select/select';
import CodeBox from '../codeBox';
import requiredIf from 'react-required-if';
import AdpTags from './AdpTags.jsx';

const positions = ['Unknown', 'Header', 'Under the article/column', 'Sidebar', 'Footer'];

function getUniqArrayItems(item, index, origArray) {
	return origArray.indexOf(item) == index;
}

class sectionOptions extends React.Component {
	constructor(props) {
		super(props);
		// Bind all methods 'this' so that 'this' keyword inside
		// them correctly points to class instance object while execution
		this.onChange = this.onChange.bind(this);
		this.onFirstFoldChange = this.onFirstFoldChange.bind(this);
		this.toggleCustomAdCode = this.toggleCustomAdCode.bind(this);
		this.onCustomAdCodeChange = this.onCustomAdCodeChange.bind(this);
		this.renderCustomZoneIdInput = this.renderCustomZoneIdInput.bind(this);
		this.renderZoneIdSelectBox = this.renderZoneIdSelectBox.bind(this);
		this.submitHandler = this.submitHandler.bind(this);
		this.handleZoneIdChange = this.handleZoneIdChange.bind(this);

		// Set initial state
		const isZonesData = !!(props.zonesData && props.zonesData.length);
		this.state = {
			position: props.position,
			isAdInFirstFold: props.firstFold,
			isAdAsync: true,
			manageCustomCode: false,
			customAdCode: props.customAdCode,
			zoneId: props.zoneId,
			selectedZoneId: '',
			zoneIdUniqArray: isZonesData
				? props.zonesData.map(object => Number(object.zoneId)).filter(getUniqArrayItems)
				: [],
			dfpAdUnitUniqArray: isZonesData
				? props.zonesData.map(object => object.dfpAdunit).filter(getUniqArrayItems)
				: []
		};
		const isValidZoneIdArray = !!(
				this.state.zoneIdUniqArray &&
				this.state.zoneIdUniqArray.length &&
				this.state.zoneIdUniqArray[0]
			),
			isValidDFPAdUnitArray = !!(
				this.state.dfpAdUnitUniqArray &&
				this.state.dfpAdUnitUniqArray.length &&
				this.state.dfpAdUnitUniqArray[0]
			);

		if (!isValidZoneIdArray) {
			this.state.zoneIdUniqArray = [];
		}

		if (!isValidDFPAdUnitArray) {
			this.state.dfpAdUnitUniqArray = [];
		}
	}

	handleZoneIdChange(selectedZoneId) {
		const value = selectedZoneId || '';
		this.setState({ selectedZoneId: value, zoneId: value });
	}

	submitHandler(networkData) {
		const state = this.state,
			props = this.props;

		if (!state.zoneId) {
			props.showNotification({
				mode: 'error',
				title: 'Incomplete Values',
				message: 'Custom Zone is a required field'
			});
			return;
		}

		const isZoneIdReused = !!state.selectedZoneId,
			isDFPAdUnitIdReused = !!(networkData && networkData.dfpAdunitId),
			shouldCreateZoneContainerId = isZoneIdReused || isDFPAdUnitIdReused;
		let dfpAdUnitData = isDFPAdUnitIdReused
				? props.zonesData.filter(object => object.dfpAdunit == networkData.dfpAdunitId)[0]
				: {},
			isValidDFPAdUnitData = !!(dfpAdUnitData && Object.keys(dfpAdUnitData).length);

		shouldCreateZoneContainerId ? (networkData.createZoneContainerId = true) : null;
		isValidDFPAdUnitData ? delete dfpAdUnitData.zoneId : null;
		delete networkData.dfpAdunitId;
		networkData = {
			...networkData,
			...dfpAdUnitData
		};

		let toSend = {
			...networkData,
			dynamicAllocation: networkData.headerBidding,
			position: state.position,
			adCode: state.customAdCode,
			firstFold: state.isAdInFirstFold,
			asyncTag: state.isAdAsync,
			zoneId: state.zoneId
		};
		delete toSend.headerBidding;
		props.submitHandler(toSend);
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
		const isDisabledMode = !!((zoneId && !isInsertMode) || this.state.selectedZoneId);

		return (
			<Row className="mT-5">
				<Col xs={6} className={this.props.fromPanel ? 'u-padding-r10px' : ''}>
					<strong>Enter new Zone Id</strong>
				</Col>
				<Col xs={6} className={this.props.fromPanel ? 'u-padding-l10px' : ''}>
					<input
						type="number"
						placeholder="Enter a value"
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

	renderZoneIdSelectBox() {
		const uniqCollection = this.state.zoneIdUniqArray;

		return (
			<Row className="mT-10">
				<Col xs={12} className={this.props.fromPanel ? 'u-padding-0px mB-10' : 'mB-10'}>
					<SelectBox
						value={this.state.selectedZoneId}
						label="Select a Zone Id"
						onChange={this.handleZoneIdChange}
					>
						{uniqCollection.map((value, index) => {
							return (
								<option key={index} value={value}>
									{value}
								</option>
							);
						})}
					</SelectBox>
				</Col>
			</Row>
		);
	}

	render() {
		const state = this.state,
			customAdCodeText = state.customAdCode ? 'Edit' : 'Add',
			isAdCreateBtnDisabled = !!(state.position !== null && typeof state.position !== 'undefined'),
			{ updateMode, updateSettings, sectionId, ad, isInsertMode, primaryAdSize } = this.props,
			{
				position,
				isAdInFirstFold: firstFold,
				isAdAsync: asyncTag,
				zoneId,
				dfpAdUnitUniqArray,
				zoneIdUniqArray
			} = state,
			isRenderZoneIdSelectBox = !!(isInsertMode && zoneIdUniqArray && zoneIdUniqArray.length);

		if (state.manageCustomCode) {
			return (
				<CodeBox
					showButtons
					code={state.customAdCode}
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
				{isRenderZoneIdSelectBox ? this.renderZoneIdSelectBox() : null}
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
					dfpAdUnitUniqArray={dfpAdUnitUniqArray}
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
