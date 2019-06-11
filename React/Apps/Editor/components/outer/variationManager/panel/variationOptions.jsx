import React, { PropTypes } from 'react';
import { Row, Col, Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
	deleteVariation,
	copyVariation,
	editVariationName,
	editTrafficDistribution,
	disableVariation,
	tagcontrolVariation,
	updateInContentTreeSelectorsLevel,
	updateInContentSectionBracket
} from 'actions/variationActions.js';
import InlineEdit from '../../../shared/inlineEdit/index.jsx';
import CustomToggleSwitch from '../../../shared/customToggleSwitch.jsx';
import SelectBox from '../../../shared/select/select';
import { incontentSectionSettings } from '../../../../consts/commonConsts';

const variationOtions = props => {
	const {
			onDeleteVariation,
			onCopyVariation,
			onEditVariationName,
			variation,
			channelId,
			incontentSections,
			incontentSectionsConfig,
			platform,
			disabledVariationsCount,
			controlVariationsCount,
			onDisableVariation,
			onTagcontrolVariation,
			onEditTrafficDistribution,
			onUpdateContentSelector,
			onInitIncontentAdsPreview,
			onUpdateInContentTreeSelectorsLevel,
			onUpdateInContentSectionBracket
		} = props,
		variationId = variation.id,
		hasDisabledVariationsReachedLimit = !!(
			disabledVariationsCount &&
			disabledVariationsCount >= 10 &&
			!variation.disable
		),
		// 'isDifferentControlVariation' variable checks whether a different baseline/control variation exists in same page group
		isDifferentControlVariation = !!controlVariationsCount,
		isControlVariation = variation.isControl || false,
		shouldDeleteButtonBeDisabled = !!isControlVariation,
		contentSelector = variation.contentSelector,
		computedToggleSwitchValue = hasDisabledVariationsReachedLimit ? false : !!variation.disable,
		incontentSelectorsTreeLevelValue = variation.selectorsTreeLevel || '',
		incontentDefaultSectionBracketValue = incontentSectionSettings.SECTION_BRACKETS[platform.toUpperCase()],
		incontentSectionBracketValue = variation.incontentSectionBracket || incontentDefaultSectionBracketValue,
		shouldIncontentAnalyzerPreviewBeShown = !!(
			contentSelector &&
			incontentSections &&
			incontentSections.length &&
			incontentSectionsConfig &&
			Object.keys(incontentSectionsConfig).length
		);

	function copyVariationConfirmation(fn, variationId, channelId) {
		let confirm = window.confirm('Are you sure you want to copy this variation?');
		confirm ? fn(variationId, channelId) : null;
	}

	return (
		<div>
			<h1 className="variation-section-heading">Variation Info</h1>
			<Row>
				<Col className="u-padding-r10px" xs={2}>
					Variation Name
				</Col>
				<Col className="u-padding-l10px" xs={4}>
					<InlineEdit
						validate
						value={variation.name}
						submitHandler={onEditVariationName.bind(null, variationId, channelId)}
						text="Variation Name"
						errorMessage="Variation Name cannot be blank"
					/>
				</Col>
			</Row>
			<Row>
				<Col className="u-padding-r10px" xs={2}>
					Sections
				</Col>
				<Col className="u-padding-l10px" xs={4}>
					<strong>{props.variation.sections.length}</strong>
				</Col>
			</Row>

			{/*Incontent content selector UI*/}
			<Row>
				<Col className="u-padding-r10px" xs={2}>
					Content Selector
				</Col>
				<Col className="u-padding-l10px" xs={4}>
					<InlineEdit
						validate
						value={variation.contentSelector}
						submitHandler={onUpdateContentSelector.bind(null, variationId, channelId)}
						text="Content selector"
						errorMessage="Content selector cannot be blank"
					/>
				</Col>
			</Row>

			{/*IncontentAnalyzer - children tree level UI*/}
			{contentSelector ? (
				<Row className="u-margin-b15px">
					<Col className="u-padding-r10px" xs={2}>
						Children Tree Level
						<OverlayTrigger
							placement="top"
							overlay={
								<Tooltip id="incontent-children-tree-level-info-tooltip">
									Select the children (selectors) tree level number upto which IncontentAnalyzer
									library will choose valid HTML selectors to place sections/ads. This is a variation
									level setting that will be applicable on all sections.
								</Tooltip>
							}
						>
							<span className="variation-settings-icon">
								<i className="fa fa-info" />
							</span>
						</OverlayTrigger>
					</Col>
					<Col className="u-padding-l10px" xs={2}>
						<SelectBox
							value={incontentSelectorsTreeLevelValue}
							label="Select a value"
							onChange={selectorsTreeLevel => {
								selectorsTreeLevel = selectorsTreeLevel || '';
								console.log(`Incontent selectors tree level value: ${selectorsTreeLevel}`);
								onUpdateInContentTreeSelectorsLevel(variationId, selectorsTreeLevel);
							}}
						>
							{incontentSectionSettings.SELECTORS_TREE_LEVEL.map((item, index) => (
								<option key={index} value={item}>
									{item}
								</option>
							))}
						</SelectBox>
					</Col>
				</Row>
			) : null}

			{/*IncontentAnalyzer - section bracket UI*/}
			{contentSelector ? (
				<Row className="u-margin-b15px">
					<Col className="u-padding-r10px" xs={2}>
						Incontent section Bracket
						<OverlayTrigger
							placement="top"
							overlay={
								<Tooltip id="incontent-section-bracket-info-tooltip">
									Enter the incontent section bracket number that IncontentAnalyzer library will use
									to place sections/ads. A non-zero value will override default values for different
									platforms (DESKTOP: 600, MOBILE: 450). This is a variation level setting that will
									be applicable on all sections.
								</Tooltip>
							}
						>
							<span className="variation-settings-icon">
								<i className="fa fa-info" />
							</span>
						</OverlayTrigger>
					</Col>
					<Col className="u-padding-l10px" xs={4}>
						<InlineEdit
							type="number"
							validate
							value={incontentSectionBracketValue}
							submitHandler={onUpdateInContentSectionBracket.bind(null, variationId)}
							text="Section bracket"
							errorMessage="Section bracket cannot be empty"
						/>
					</Col>
				</Row>
			) : null}

			{/*IncontentAnalyzer - show preview UI*/}
			{shouldIncontentAnalyzerPreviewBeShown ? (
				<Row>
					<Col className="u-padding-r10px" xs={2}>
						Show Incontent Ads Preview
						<OverlayTrigger
							placement="top"
							overlay={
								<Tooltip id="incontent-ads-preview-info-tooltip">
									Click adjacent button to show IncontentAnalyzer ads placement preview. This preview
									tries to simulate how incontent ads will appear inside selected container based on
									your setup. Please ensure that your incontent ads setup is complete before you run
									this preview.
								</Tooltip>
							}
						>
							<span className="variation-settings-icon">
								<i className="fa fa-info" />
							</span>
						</OverlayTrigger>
					</Col>
					<Col className="u-padding-l10px" xs={4}>
						<Button
							className="btn-lightBg"
							onClick={onInitIncontentAdsPreview.bind(
								null,
								channelId,
								contentSelector,
								incontentSections,
								incontentSectionsConfig
							)}
							type="submit"
						>
							Run Preview
						</Button>
					</Col>
				</Row>
			) : null}

			{/*Control Variation Tag UI*/}
			{!isDifferentControlVariation ? (
				<Row>
					<Col className="u-padding-r10px" xs={2}>
						Set as Baseline Variation
						<OverlayTrigger
							placement="top"
							overlay={
								<Tooltip id="control-variation-tag-info-tooltip">
									Only one variation can be tagged as <b>Baseline Variation</b> per page group. The
									existing tagged variation must be deleted in order to baseline tag a different
									variation in same page group.
								</Tooltip>
							}
						>
							<span className="variation-settings-icon">
								<i className="fa fa-info" />
							</span>
						</OverlayTrigger>
					</Col>
					<Col className="u-padding-l10px" xs={4}>
						<CustomToggleSwitch
							labelText=""
							className="mB-10"
							checked={isControlVariation}
							disabled={false}
							onChange={val => {
								onTagcontrolVariation(variationId, channelId, { isControl: val });
							}}
							layout="nolabel"
							size="m"
							on="Yes"
							off="No"
							defaultLayout={true}
							name={'controlVariationTag'}
							id={'js-control-variation-tag-switch'}
							customComponentClass={'u-padding-0px'}
						/>
					</Col>
				</Row>
			) : null}

			{/*Disable Variation UI*/}
			<Row>
				<Col className="u-padding-r10px" xs={2}>
					Disable this variation
					<OverlayTrigger
						placement="top"
						overlay={
							<Tooltip id="disable-variation-info-tooltip">
								Once variation is disabled, its configuration (section, ads, url pattern, traffic
								distribution etc.) will not be pushed to production script. You can only create upto 10
								disabled variations. Traffic distribution value will be set to 0.
							</Tooltip>
						}
					>
						<span className="variation-settings-icon">
							<i className="fa fa-info" />
						</span>
					</OverlayTrigger>
				</Col>
				<Col className="u-padding-l10px" xs={4}>
					<CustomToggleSwitch
						labelText=""
						className="mB-10"
						checked={computedToggleSwitchValue}
						disabled={hasDisabledVariationsReachedLimit}
						onChange={val => {
							val ? onEditTrafficDistribution(variationId, 0) : '';
							onDisableVariation(variationId, channelId, { isDisable: val });
						}}
						layout="nolabel"
						size="m"
						on="Yes"
						off="No"
						defaultLayout={true}
						name={'disableVariation'}
						id={'js-disable-variation-switch'}
						customComponentClass={'u-padding-0px'}
					/>
					{hasDisabledVariationsReachedLimit ? (
						<div className="error-message mT-10">
							Toggle Switch is disabled as 10 disabled variations already exist. Please enable one of them
							to disable this variation.
						</div>
					) : null}
				</Col>
			</Row>

			<br />
			<br />
			<Row>
				<Col className="u-padding-r10px" xs={2}>
					<Button
						className="btn-lightBg btn-copy btn-block"
						onClick={copyVariationConfirmation.bind(null, onCopyVariation, variationId, channelId)}
						type="submit"
					>
						Copy Variation
					</Button>
				</Col>
				<Col className="u-padding-l10px" xs={2}>
					<Button
						className="btn-lightBg btn-del-line btn-block"
						onClick={onDeleteVariation.bind(null, variationId, channelId)}
						type="submit"
						disabled={shouldDeleteButtonBeDisabled}
					>
						Delete Variation
					</Button>
				</Col>
			</Row>
		</div>
	);
};

variationOtions.propTypes = {
	variation: PropTypes.object.isRequired,
	channelId: PropTypes.string.isRequired,
	disabledVariationsCount: PropTypes.num,
	controlVariationsCount: PropTypes.num,
	incontentSections: PropTypes.array,
	incontentSectionsConfig: PropTypes.object,
	platform: PropTypes.string.isRequired,
	onCopyVariation: PropTypes.func.isRequired,
	onDeleteVariation: PropTypes.func.isRequired,
	onEditVariationName: PropTypes.func.isRequired,
	onEditTrafficDistribution: PropTypes.func.isRequired,
	onUpdateInContentTreeSelectorsLevel: PropTypes.func.isRequired,
	onUpdateContentSelector: PropTypes.func.isRequired,
	onInitIncontentAdsPreview: PropTypes.func,
	onUpdateInContentSectionBracket: PropTypes.func,
	onDisableVariation: PropTypes.func,
	onTagcontrolVariation: PropTypes.func
};

export default connect(
	(state, ownProps) => ({ ...ownProps }),
	dispatch =>
		bindActionCreators(
			{
				onCopyVariation: copyVariation,
				onDeleteVariation: deleteVariation,
				onEditVariationName: editVariationName,
				onEditTrafficDistribution: editTrafficDistribution,
				onDisableVariation: disableVariation,
				onTagcontrolVariation: tagcontrolVariation,
				onUpdateInContentTreeSelectorsLevel: updateInContentTreeSelectorsLevel,
				onUpdateInContentSectionBracket: updateInContentSectionBracket
			},
			dispatch
		)
)(variationOtions);
