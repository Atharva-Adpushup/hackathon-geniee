import React, { PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';
import CodeBox from 'shared/codeBox';
import { saveBeforeJs, saveAfterJs } from 'actions/variationActions.js';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

const BeforeAfterJsPanel = props => {
	const { onSaveBeforeJs, onSaveAfterJs, variation, ui } = props,
		wrapper = `(function($){ \n\n })(adpushup.$)`,
		beforeJs = variation.customJs.beforeAp ? atob(variation.customJs.beforeAp) : wrapper,
		afterJs = variation.customJs.afterAp ? atob(variation.customJs.afterAp) : wrapper;
	return (
		<div>
			<h1 className="variation-section-heading">Before/After JS</h1>
			<Row>
				<Col xs={6}>
					<div>Enter Before JS</div>
					<CodeBox
						showButtons
						textEdit
						parentExpanded={ui.variationPanel.expanded}
						textEditBtn="Save Before JS"
						code={beforeJs}
						onSubmit={onSaveBeforeJs.bind(null, variation)}
					/>
				</Col>
				<Col xs={6}>
					<div>Enter After JS</div>
					<CodeBox
						showButtons
						textEdit
						parentExpanded={ui.variationPanel.expanded}
						textEditBtn="Save After JS"
						code={afterJs}
						onSubmit={onSaveAfterJs.bind(null, variation)}
					/>
				</Col>
			</Row>
		</div>
	);
};

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
