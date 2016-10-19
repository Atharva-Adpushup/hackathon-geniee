import React, { PropTypes } from 'react';
import Utils from 'libs/utils.js';
import Variation from './variation.jsx';
import VariationAdder from './variationAdder.jsx';

const getLastVariationNumber = function (variations) {
	const names = variations.map(({ name }) => {
		return name.indexOf('Variation') === -1 ? 0 : parseInt(Utils.stringReverse(name), 10);
	});
	return names.length ? names.sort().reverse()[0] : 0;
};

class variationManager extends React.Component {
	constructor(props) {
		super(props);
		this.createVariation = this.createVariation.bind(this);
		this.deleteVariation = this.deleteVariation.bind(this);
		this.copyVariation = this.copyVariation.bind(this);
	}

	createVariation() {
		this.props.createVariation({
			name: `Variation ${getLastVariationNumber(this.props.variations) + 1}`
		}, this.props.activeChannelId);
	}

	deleteVariation(varaitionId) {
		if (this.props.variations.length > 1) {
			this.props.deleteVariation(varaitionId);
			return;
		}
		alert('Can\'t delete varaiation.');
	}

	copyVariation(variation) {
		this.props.copyVariation(variation, `Variation ${getLastVariationNumber(this.props.variations) + 1}`, this.props.activeChannelId);
	}

	render() {
		const props = this.props;	
		if (!props.activeChannelId) {
			return null;
		}
		return (
			<div id="variationManager" className="variation-bar">
				{
					props.variations.map((variation) => (
						<Variation key={variation.id}
							variation={variation}
							active={variation.id === props.activeVariation.id}
							onClick={props.setActiveVariation.bind(null, variation.id)}
							onDoubleClick={this.deleteVariation}
							onCopy={this.copyVariation}
							onRename={props.renameVariation.bind(null, variation.id)}
      />
					))
				}
				<VariationAdder onNewVariation={this.createVariation} />
			</div>
		);
	}
}


variationManager.propTypes = {
	variations: PropTypes.array,
	activeVariation: PropTypes.object,
	activeChannelId: PropTypes.string,
	createVariation: PropTypes.func,
	deleteVariation: PropTypes.func,
	copyVariation: PropTypes.func,
	renameVariation: PropTypes.func,
	setActiveVariation: PropTypes.func
};

export default variationManager;

