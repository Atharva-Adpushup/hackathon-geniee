import React, { PropTypes } from 'react';
import _ from 'lodash';
import Section from './section.jsx';

class variationManager extends React.Component {
	render() {
		const props = this.props,
			style = { display: 'none' },
			// Keep only those sections which have ads in them
			sections = _.filter(props.sections, (section) => section.ads.length);

		if (!props.id) {
			return null;
		}
		return (
			<div id="variationManager" style={style}>
				{
					sections.map((section) => <Section key={section.id}
						id={section.id}
						xpath={section.xpath}
						ads={section.ads}
						operation={section.operation}
						onXpathMiss={this.props.onXpathMiss}
						onAdClick={this.props.onAdClick}
     />
					)
				}
			</div>
		);
	}
}


variationManager.propTypes = {
	sections: PropTypes.array,
	id: PropTypes.string,
	onXpathMiss: PropTypes.func,
	onAdClick: PropTypes.func
};

export default variationManager;
