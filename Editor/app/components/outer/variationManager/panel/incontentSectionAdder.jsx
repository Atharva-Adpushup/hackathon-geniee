import React, { PropTypes } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Row, Col, Button } from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';


class inContentAdder extends React.Component {

	render() {
		const props = this.props;
		return (
			<form onSubmit={props.handleSubmit}>
				<Row>
					<Col className="u-padding-r10px" xs={8}>
						<b>Section</b>
					</Col>
					<Col className="u-padding-l10px" xs={4}>
						<Field name="section" component="input" type="number" />
					</Col>
				</Row>
				<Row>
					<Col className="u-padding-r10px" xs={8}>
						<b>Float</b>
					</Col>
					<Col className="u-padding-l10px" xs={4}>
						<Field name="float" component="select">
							<option value="none">None</option>
							<option value="left">Left</option>
							<option value="right">Right</option>
						</Field>
					</Col>
				</Row>
				<Row>
					<Col className="u-padding-r10px" xs={8}>
						<b>Height</b>
					</Col>
					<Col className="u-padding-l10px" xs={4}>
						<Field name="height" component="input" type="number" />
					</Col>
				</Row>
				<Row>
					<Col className="u-padding-r10px" xs={8}>
						<b>Width</b>
					</Col>
					<Col className="u-padding-l10px" xs={4}>
						<Field name="width" component="input" type="number" />
					</Col>
				</Row>
				<Row>
					<Col className="u-padding-r10px" xs={8}>
						<b>minDistanceFromPrevAd</b>
					</Col>
					<Col className="u-padding-l10px" xs={4}>
						<Field name="minDistanceFromPrevAd" component="input" type="number" />
					</Col>
				</Row>
				<Row>
					<Col style={{ paddingRight: 0 }} xs={12}>
						<Button className="btn-lightBg btn-save btn-block" type="submit">Save</Button>
					</Col>
				</Row>
			</form>
		);
	}
}


inContentAdder.propTypes = {
	handleSubmit: PropTypes.func.isRequired
};

const inContentAdderForm = reduxForm({
		form: 'cssMarginEditor' // a unique name for this form
	})(inContentAdder),

	mapStateToProps = (state, ownProps) => ({ ...ownProps }),

	mapDispatchToProps = (dispatch, ownProps) => bindActionCreators({
		dispatch
	}, dispatch);


export default connect(mapStateToProps, mapDispatchToProps)(inContentAdderForm);

