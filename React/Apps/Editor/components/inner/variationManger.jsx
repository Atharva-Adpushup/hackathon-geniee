import React, { PropTypes } from 'react';
import _ from 'lodash';
import Section from './section.jsx';

class variationManager extends React.Component {
	render() {
		const props = this.props,
			style = { display: 'none' },
			// Keep only those sections which have ads in them
			sections = _.filter(props.sections, section => section.ads.length);

		if (!props.id) {
			return null;
		}
		return (
			<div id="variationManager" style={style}>
				{sections.map(section => (
					<Section
						key={section.id}
						variationId={props.id}
						id={section.id}
						sectionName={section.name}
						xpath={section.xpath}
						partnerData={section.partnerData ? section.partnerData : {}}
						ads={section.ads}
						operation={section.operation}
						mode={this.props.mode}
						onXpathMiss={this.props.onXpathMiss}
						onAdClick={this.props.onAdClick}
					/>
				))}
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
