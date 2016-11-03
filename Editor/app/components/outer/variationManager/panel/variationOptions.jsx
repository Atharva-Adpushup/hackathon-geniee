import React, { PropTypes } from 'react';
import { Row, Col, Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { deleteVariation, copyVariation, editVariationName, editTrafficDistribution } from 'actions/variationActions.js';
import InlineEdit from '../../../shared/inlineEdit/index.jsx';

const variationOtions = (props) => {
	const { onDeleteVariation, onCopyVariation, onEditVariationName, variation, channelId, onEditTrafficDistribution } = props;
	return (
		<div>
			<h1 className="variation-section-heading">Variataion Info</h1>
			<Row>
				<Col className="u-padding-r10px" xs={2}>
					Variation Name
				</Col>
				<Col className="u-padding-l10px" xs={8}>
					<InlineEdit value={variation.name} submitHandler={onEditVariationName.bind(null, variation.id)} text="Variation Name" errorMessage="Variation Name cannot be blank" />
				</Col>
			</Row>
			<Row>
				<Col className="u-padding-r10px" xs={2}>
					Traffic Distribution
				</Col>
				<Col className="u-padding-l10px" xs={8}>
					<InlineEdit value={variation.trafficDistribution} submitHandler={onEditTrafficDistribution.bind(null, variation.id)} text="Traffic Distribution" errorMessage="Traffic Distribution cannot be blank" />
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
			<br /><br />
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
	onDeleteVariation: PropTypes.func.isRequired,
	onEditVariationName: PropTypes.func.isRequired,
	onEditTrafficDistribution: PropTypes.func.isRequired
};

export default connect(
	(state, ownProps) => ({ ...ownProps }),
	(dispatch) => bindActionCreators({
		onCopyVariation: copyVariation,
		onDeleteVariation: deleteVariation,
		onEditVariationName: editVariationName,
		onEditTrafficDistribution: editTrafficDistribution
	}, dispatch)
	)(variationOtions);
