import React, { PropTypes, Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import CodeBox from 'shared/codeBox';
import { saveBeforeJs, saveAfterJs } from 'actions/variationActions.js';
import { jsWrapper } from '../../../../consts/commonConsts';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

class BeforeAfterJsPanel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			beforeJs: this.props.variation.customJs.beforeAp ? atob(this.props.variation.customJs.beforeAp) : jsWrapper,
			afterJs: this.props.variation.customJs.afterAp ? atob(this.props.variation.customJs.afterAp) : jsWrapper
		};
	}
	// shouldComponentUpdate(nextProps) {
	// 	return (
	// 		this.props.variation.id != nextProps.variation.id ||
	// 		atob(this.props.variation.customJs.beforeAp) != atob(nextProps.variation.customJs.beforeAp) ||
	// 		atob(this.props.variation.customJs.afterAp) != atob(nextProps.variation.customJs.afterAp)
	// 	);
	// }
	componentWillReceiveProps(nextProps) {
		this.setState({
			beforeJs: nextProps.variation.customJs.beforeAp ? atob(nextProps.variation.customJs.beforeAp) : jsWrapper,
			afterJs: nextProps.variation.customJs.afterAp ? atob(nextProps.variation.customJs.afterAp) : jsWrapper
		});
	}
	render() {
		const { onSaveBeforeJs, onSaveAfterJs, variation, ui } = this.props;
		// console.log('From render');
		// console.log(this.state);
		// wrapper = `(function($){ \n\n })(adpushup.$)`,
		// beforeJs = variation.customJs.beforeAp ? atob(variation.customJs.beforeAp) : wrapper,
		// afterJs = variation.customJs.afterAp ? atob(variation.customJs.afterAp) : wrapper;
		return (
			<div>
				<h1 className="variation-section-heading">Before/After JS</h1>
				<Row>
					<Col xs={6}>
						<div>Enter Before JS</div>
						<CodeBox
							customId={`${variation.id}beforeJs`}
							showButtons
							textEdit
							parentExpanded={ui.variationPanel.expanded}
							textEditBtn="Save Before JS"
							code={this.state.beforeJs}
							onSubmit={onSaveBeforeJs.bind(null, variation)}
						/>
					</Col>
					<Col xs={6}>
						<div>Enter After JS</div>
						<CodeBox
							customId={`${variation.id}AfterJs`}
							showButtons
							textEdit
							parentExpanded={ui.variationPanel.expanded}
							textEditBtn="Save After JS"
							code={this.state.afterJs}
							onSubmit={onSaveAfterJs.bind(null, variation)}
						/>
					</Col>
				</Row>
			</div>
		);
	}
}

BeforeAfterJsPanel.propTypes = {
	variation: PropTypes.object.isRequired,
	channelId: PropTypes.string.isRequired,
	onSaveBeforeJs: PropTypes.func.isRequired
};

export default connect(
	(state, ownProps) => ({ ...ownProps }),
	dispatch =>
		bindActionCreators(
			{
				onSaveBeforeJs: saveBeforeJs,
				onSaveAfterJs: saveAfterJs
			},
			dispatch
		)
)(BeforeAfterJsPanel);
