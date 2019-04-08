import React, { Component } from 'react';
import { Col } from 'react-bootstrap';
import { TYPE_OF_ADS, EVENTS } from '../../../configs/commonConsts';
import CodeBox from '../../../../../Components/CodeEditor';

class Docked extends Component {
	constructor(props) {
		super(props);
		const ad = this.props.ad ? this.props.ad : false;
		const hasFormatData = ad && ad.formatData ? ad.formatData : false;
		this.state = {
			topOffset: hasFormatData ? ad.formatData.topOffset : 0,
			contentOffset: hasFormatData ? ad.formatData.contentOffset : 0,
			contentXpath: hasFormatData ? ad.formatData.contentXpath : '',
			css: ad && ad.css ? window.btoa(JSON.stringify(ad.css)) : ''
		};
		this.handleChange = this.handleChange.bind(this);
		this.handleCodeChange = this.handleCodeChange.bind(this);
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

	saveHandler(e) {
		e.preventDefault();
		const { topOffset, contentOffset, contentXpath, css } = this.state;
		let parsedCSS = {};
		if (!topOffset) {
			return alert('Top Offset is mandatory fields');
		} else if (css && css.trim().length) {
			try {
				parsedCSS = JSON.parse(window.atob(css));
			} catch (err) {
				return window.alert('Invalid CSS');
			}
		}
		return this.props.save.handler({
			formatData: {
				contentOffset,
				topOffset,
				contentXpath: contentXpath.trim(),
				formatData: {
					event: EVENTS.SCRIPT_LOADED,
					eventData: {
						value: ''
					}
				}
			},
			css: parsedCSS,
			type: TYPE_OF_ADS.INTERACTIVE_AD
		});
	}

	renderInput = (name, value, type, label, handler, size = 6) => (
		<Col md={size} style={{ paddingLeft: '0px', marginBottom: '20px' }}>
			<label htmlFor={name}>{label}</label>
			<input
				className="inputMinimal"
				type={type}
				placeholder={label}
				name={name}
				value={value}
				style={{ padding: '10px 15px' }}
				onChange={handler}
			/>
		</Col>
	);

	render() {
		const { topOffset, contentOffset, contentXpath } = this.state;
		return (
			<form action="#" method="POST">
				{this.renderInput('topOffset', topOffset, 'number', 'Enter Top Offset', this.handleChange)}
				{this.renderInput('contentOffset', contentOffset, 'number', 'Enter Content Offset', this.handleChange)}
				{this.renderInput('contentXpath', contentXpath, 'text', 'Enter Content Xpath', this.handleChange, 12)}
				<Col md={12} style={{ paddingLeft: '0px' }}>
					<label htmlFor="css">Custom CSS</label>
					<CodeBox name="css" showButtons={false} onChange={this.handleCodeChange} code={this.state.css} />
				</Col>
				<Col md={12} style={{ paddingRight: '0px' }}>
					{this.props.save.renderFn(this.props.save.label, this.saveHandler)}
				</Col>
			</form>
		);
	}
}

export default Docked;
