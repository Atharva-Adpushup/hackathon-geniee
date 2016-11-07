import React, { PropTypes } from 'react';
import Glass from 'shared/glass';
import Variation from './variation.jsx';
import VariationPanel from './panel/variationPanel';
import VariationAdder from './variationAdder.jsx';

class variationManager extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isPanelActive: false
		};
		this.toggleVariationPanel = this.toggleVariationPanel.bind(this);
	}


	componentWillReceiveProps(nextProps) {
		if ((this.props.variations.length !== nextProps.variations.length) || (!this.props.activeVariation || !nextProps.activeVariation || (this.props.activeVariation.id !== nextProps.activeVariation.id))) {
			this.setState({ isPanelActive: false });
		}
	}

	toggleVariationPanel() {
		this.setState({ isPanelActive: !this.state.isPanelActive });
	}

	render() {
		const props = this.props;
		if (!props.activeChannelId) {
			return null;
		}
		return (
			<div>
				{this.state.isPanelActive &&
					(<div><Glass clickHandler={this.toggleVariationPanel} shim /> <VariationPanel channelId={this.props.activeChannelId} variation={this.props.activeVariation} sections={this.props.activeVariationSections} /></div>)
				}
				<div id="variationManager" className="variation-bar">
					{
						props.variations.map((variation) => (
							<Variation key={variation.id}
								variation={variation}
								active={variation.id === props.activeVariation.id}
								onClick={props.setActiveVariation}
								toggleVariationPanel={this.toggleVariationPanel}
       />
						))
					}
					<VariationAdder onNewVariation={props.createVariation.bind(null, props.activeChannelId)} />
				</div>
			</div>
		);
	}
}


variationManager.propTypes = {
	variations: PropTypes.array,
	activeVariation: PropTypes.object,
	activeChannelId: PropTypes.string,
	activeVariationSections: PropTypes.array,
	createVariation: PropTypes.func,
	deleteVariation: PropTypes.func,
	copyVariation: PropTypes.func,
	renameVariation: PropTypes.func,
	setActiveVariation: PropTypes.func
};

export default variationManager;

