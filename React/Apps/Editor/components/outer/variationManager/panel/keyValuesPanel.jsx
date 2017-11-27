import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import CodeBox from 'shared/codeBox';
import { showNotification } from 'actions/uiActions';
import { saveKeyValues } from 'actions/variationActions.js';

class KeyValuesPanel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			containsADP: false,
			adpKeyValues: this.props.variation.adpKeyValues || isNull
		};
		this.checkADP = this.checkADP.bind(this);
		this.submitHandler = this.submitHandler.bind(this);
	}

	componentWillMount() {
		this.setState({
			containsADP: this.checkADP()
		});
	}

	checkADP() {
		return this.props.sections
			? this.props.sections.some(section => {
				let ad = section.ads[0];
				if (ad.network && ad.network == 'adpTags') {
					return true;
				}
			})
			: false;
	}

	submitHandler(value) {
		try {
			value = JSON.parse(value);
		} catch (e) {
			this.props.showNotification({
				mode: 'error',
				title: 'Invalid Value',
				message: 'Key values must be valid JSON'
			});
			return false;
		}
		this.props.saveKeyValues(this.props.variation, value);
		this.props.showNotification({
			mode: 'success',
			title: 'Operation Successful',
			message: 'Key Values Updated'
		});
	}

	render() {
		return this.state.containsADP ? (
			<div>
				<h1 className="variation-section-heading">ADP Key Values</h1>
				<Row>
					<Col xs={6}>
						<CodeBox
							showButtons
							textEdit
							parentExpanded={this.props.ui.variationPanel.expanded}
							textEditBtn="Save Key Values"
							code={this.state.adpKeyValues ? JSON.stringify(this.state.adpKeyValues) : '{}'}
							onSubmit={this.submitHandler}
						/>
					</Col>
				</Row>
			</div>
		) : (
				<div>Variation must contain one ADP section in order to set Key-Values</div>
			);
	}
}

export default connect(
	(state, ownProps) => ({ ...ownProps }),
	dispatch =>
		bindActionCreators(
			{
				showNotification: showNotification,
				saveKeyValues: saveKeyValues
			},
			dispatch
		)
)(KeyValuesPanel);
