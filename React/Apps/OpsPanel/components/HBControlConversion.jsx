// HB control conversion component

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';

class HBControlConversion extends Component {
	constructor(props) {
		super(props);

		this.state = {
			errorMessage: null,
			updateMessage: null,
			controlCode: null,
			setupCode: ''
		};
		this.generateControlCode = this.generateControlCode.bind(this);
		this.wrapSetupCode = this.wrapSetupCode.bind(this);
		this.onChangeHandler = this.onChangeHandler.bind(this);
	}

	onChangeHandler(e) {
		this.setState({ setupCode: e.target.value });
	}

	wrapSetupCode(setupCode) {
		const { siteId } = this.props;

		try {
			const encodedCode = window.btoa(setupCode),
				controlCode = `<ins data-ac="${encodedCode}" class="adpTagsPrebidControl" data-siteId="${siteId}"></ins><script>!function(t,a){for(var e=0,s=document.getElementsByTagName("ins"),n=s[e];e<s.length;n=s[++e])"adpTagsPrebidControl"==n.className&&"1"!=n.getAttribute("data-push")&&(((t.adpTags=t.adpTags||{}).control=t.adpTags.control||[]).push(n),n.setAttribute("data-push","1"))}(window);</script>`;

			this.setState({ controlCode, setupCode: controlCode });
		} catch (e) {
			this.setState({ errorMessage: 'Error occurred while converting setup code' });
		}
	}

	generateControlCode() {
		this.setState(
			{
				updateMessage: null,
				errorMessage: ''
			},
			() => {
				this.wrapSetupCode(this.state.setupCode);
			}
		);
	}

	render() {
		const { state } = this;

		return (
			<div className="settings-pane">
				<Row>
					<Col sm={12}>
						<p className="hb-settings-text">
							Convert a Publisher's existing header bidding setup into control code which is executed by
							AdPushup script.
						</p>
					</Col>
				</Row>
				<Row>
					<Col sm={6}>
						<textarea
							className="hb-config-input"
							ref="textarea"
							style={{ height: 300 }}
							value={state.setupCode}
							onChange={this.onChangeHandler}
							placeholder="Paste the setup code here"
						/>
					</Col>
				</Row>
				<Row>
					<Col sm={12}>
						<div className="message-wrapper">
							<div className="error-message">{state.errorMessage}</div>
							<div style={{ color: '#14A314' }}>{state.updateMessage}</div>
						</div>
					</Col>
					<Col sm={4}>
						<button className="btn btn-lightBg btn-default" onClick={this.generateControlCode}>
							Generate Control Code
						</button>
					</Col>
				</Row>
			</div>
		);
	}
}

HBControlConversion.propTypes = {
	siteId: PropTypes.string.isRequired
};

export default HBControlConversion;
