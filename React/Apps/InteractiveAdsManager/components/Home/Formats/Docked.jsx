import React, { Component } from 'react';
import { Col } from 'react-bootstrap';
import SelectBox from '../../../../../Components/SelectBox';
import { AD_OPERATIONS } from '../../../configs/commonConsts';

class Docked extends Component {
	constructor(props) {
		super(props);
		this.state = {
			xpath: '',
			bottomXpath: '',
			bottomOffset: '',
			css: '',
			operation: null
		};
		this.handleChange = this.handleChange.bind(this);
		this.operationChange = this.operationChange.bind(this);
		this.saveHandler = this.saveHandler.bind(this);
	}

	handleChange(e) {
		this.setState({
			[e.target.name]: e.target.value
		});
	}

	operationChange(value) {
		this.setState({ operation: value });
	}

	saveHandler(e) {
		e.preventDefault();
		const { xpath, bottomXpath, bottomOffset, operation } = this.state;
		if (!xpath || !operation) {
			return alert('Xpath and Ad Operation are mandatory fields');
		}
		return this.props.save.handler({
			xpath,
			bottomOffset,
			bottomXpath,
			operation
		});
	}

	render() {
		return (
			<form action="#" method="POST">
				<Col md={6} style={{ paddingLeft: '0px', marginBottom: '20px' }}>
					<label htmlFor="xpath">Enter Xpath*</label>
					<input
						className="inputMinimal"
						type="input"
						placeholder="Enter XPath"
						name="xpath"
						style={{ padding: '10px 15px' }}
						onChange={this.handleChange}
					/>
				</Col>
				<Col md={6} style={{ paddingLeft: '0px', marginBottom: '20px' }}>
					<label htmlFor="adOperation">Ad Operation*</label>
					<SelectBox value={this.state.operation} label="Ad Operation" onChange={this.operationChange}>
						{AD_OPERATIONS.map((operation, index) => (
							<option key={index} value={index}>
								{operation}
							</option>
						))}
					</SelectBox>
				</Col>
				<Col md={6} style={{ paddingLeft: '0px', marginBottom: '20px' }}>
					<label htmlFor="bottomXpath">Enter Bottom Xpath</label>
					<input
						className="inputMinimal"
						type="input"
						placeholder="Enter Bottom XPath"
						name="bottomXpath"
						style={{ padding: '10px 15px' }}
						onChange={this.handleChange}
					/>
				</Col>
				<Col md={6} style={{ paddingLeft: '0px', marginBottom: '20px' }}>
					<label htmlFor="bottomOffset">Enter Bottom Offset</label>
					<input
						className="inputMinimal"
						type="number"
						placeholder="Enter Bottom Offset"
						name="bottomOffset"
						style={{ padding: '10px 15px' }}
						onChange={this.handleChange}
					/>
				</Col>
				<Col md={12} style={{ paddingLeft: '0px' }}>
					<label htmlFor="css">Custom CSS</label>
					<textarea style={{ width: '100%', minHeight: '200px' }} name="css" onChange={this.handleChange}>
						{this.state.css}
					</textarea>
				</Col>
				<Col md={12} style={{ paddingRight: '0px' }}>
					{this.props.save.renderFn(this.props.save.label, this.saveHandler)}
				</Col>
			</form>
		);
	}
}

export default Docked;
