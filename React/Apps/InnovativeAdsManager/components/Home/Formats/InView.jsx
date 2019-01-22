import React, { Component } from 'react';
import { Col } from 'react-bootstrap';
import { TYPE_OF_ADS } from '../../../configs/commonConsts';

class InView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			xpath: this.props.ad && this.props.ad.formatData ? this.props.ad.formatData.xpath : ''
		};
		this.handleChange = this.handleChange.bind(this);
		this.saveHandler = this.saveHandler.bind(this);
	}

	handleChange(e) {
		this.setState({
			[e.target.name]: e.target.value
		});
	}

	saveHandler(e) {
		e.preventDefault();
		const { xpath } = this.state;
		if (!xpath) {
			return alert('Xpath is mandatory field');
		}
		return this.props.save.handler({
			formatData: {
				event: 'scroll',
				eventData: {
					value: xpath
				}
			},
			type: TYPE_OF_ADS.INTERACTIVE_AD
		});
	}

	render() {
		return (
			<form action="#" method="POST">
				<Col md={12} style={{ paddingLeft: '0px', marginBottom: '20px' }}>
					<label htmlFor="xpath">Enter Xpath*</label>
					<input
						className="inputMinimal"
						type="input"
						placeholder="Enter XPath"
						name="xpath"
						style={{ padding: '10px 15px' }}
						value={this.state.xpath}
						onChange={this.handleChange}
					/>
				</Col>
				{this.props.cancel.renderFn(this.props.cancel.label, this.handler)}
				{this.props.save.renderFn(this.props.save.label, this.saveHandler)}
			</form>
		);
	}
}

export default InView;
