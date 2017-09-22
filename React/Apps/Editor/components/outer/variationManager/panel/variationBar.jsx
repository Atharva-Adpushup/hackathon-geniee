import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { manipulateElement } from 'scripts/domManager';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { expandVariationPanel, shrinkVariationPanel } from 'actions/uiActions.js';

const VariationBar = props => {
	const { onExpandVariationPanel, onShrinkVariationPanel, expanded } = props;

	return (
		<div style={{ padding: '12px' }}>
			<Row>
				<Col className="pull-right" xs={2}>
					{!expanded ? (
						<Button
							className="btn-lightBg btn-expand btn-block"
							type="submit"
							onClick={onExpandVariationPanel.bind(null, '.variation-settings', {
								property: 'height',
								value: '100%'
							})}
						>
							Expand
						</Button>
					) : (
						<Button
							className="btn-lightBg btn-compress btn-block"
							type="submit"
							onClick={onShrinkVariationPanel.bind(null, '.variation-settings', {
								property: 'height',
								value: '400'
							})}
						>
							Shrink
						</Button>
					)}
				</Col>
			</Row>
		</div>
	);
};

export default connect(
	(state, ownProps) => ({ ...ownProps }),
	dispatch =>
		bindActionCreators(
			{
				onExpandVariationPanel: expandVariationPanel,
				onShrinkVariationPanel: shrinkVariationPanel
			},
			dispatch
		)
)(VariationBar);
