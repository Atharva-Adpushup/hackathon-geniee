import React, { PropTypes } from 'react';
import { Field, reduxForm } from 'redux-form';
import validate from './inContentValidations';
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

class inContentForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = { addCustomAdCode: false };
	}

	showCustomAdCodeBox() {
		this.setState({ addCustomAdCode: true });
	}

	hideCustomAdCodeBox() {
		this.setState({ addCustomAdCode: false });
	}

	render() {
		const props = this.props;
		
		let CodeBoxField;
		if(currentUser.userType !== 'partner') {
			 CodeBoxField = (<Field name="adCode" component={renderCodeBox} label="Ad Code" />);
		}
		else {
			if(this.state.addCustomAdCode) {
				CodeBoxField = (
					<div>
						<Field name="adCode" component={renderCodeBox} label="Ad Code" /> 
						<Row>
							<Col xs={2} className="u-padding-r10px col-xs-offset-3">
								<Button style={{ marginTop: 20, marginBottom: 20 }} onClick={this.hideCustomAdCodeBox.bind(this)} className="btn-lightBg btn-cancel btn-block" type="button">Cancel</Button>
							</Col>
						</Row>
					</div>
				);
			}
			else {
				CodeBoxField = (<Col className="u-padding-r10px" style={{ marginTop: 20 }} xs={3}><Button onClick={this.showCustomAdCodeBox.bind(this)} className="btn-lightBg btn-code btn-block" type="button">Add Custom Ad Code</Button></Col>)
			}
		}

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
					{ CodeBoxField }
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
				adCode: btoa(values.adCode)
			}, ownProps.variation.id));
		}
	});


export default connect(mapStateToProps, mapDispatchToProps)(form(inContentForm));
