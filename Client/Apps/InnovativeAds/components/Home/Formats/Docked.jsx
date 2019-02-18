import React, { Component } from 'react';
import { Col } from 'react-bootstrap';
import SelectBox from '../../../../../Components/SelectBox';
import { AD_OPERATIONS, TYPE_OF_ADS, EVENTS } from '../../../configs/commonConsts';
import CodeBox from '../../../../../Components/CodeEditor';

class Docked extends Component {
	constructor(props) {
		super(props);
		const ad = this.props.ad ? this.props.ad : false;
		const hasFormatData = ad && ad.formatData ? ad.formatData : false;
		this.state = {
			xpath: hasFormatData ? ad.formatData.xpath : '',
			bottomXpath: hasFormatData ? ad.formatData.bottomXpath : '',
			bottomOffset: hasFormatData ? ad.formatData.bottomOffset : '',
			css: ad && ad.css ? window.btoa(JSON.stringify(ad.css)) : '',
			operation: hasFormatData ? ad.formatData.operation : null
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
			adData: {},
			formatData: {
				bottomOffset,
				bottomXpath,
				css: { ...parsedCSS, position: 'relative' },
				xpath,
				operation,
				event: EVENTS.SCRIPT_LOADED,
				eventData: {
					value: ''
				}
			},
			type: TYPE_OF_ADS.INTERACTIVE_AD
		});
	}

	render() {
		const { save, cancel, fullWidth } = this.props;
		const { xpath, bottomOffset, bottomXpath, operation, css } = this.state;
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
						value={xpath}
						onChange={this.handleChange}
					/>
				</Col>
				<Col md={colSize} style={{ paddingLeft: '0px', marginBottom: '20px' }}>
					<label htmlFor="adOperation">Ad Operation*</label>
					<SelectBox value={operation} label="Ad Operation" onChange={this.operationChange}>
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
						value={bottomXpath}
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
						value={bottomOffset}
						onChange={this.handleChange}
					/>
				</Col>
				<Col md={12} style={{ paddingLeft: '0px' }}>
					<label htmlFor="css">Custom CSS</label>
					<CodeBox name="css" showButtons={false} onChange={this.handleCodeChange} code={css} />
				</Col>
				{cancel ? cancel.renderFn(cancel.label, cancel.handler) : null}
				{save.renderFn(save.label, this.saveHandler)}
			</form>
		);
	}
}

export default Docked;
