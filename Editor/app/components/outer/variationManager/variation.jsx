import React, { PropTypes } from 'react';
import ReactDOM from 'react-dom';
import $ from 'jquery';

class Variation extends React.Component {
	constructor() {
		super();
	}

	showVariationSettings() {
		$('.variation-settings').toggleClass('variation-settings-active');
	}

	render({ variation, onClick, onCopy, active } = this.props) {
		return (<div onClick={active ? this.showVariationSettings : onClick} className={active ? 'variation-block active-variation' : 'variation-block'}>{variation.name} {active ? <span className="variation-settings-icon"><i className="fa fa-caret-up"></i></span> : ''}</div>);
	}
}

Variation.propTypes = {
	variation: PropTypes.object.isRequired,
	onClick: PropTypes.func.isRequired,
	onDoubleClick: PropTypes.func.isRequired
};

export default Variation;

