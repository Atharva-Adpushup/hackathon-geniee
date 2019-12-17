/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-alert */
import React, { Component } from 'react';
import { Col } from '@/Client/helpers/react-bootstrap-imports';
import { TYPE_OF_ADS, EVENTS } from '../../../configs/commonConsts';
import CodeBox from '../../../../../Components/CodeBox/index';
import CustomInput from '../../shared/index';

class Docked extends Component {
	constructor(props) {
		super(props);
		const { ad } = this.props;
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
		const { save } = this.props;
		const { topOffset, contentOffset, contentXpath, css } = this.state;
		let parsedCSS = {};
		if (!topOffset) {
			return window.alert('Top Offset is mandatory fields');
		}
		if (css && css.trim().length) {
			try {
				parsedCSS = JSON.parse(window.atob(css));
			} catch (err) {
				return window.alert('Invalid CSS');
			}
		}
		return save.handler({
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

	render() {
		const { save, cancel } = this.props;
		const { topOffset, contentOffset, contentXpath, css } = this.state;
		return (
			<form action="#" method="POST">
				<CustomInput
					name="topOffset"
					value={topOffset}
					type="number"
					label="Enter Top Offset"
					handler={this.handleChange}
					size={6}
					id="top-offset-input"
				/>
				<CustomInput
					name="contentOffset"
					value={contentOffset}
					type="number"
					label="Enter Content Offset"
					handler={this.handleChange}
					size={6}
					id="content-offset-input"
				/>
				<CustomInput
					name="contentXpath"
					value={contentXpath}
					type="text"
					label="Enter Content Xpath"
					handler={this.handleChange}
					size={12}
					id="top-content-xpath"
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
