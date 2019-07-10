import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import PropTypes from 'prop-types';

const keys = {
		c1xSiteId: 'c1xSiteId'
	},
	setStateUsingKeys = () => {
		let obj = {};
		for (let key in keys) {
			obj[key] = '';
		}
		return obj;
	};

class AdditionalOptions extends Component {
	constructor(props) {
		super(props);

		this.state = setStateUsingKeys();
		this.addAdditionalOption = this.addAdditionalOption.bind(this);
	}

	addAdditionalOption(e) {
		const el = e.target,
			key = el.getAttribute('data-key'),
			value = el.value;

		this.setState({ [key]: value }, () => {
			this.props.additionalOptionsCallback(this.state);
		});
	}

	render() {
		const { props } = this,
			c1xSiteId =
				props.additionalOptions && props.additionalOptions[keys.c1xSiteId]
					? props.additionalOptions[keys.c1xSiteId]
					: '';

		return (
			<div className="hb-additional-options mT-20 mb-20">
				<h4>Additional Options</h4>
				<Row>
					<Col sm={1} style={{ paddingRight: 0 }}>
						<div className="input-name">C1X Site Id</div>
					</Col>
					<Col sm={3}>
						<input
							type="text"
							placeholder="Enter C1X Site Id"
							value={c1xSiteId}
							data-key={keys.c1xSiteId}
							onChange={this.addAdditionalOption}
						/>
					</Col>
				</Row>
			</div>
		);
	}
}

AdditionalOptions.proptypes = {
	additionalOptions: PropTypes.object.isRequired,
	additionalOptionsCallback: PropTypes.func.isRequired
};

export default AdditionalOptions;
