import React, { PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { deleteVariation, copyVariation } from '../../../../actions/variationActions.js';

const variationOtions = (props) => {
	const { onDeleteVariation, onCopyVariation, variation, channelId } = props;
	return (
		<div>
			<h1 className="variation-section-heading">Variataion Info</h1>
			<Row>
				<Col className="u-padding-r10px" xs={2}>
					Variation Name
				</Col>
				<Col className="u-padding-l10px" xs={8}>
					<strong>{props.variation.name}</strong>
					<button className="btn-icn-edit"></button>
				</Col>
			</Row>
			<Row>
				<Col className="u-padding-r10px" xs={2}>
					Sections
				</Col>
				<Col className="u-padding-l10px" xs={8}>
					<strong>{props.variation.sections.length}</strong>
				</Col>
			</Row>
			<br /><br /><br /><br />
			<Row>
				<Col className="u-padding-r10px" xs={2}>
					<Button className="btn-lightBg btn-copy btn-block" onClick={onCopyVariation.bind(null, variation.id, channelId)} type="submit">Copy Variation</Button>
				</Col>
				<Col className="u-padding-l10px" xs={2}>
					<Button className="btn-lightBg btn-del-line btn-block" onClick={onDeleteVariation.bind(null, variation.id, channelId)} type="submit">Delete Variation</Button>
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

