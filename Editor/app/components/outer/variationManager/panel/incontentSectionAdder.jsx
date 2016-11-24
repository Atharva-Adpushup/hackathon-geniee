import React, { PropTypes } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Row, Col, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { createIncontentSection } from 'actions/sectionActions';
import CodeBox from 'shared/codeBox';

const form = reduxForm({
	form: 'inContentForm',
	validate
}),
	renderField = field => {
		return (
			<div>
				<Col xs={6} className="u-padding-r10px">
					<Row>
						<Col xs={6} className="u-padding-r10px"><strong>{field.label}</strong></Col>
						<Col xs={6} className="u-padding-r10px"><input type={field.type} placeholder={field.placeholder} {...field.input} />
							{field.meta.touched && field.meta.error && <div className="error-message">{field.meta.error}</div>}
						</Col>
					</Row>
				</Col>
			</div>
		);
	}, 
	renderCodeBox = field => {
		return (<CodeBox showButtons={false} isField field={field} />);
	};

function validate(formProps) {
	const errors = {};

	if (!formProps.section) {
		errors.section = 'Please enter section';
	}

	if (!formProps.minDistanceFromPrevAd) {
		errors.minDistanceFromPrevAd = 'Please enter minDistanceFromPrevAd';
	}
	
	if (!formProps.adCode) {
		errors.adCode = 'Please enter Ad Code';
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
				<h1 className="variation-section-heading">Add Incontent Variation</h1>
				<Field placeholder="Please enter section" name="section" component={renderField} type="number" label="Section No" />
				<Field placeholder="Please enter minDistanceFromPrevAd" name="minDistanceFromPrevAd" component={renderField} type="number" label="minDistanceFromPrevAd" />
				<Field placeholder="Please enter width" name="width" component={renderField} type="number" label="Width" />
				<Field placeholder="Please enter height" name="height" component={renderField} type="number" label="Height" />
				<Row>
					<Col xs={6} className="u-padding-r10px">
						<Row>
							<Col xs={6} className="u-padding-r10px"><strong>Float</strong></Col>
							<Col xs={6} className="u-padding-r10px">
								<Field name="float" component="select">
									<option name="none">none</option>
									<option name="left">left</option>
									<option name="right">right</option>
								</Field>
							</Col>
						</Row>
					</Col>
				</Row>
				<Row>
					{ currentUser.userType !== 'partner' ? ( <Field name="adCode" component={renderCodeBox} label="Ad Code" /> ) : '' }
				</Row>
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
			section: 1,
			float: 'none',
			minDistanceFromPrevAd: 200,
			width: 320,
			height: 180
		}
	}),

	mapDispatchToProps = (dispatch, ownProps) => ({
		onSubmit: (values) => {
			dispatch(createIncontentSection({
				sectionNo: values.section,
				minDistanceFromPrevAd: values.minDistanceFromPrevAd,
				float: values.float
			}, {
				width: values.width,
				height: values.height,
				adCode: values.adCode
			}, ownProps.variation.id));
		}
	});


export default connect(mapStateToProps, mapDispatchToProps)(form(inContentForm));
