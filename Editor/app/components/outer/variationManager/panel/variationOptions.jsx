import React, { PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { deleteVariation, copyVariation } from '../../../../actions/variationActions.js';

const variationOtions = (props) => {
	const { onDeleteVariation, onCopyVariation, variation, channelId } = props;
	return (
		<div>
			<Row>
				<Col className="u-padding-r10px" xs={7}>
			Delete Variation
				</Col>
				<Col className="u-padding-l10px" xs={5}>
					<Button className="btn-lightBg btn-save btn-block" onClick={onDeleteVariation.bind(null, variation.id, channelId)} type="submit">Save</Button>
				</Col>
			</Row>
			<Row>
				<Col className="u-padding-r10px" xs={7}>
			Copy Variation
				</Col>
				<Col className="u-padding-l10px" xs={5}>
					<Button className="btn-lightBg btn-save btn-block" onClick={onCopyVariation.bind(null, variation.id, channelId)} type="submit">Save</Button>
				</Col>
			</Row>
		</div>
	);
};

variationOtions.propTypes = {
	variation: PropTypes.object.isRequired,
	channelId: PropTypes.string.isRequired,
	onCopyVariation: PropTypes.func.isRequired,
	onDeleteVariation: PropTypes.func.isRequired
};

export default connect(
	(state, ownProps) => ({ ...ownProps }),
	(dispatch) => bindActionCreators({
		onCopyVariation: copyVariation,
		onDeleteVariation: deleteVariation
	}, dispatch)
	)(variationOtions);

