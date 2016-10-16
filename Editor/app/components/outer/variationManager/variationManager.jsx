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
	}

	createVariation() {
		this.props.createVariation({
			name: `Variation ${getLastVariationNumber(this.props.variations) + 1}`
		}, this.props.activeChannelId);
	}

	render() {
		const props = this.props,
			style = { position: 'absolute', bottom: '0px', height: '30px', width: '100%', backgroundColor: 'grey' };
		if (!props.activeChannelId) {
			return null;
		}
		return (
			<div id="variationManager" style={style}>
				{
					props.variations.map((variation) => (
						<Variation key={variation.id}
							variation={variation}
							active={variation.id === props.activeVariation.id}
							onClick={props.setActiveVariation.bind(null, variation.id)}
							onDoubleClick={props.deleteVariation.bind(null, variation.id)}
							onCopy={props.copyVariation.bind(null, variation.id)}
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
