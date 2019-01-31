import React, { Component } from 'react';
import { Col } from 'react-bootstrap';
import CodeBox from '../../../../../Components/CodeEditor';
import { TYPE_OF_ADS, EVENTS } from '../../../configs/commonConsts';

class InView extends Component {
	constructor(props) {
		super(props);
		const { ad = false } = this.props;
		this.state = {
			xpath: ad && ad.formatData && ad.formatData.eventData ? ad.formatData.eventData.value : '',
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
		const { xpath, css } = this.state;
		let parsedCSS = {};
		if (!xpath) {
			return alert('Xpath is mandatory field');
		} else if (css && css.trim().length) {
			try {
				parsedCSS = JSON.parse(window.atob(css));
			} catch (err) {
				return window.alert('Invalid CSS');
			}
		}
		return this.props.save.handler({
			formatData: {
				event: EVENTS.SCROLL,
				eventData: {
					value: xpath
				}
			},
			css: parsedCSS,
			type: TYPE_OF_ADS.INTERACTIVE_AD
		});
	}

	render() {
		const { save, cancel } = this.props;
		const { xpath, css } = this.state;
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
						value={xpath}
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

export default InView;
