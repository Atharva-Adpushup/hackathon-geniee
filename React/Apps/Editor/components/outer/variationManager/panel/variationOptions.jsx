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
	updateInContentTreeSelectorsLevel
} from 'actions/variationActions.js';
import InlineEdit from '../../../shared/inlineEdit/index.jsx';
import CustomToggleSwitch from '../../../shared/customToggleSwitch.jsx';
import SelectBox from '../../../shared/select/select';
import { incontentSections } from '../../../../consts/commonConsts';

const variationOtions = props => {
	const {
			onDeleteVariation,
			onCopyVariation,
			onEditVariationName,
			variation,
			channelId,
			disabledVariationsCount,
			onDisableVariation,
			onEditTrafficDistribution,
			onUpdateContentSelector,
			onUpdateInContentTreeSelectorsLevel
		} = props,
		variationId = variation.id,
		hasDisabledVariationsReachedLimit = !!(
			disabledVariationsCount &&
			disabledVariationsCount >= 10 &&
			!variation.disable
		),
		contentSelector = variation.contentSelector,
		computedToggleSwitchValue = hasDisabledVariationsReachedLimit ? false : !!variation.disable,
		incontentSelectorsTreeLevelValue = variation.selectorsTreeLevel || '';

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

			{contentSelector ? (
				<Row className="u-margin-b15px">
					<Col className="u-padding-r10px" xs={2}>
						Children Tree Level
						<OverlayTrigger
							placement="top"
							overlay={
								<Tooltip id="incontent-children-tree-level-info-tooltip">
									Select the children (selectors) tree level number upto which Incontent Sections
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
							{incontentSections.SELECTORS_TREE_LEVEL.map((item, index) => (
								<option key={index} value={item}>
									{item}
								</option>
							))}
						</SelectBox>
					</Col>
				</Row>
			) : null}

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
	onCopyVariation: PropTypes.func.isRequired,
	onDeleteVariation: PropTypes.func.isRequired,
	onEditVariationName: PropTypes.func.isRequired,
	onEditTrafficDistribution: PropTypes.func.isRequired,
	onUpdateInContentTreeSelectorsLevel: PropTypes.func.isRequired,
	onUpdateContentSelector: PropTypes.func.isRequired,
	onDisableVariation: PropTypes.func
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
				onUpdateInContentTreeSelectorsLevel: updateInContentTreeSelectorsLevel
			},
			dispatch
		)
)(variationOtions);
