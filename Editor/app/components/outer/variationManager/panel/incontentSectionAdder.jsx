import React, { PropTypes } from 'react';
import { Field, FieldArray, reduxForm } from 'redux-form';
import validate from './inContentValidations';
import { Row, Col, Button } from 'react-bootstrap';
import { connect } from 'react-redux';
import { createIncontentSection } from 'actions/sectionActions';
import { commonSupportedSizes, nonPartnerAdSizes } from 'consts/commonConsts.js';
import CodeBox from 'shared/codeBox';
import _ from 'lodash';

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

	getNotNearData = (collection) => {
		const computedArr = [];

		if (!collection || !collection.length) {
			return false;
		}

		collection.forEach((obj) => {
			const notNearObj = {};

			notNearObj[obj.selector] = obj.pixels;
			computedArr.push(notNearObj);
		});

		return computedArr;
	},

	renderNotNear = ({ fields, meta: { touched, error } }) => (
		<ul>
			<li className="mb-30">
				<strong className="u-padding-r10px">Not near</strong><Button className="btn-lightBg" type="button" onClick={() => fields.push({})}>Add property</Button>
				{touched && error && <span>{error}</span>}
			</li>
			{fields.map((property, index) =>
				<li className="u-margin-b15px" key={index}>
					<Field name={`${property}.selector`} type="text" component={renderField} label="HTML selector" placeholder="For example, .paragraph" />
					<Field name={`${property}.pixels`} type="text" component={renderField} label="Pixel distance from selector" placeholder="For example, 300" />
					<Button className="btn-lightBg" type="button" onClick={() => fields.remove(index)}>Remove property</Button>
				</li>
			)}
		</ul>
	),
	renderCodeBox = field => {
		return (<CodeBox showButtons={false} isField field={field} />);
	},
	getSupportedSizes = () => {
		const sizes = [];
		commonSupportedSizes.forEach(size => {
			size.sizes.forEach(adSize => {
				sizes.push(`${adSize.width} x ${adSize.height}`);
			});
		});

		if (currentUser.userType !== 'partner') {
			nonPartnerAdSizes.forEach(size => {
				size.sizes.forEach(adSize => {
					sizes.push(`${adSize.width} x ${adSize.height}`);
				});
			});
		}

		return _.uniq(sizes);
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
		if (currentUser.userType !== 'partner') {
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
			<div>
				{
					props.activeChannel.contentSelector ? (
						<form onSubmit={props.handleSubmit}>
							<h1 className="variation-section-heading">Add Incontent Variation</h1>
							<Field placeholder="Please enter section" name="section" component={renderField} type="number" label="Section No" />
							<Field placeholder="Please enter minDistanceFromPrevAd" name="minDistanceFromPrevAd" component={renderField} type="number" label="minDistanceFromPrevAd" />
							<Row>
								<Col xs={6} className="u-padding-r10px">
									<Row>
										<Col xs={6} className="u-padding-r10px"><strong>Ad Size</strong></Col>
										<Col xs={6} className="u-padding-r10px">
											<Field name="adSize" component="select">
												{
													getSupportedSizes().map((pos, index) => (
														<option key={index} name={pos}>{pos}</option>
													))
												}
											</Field>
										</Col>
									</Row>
								</Col>
							</Row>
							{
								props.activeChannel.platform !== 'MOBILE' ? (
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
								) : null
							}
							<Row>
								{ CodeBoxField }
							</Row>
							<Row>
								<FieldArray name="notNear" component={renderNotNear} />
							</Row>
							<Row>
								<Col className="u-padding-r10px" style={{ marginTop: '30px', clear: 'both' }} xs={2}>
									<Button className="btn-lightBg btn-save btn-block" type="submit">Save</Button>
								</Col>
							</Row>
						</form>
					) : (
						<div>
							<h1 className="variation-section-heading">Add Incontent Variation</h1>
							<p className="error-message" style={{ fontSize: '1em' }}>
								Please set your <strong>Content Selector</strong> in the channel settings first to create your in-content section.
							</p>
						</div>
					)
				}
			</div>
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
			adSize: getSupportedSizes()[0]
		}
	}),

	mapDispatchToProps = (dispatch, ownProps) => ({
		onSubmit: (values) => {
			const notNear = getNotNearData(values.notNear),
				sectionPayload = {
					sectionNo: values.section,
					minDistanceFromPrevAd: values.minDistanceFromPrevAd,
					float: values.float,
					notNear
				},
				adPayload = {
					adCode: btoa(values.adCode),
					adSize: values.adSize
				};

			dispatch(createIncontentSection(sectionPayload, adPayload, ownProps.variation.id));
		}
	});

export default connect(mapStateToProps, mapDispatchToProps)(form(inContentForm));
