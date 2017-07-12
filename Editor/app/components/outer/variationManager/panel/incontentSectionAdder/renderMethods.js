// In-content section adder render methods

import { Field, FieldArray } from 'redux-form';
import CodeBox from 'shared/codeBox';
import { Row, Col, Button } from 'react-bootstrap';

const renderField = field => {
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
renderInContentAdder = (that, getSupportedSizes) => {
    let CodeBoxField;
	if (currentUser.userType !== 'partner') {
	    CodeBoxField = (<Field name="adCode" component={renderCodeBox} label="Ad Code" />);
	}
	else {
		if(that.state.addCustomAdCode) {
		    CodeBoxField = (
				<div>
					<Field name="adCode" component={renderCodeBox} label="Ad Code" /> 
					<Row>
						<Col xs={2} className="u-padding-r10px col-xs-offset-3">
							<Button style={{ marginTop: 20, marginBottom: 20 }} onClick={that.hideCustomAdCodeBox.bind(that)} className="btn-lightBg btn-cancel btn-block" type="button">Cancel</Button>
						</Col>
					</Row>
				</div>
			);
		}
		else {
			CodeBoxField = (<Col className="u-padding-r10px" style={{ marginTop: 20 }} xs={3}><Button onClick={that.showCustomAdCodeBox.bind(that)} className="btn-lightBg btn-code btn-block" type="button">Add Custom Ad Code</Button></Col>)
		}
	}

    return (
        <form onSubmit={that.props.handleSubmit}>
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
			    that.props.activeChannel.platform !== 'MOBILE' ? (
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
			<Field placeholder="Custom Zone Id" name="customZoneId" component={renderField} type="number" label="Custom Zone Id" />
			<Row>
			    <Col className="u-padding-r10px" style={{ marginTop: '30px', clear: 'both' }} xs={2}>
				    <Button className="btn-lightBg btn-save btn-block" type="submit">Save</Button>
				</Col>
			</Row>
	    </form>
    )
}

export { renderInContentAdder };
