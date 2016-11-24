import React, { PropTypes } from 'react';
import { Row, Col } from 'react-bootstrap';
import CodeBox from 'shared/codeBox';
import { saveBeforeJs, saveAfterJs } from 'actions/variationActions.js';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

const BeforeAfterJsPanel = (props) => {
	const { onSaveBeforeJs, onSaveAfterJs, variation } = props;
	return (
        <div>
            <h1 className="variation-section-heading">Before/After JS</h1>
            <Row>
                <Col xs={6}>
                    <CodeBox showButtons textEdit code={variation.customJs.beforeAp} onSubmit={onSaveBeforeJs.bind(null, variation)} />
                </Col>
                <Col xs={6}>
					<CodeBox showButtons textEdit code={variation.customJs.afterAp} onSubmit={onSaveAfterJs.bind(null, variation)} />
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
	(dispatch) => bindActionCreators({
		onSaveBeforeJs: saveBeforeJs,
		onSaveAfterJs: saveAfterJs
	}, dispatch)
	)(BeforeAfterJsPanel);