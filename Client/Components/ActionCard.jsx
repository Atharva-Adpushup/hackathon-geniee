import React from 'react';
import PropTypes from 'prop-types';

class ActionCard extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const { props } = this;

		return (
			<div className="mb-30 row">
				<div className="controlAdpushupWrap">
					<h3 className="title m-All-0 clearfix">
						<a>{this.props.title}</a>
					</h3>
					{this.props.children}
				</div>
			</div>
		);
	}
}

ActionCard.propTypes = {
	title: PropTypes.string
};

ActionCard.defaultProps = {
	title: 'This is the default title'
};

export default ActionCard;
