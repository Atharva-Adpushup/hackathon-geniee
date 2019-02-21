import React, { Component } from 'react';
import { Col } from 'react-bootstrap';
import SelectBox from '../../../../../Components/Selectbox/index';
import { AD_OPERATIONS, TYPE_OF_ADS, EVENTS } from '../../../configs/commonConsts';
import CodeBox from '../../../../../Components/CodeBox/index';
import CustomInput from '../../shared/index';

class Docked extends Component {
	constructor(props) {
		super(props);
		const { ad } = this.props;
		const hasFormatData = ad && ad.formatData ? ad.formatData : false;
		this.state = {
			xpath: hasFormatData ? ad.formatData.xpath : '',
			bottomXpath: hasFormatData ? ad.formatData.bottomXpath : '',
			bottomOffset: hasFormatData ? ad.formatData.bottomOffset : '',
			css: hasFormatData && ad.formatData.css ? window.btoa(JSON.stringify(ad.formatData.css)) : '',
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
		const { save } = this.props;
		let parsedCSS = {};
		if (!xpath || !operation) {
			return window.alert('Xpath and Ad Operation are mandatory fields');
		}
		if (css && css.trim().length) {
			try {
				parsedCSS = JSON.parse(window.atob(css));
			} catch (err) {
				return window.alert('Invalid CSS');
			}
		}
		return save.handler({
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
				<CustomInput
					name="xpath"
					value={xpath}
					type="text"
					label="Enter Xpath"
					handler={this.handleChange}
					size={colSize}
					id="xpath-input"
				/>
				<Col md={colSize} className="u-padding-l0 u-margin-b5">
					<label htmlFor="adOperation">Ad Operation*</label>
					<SelectBox
						selected={operation}
						onSelect={this.operationChange}
						title="Ad Operation"
						id="ad-operation-selectbox"
						options={AD_OPERATIONS.map(op => ({
							name: op,
							value: op
						}))}
					/>
				</Col>
				<CustomInput
					name="bottomXpath"
					value={bottomXpath}
					type="text"
					label="Enter Bottom XPath"
					handler={this.handleChange}
					size={colSize}
					id="bottom-xpath-input"
				/>
				{/* </Col> */}
				<CustomInput
					name="bottomOffset"
					value={bottomOffset}
					type="text"
					label="Enter Bottom Offset"
					handler={this.handleChange}
					size={colSize}
					id="bottom-offset-input"
				/>
				<Col md={12} className="u-padding-l0">
					<label htmlFor="css">Custom CSS</label>
					<CodeBox name="css" showButtons={false} onChange={this.handleCodeChange} code={css} />
				</Col>
				{save.renderFn(save.label, this.saveHandler)}
				{cancel ? cancel.renderFn(cancel.label, cancel.handler, 'secondary') : null}
			</form>
		);
	}
}

Docked.defaultProps = {
	ad: false
};

export default Docked;
