import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import _ from 'lodash';
import Glass from 'shared/glass';
import Variation from './variation.jsx';
import VariationPanel from './panel/variationPanel';
import VariationAdder from './variationAdder.jsx';

const variationManager = props => {
	if (!props.activeChannelId) {
		return null;
	}

	const disabledVariations = _.compact(
		_.map(props.variations, variationObj => {
			return !!variationObj.disable;
		})
	),
		controlVariations = _.compact(
			_.map(props.variations, variationObj => {
				const activeVariationId = props.activeVariation.id,
					isSameVariation = !!(activeVariationId === variationObj.id);

				if (isSameVariation) {
					return false;
				}

				return !!variationObj.isControl;
			})
		),
		disabledVariationsCount = disabledVariations.length,
		controlVariationsCount = controlVariations.length;

	return (
		<div>
			{props.ui.variationPanel.open &&
				<div>
					<Glass clickHandler={props.closeVariationPanel} shim />{' '}
					<VariationPanel
						ui={props.ui}
						activeChannel={props.activeChannel}
						channelId={props.activeChannelId}
						variation={props.activeVariation}
						zonesData={props.zonesData}
						sections={props.activeVariationSections}
						reporting={props.reporting}
						onUpdateContentSelector={props.updateContentSelector}
						updateAdCode={props.updateAdCode}
						updateNetwork={props.updateNetwork}
						disabledVariationsCount={disabledVariationsCount}
						controlVariationsCount={controlVariationsCount}
						networkConfig={props.networkConfig}
					/>
				</div>}

			<div id="variationManager" className="variation-bar">
				{props.variations.map(variation => (
					<Variation
						key={variation.id}
						variation={variation}
						active={variation.id === props.activeVariation.id}
						onClick={props.setActiveVariation}
						toggleVariationPanel={
							props.ui.variationPanel.open ? props.closeVariationPanel : props.openVariationPanel
						}
					/>
				))}
				<VariationAdder onNewVariation={props.createVariation.bind(null, props.activeChannelId)} />
			</div>
		</div>
	);
};

variationManager.propTypes = {
	variations: PropTypes.array,
	activeVariation: PropTypes.object,
	activeChannelId: PropTypes.string,
	activeVariationSections: PropTypes.array,
	createVariation: PropTypes.func,
	deleteVariation: PropTypes.func,
	copyVariation: PropTypes.func,
	renameVariation: PropTypes.func,
	setActiveVariation: PropTypes.func,
	openVariationPanel: PropTypes.func,
	closeVariationPanel: PropTypes.func,
	updateContentSelector: PropTypes.func,
	updateAdCode: PropTypes.func,
	updateNetwork: PropTypes.func,
	ui: PropTypes.object,
	reporting: PropTypes.object
};

export default variationManager;
