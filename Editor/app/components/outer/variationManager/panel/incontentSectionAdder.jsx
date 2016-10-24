import React, { PropTypes } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Row, Col, Button } from 'react-bootstrap';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

const form = reduxForm({
	form: 'inContentForm',
	validate
});

const renderField = field => {
	return (
		<div>
			<Col xs={6} className="u-padding-r10px">
				<Row>
					<Col xs={6} className="u-padding-r10px">
						<strong>{field.label}</strong>
					</Col>
					<Col xs={6} className="u-padding-r10px">
						<input placeholder={field.placeholder} {...field.input} />
						{field.meta.touched && field.meta.error && <div className="error-message">{field.meta.error}</div>}
					</Col>
				</Row>
			</Col>
		</div>
	);
};

function validate(formProps) {
	const errors = {};

	if (!formProps.section) {
		errors.section = 'Please enter section';
	}

	if (!formProps.minDistanceFromPrevAd) {
		errors.minDistanceFromPrevAd = 'Please enter minDistanceFromPrevAd';
	}

	if (!formProps.height) {
		errors.height = 'Please enter height';
	}

	if (!formProps.width) {
		errors.width = 'Please enter width';
	}

	return errors;
}


class inContentForm extends React.Component {

	render() {
		const props = this.props;
		return (
			<form onSubmit={props.handleSubmit}>
				<h1 className="variation-section-heading">Variation In-content Settings</h1>
				<Field placeholder="Please enter section" name="section" component={renderField} type="number" label="Section" />
				<Field placeholder="Please enter minDistanceFromPrevAd" name="minDistanceFromPrevAd" component={renderField} type="number" label="minDistanceFromPrevAd" />
				<Field placeholder="Please enter height" name="height" component={renderField} type="number" label="Height" />
				<Field placeholder="Please enter width" name="width" component={renderField} type="number" label="Width" />
				<Col xs={6} className="u-padding-r10px">
					<Row>
						<Col xs={6} className="u-padding-r10px">
							<strong>Float</strong>
						</Col>
						<Col xs={6} className="u-padding-r10px">
							<Field name="float" component="select">
								<option name="none">None</option>
								<option name="left">Left</option>
								<option name="right">Right</option>
							</Field>
						</Col>
					</Row>
				</Col>
				<Row>
					<Col className="u-padding-r10px" style={{ marginTop: '30px', clear: 'both' }} xs={2}>
						<Button className="btn-lightBg btn-save btn-block" type="submit">Save</Button>
					</Col>
				</Row>
			</form>
		);
	}
}


inContentForm.propTypes = {
	handleSubmit: PropTypes.func.isRequired
};

const mapStateToProps = (state, ownProps) => ({
		...ownProps,
		initialValues: {
			section: 2,
			float: 'left',
			minDistanceFromPrevAd: 200,
			height: 320,
			width: 180
		}
	}),

	mapDispatchToProps = (dispatch) => ({
		onSubmit: (values) => {
			console.log(values);
		}
	});


export default connect(mapStateToProps, mapDispatchToProps)(form(inContentForm));

