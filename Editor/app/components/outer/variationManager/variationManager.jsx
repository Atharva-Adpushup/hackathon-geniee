import React, { PropTypes } from 'react';
import Utils from 'libs/utils.js';
import Variation from './variation.jsx';
import VariationPanel from './variationPanel';
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
		this.state = {
			panelVariation: null
		};
		this.createVariation = this.createVariation.bind(this);
		this.setPanelVariation = this.setPanelVariation.bind(this);
		this.setActiveVariation = this.setActiveVariation.bind(this);
	}


	setPanelVariation(variation) {
		if (variation !== this.state.panelVariation) {
			this.setState({ panelVariation: variation });
		} else {
			this.setState({ panelVariation: null });
		}
	}

	setActiveVariation(variationId) {
		this.setState({ panelVariation: null });
		this.props.setActiveVariation(variationId);
	}

	createVariation() {
		this.setState({ panelVariation: null });
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
		const props = this.props,
			  style = { color: '#555', fontSize: '1.2em', width: '50%', margin: '40px auto', textAlign: 'center' };
		if (!props.activeChannelId) {
			return null;
		}
		return (
			<div>
				{this.state.panelVariation &&
					(<VariationPanel variation={this.state.panelVariation} />)
				}
				<div id="variationManager" className="variation-bar">
					{
						props.variations.map((variation) => (
							<Variation key={variation.id}
								variation={variation}
								active={variation.id === props.activeVariation.id}
								onClick={this.setActiveVariation}
								onSetPanelVariation={this.setPanelVariation}
       />
						))
					}
					<VariationAdder onNewVariation={this.createVariation} />
				</div>
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

