import React, { Component } from 'react';
import { Col } from 'react-bootstrap';
import SelectBox from '../../../../../Components/SelectBox';
import { AD_OPERATIONS, TYPE_OF_ADS } from '../../../configs/commonConsts';
import CodeBox from '../../../../../Components/CodeEditor';

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
		this.handleCodeChange = this.handleCodeChange.bind(this);
		this.operationChange = this.operationChange.bind(this);
		this.saveHandler = this.saveHandler.bind(this);
	}

	handleChange(e) {
		this.setState({
			[e.target.name]: e.target.value
		});
	}

	handleCodeChange(css) {
		this.setState({ css: window.btoa(css) });
	}

	operationChange(value) {
		this.setState({ operation: value });
	}

	saveHandler(e) {
		e.preventDefault();
		const { xpath, bottomXpath, bottomOffset, operation, css } = this.state;
		let parsedCSS = {};
		if (!xpath || !operation) {
			return alert('Xpath and Ad Operation are mandatory fields');
		} else if (css && css.trim().length) {
			try {
				parsedCSS = JSON.parse(window.atob(css));
			} catch (err) {
				return window.alert('Invalid CSS');
			}
		}
		return this.props.save.handler({
			adData: {
				xpath,
				operation
			},
			formatData: {
				bottomOffset,
				bottomXpath,
				css: parsedCSS
			},
			type: TYPE_OF_ADS.DOCKED_STRUCTURAL
		});
	}

	render() {
		const { save, cancel, fullWidth } = this.props;
		const colSize = fullWidth ? 12 : 6;
		return (
			<form action="#" method="POST">
				<Col md={colSize} style={{ paddingLeft: '0px', marginBottom: '20px' }}>
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
				<Col md={colSize} style={{ paddingLeft: '0px', marginBottom: '20px' }}>
					<label htmlFor="adOperation">Ad Operation*</label>
					<SelectBox value={this.state.operation} label="Ad Operation" onChange={this.operationChange}>
						{AD_OPERATIONS.map((operation, index) => (
							<option key={index} value={operation}>
								{operation}
							</option>
						))}
					</SelectBox>
				</Col>
				<Col md={colSize} style={{ paddingLeft: '0px', marginBottom: '20px' }}>
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
				<Col md={colSize} style={{ paddingLeft: '0px', marginBottom: '20px' }}>
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
					<CodeBox name="css" showButtons={false} onChange={this.handleCodeChange} code={this.state.css} />
				</Col>
				{cancel ? this.props.cancel.renderFn(cancel.label, cancel.handler) : null}
				{save.renderFn(save.label, this.saveHandler)}
			</form>
		);
	}
}

export default Docked;
