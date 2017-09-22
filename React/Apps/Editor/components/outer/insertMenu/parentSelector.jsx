import React, { PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';

const platformSelector = ({ selectors, onHighlightElement, onSelectElement, channelId }) => {
	return (
		<div className="SelectParent">
			{selectors.map((selector, index) => (
				<Row
					key={index}
					onMouseOut={onHighlightElement.bind(null, selectors[0].xpath, channelId)}
					onMouseOver={onHighlightElement.bind(null, selector.xpath, channelId)}
					onClick={onSelectElement.bind(null, selector.xpath, channelId)}
				>
					<Col md={3}>
						<b>{selector.tagName}</b>
					</Col>
					{index === 0 ? (
						<Col md={9}>
							<b>{selector.xpath}</b>
						</Col>
					) : (
						<Col md={9}>{selector.xpath}</Col>
					)}
				</Row>
			))}
		</div>
	);
};

platformSelector.propTypes = {
	selectors: PropTypes.array.isRequired,
	channelId: PropTypes.string.isRequired,
	onHighlightElement: React.PropTypes.func.isRequired,
	onSelectElement: React.PropTypes.func.isRequired
};

export default platformSelector;
