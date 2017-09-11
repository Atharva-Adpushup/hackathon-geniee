// In-content section adder render methods

import { Field, FieldArray } from 'redux-form';
import CodeBox from 'shared/codeBox';
import SelectBox from 'shared/select/select';
import CustomToggleSwitch from 'components/shared/customToggleSwitch.jsx';
import { Row, Col, Button } from 'react-bootstrap';

const renderField = field => {
	return (
        <div>
		    <Col xs={12} className="u-padding-r10px">
			    <Row>
				    <Col xs={5} className="u-padding-r10px"><strong>{field.label}</strong></Col>
					<Col xs={7} className="u-padding-r10px">
						<input 
							type={field.type}
							placeholder={field.placeholder}
							{...field.input}
							className="inputMinimal"
						/>
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
			<Col xs={12} className="u-padding-r10px">
				<Col xs={5} className="u-padding-r10px">
					<strong>Not near</strong>
				</Col>
				<Col xs={7} className="u-padding-r10px">
					<Button className="btn-lightBg" type="button" onClick={() => fields.push({})}>Add property</Button>
				</Col>
				{touched && error && <span>{error}</span>}
			</Col>
		</li>
		<div className="mB-10" style={{clear: "both"}}></div>
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
renderSwitch = field => {
	return (
		<CustomToggleSwitch labelText={field.label} className="mT-10 mB-10" labelSize={5} componentSize={7} customComponentClass="u-padding-r10px" checked={true} name="headerBiddingSwitch" layout="horizontal" size="m" id="js-header-bidding-switch" on="Yes" off="No" {...field.input} />
	)
},
renderNetworkOptions = (that, CodeBoxField) => {
	let networkDropdownItems = ['adsense', 'adx', 'adpTags', 'dfp', 'critieo', 'custom'];
	return (
		<Row>
			<Col xs={12} className="u-padding-r10px">
				<Row>
					<Col xs={5} className="u-padding-r10px"><strong>Select Network</strong></Col>
					<Col xs={7} className="u-padding-r10px mb-10">
						<Field name="network" component="select" className="inputMinimal" onChange={that.setNetwork.bind(that)}>
							<option value={false}>Select network</option>
							{
								networkDropdownItems.map((item, index) => (
									<option key={index} value={item}>{item.charAt(0).toUpperCase() + item.slice(1).replace(/([A-Z])/g, " $1")}</option>
								))
							}
						</Field>
					</Col>
				</Row>
				<Row>
					{
						that.state.network
						?
							that.state.network == 'adpTags'
							?
								(
									<div className="clearfix">
										<div className="mT-10 mB-10 clearfix">
											<Field placeholder="Please enter price floor" name="priceFloor" component={renderField} type="text" label="Price Floor" />
										</div>
										<div>
											<Field label="Header Bidding" name="headerBidding" component={renderSwitch} onChange={that.switchChangeHandler.bind(that)} />
										</div>
									</div>
								)
							:
								(
									<div style={{margin: "10px 0px"}} className="clearfix">
										{ CodeBoxField }
									</div>
								)
						: null
					}
				</Row>
			</Col>
		</Row>
	)
},
renderSectionInfo = () => {
	return (
		<div>
			<p>Each <strong>Section no</strong> maps to a bracket of 200 pixels in reference to the content selector i.e.</p>
			<ul>
				<li>Section No 1 : <strong>(0 - 200) pixels</strong></li>
				<li>Section No 2 : <strong>(200 - 400) pixels</strong></li>
				<li>Section No 3 : <strong>(400 - 600) pixels</strong></li>
				<li>...so on</li>
			</ul>
		</div>
	);
},
renderInfo = (that) => {
	let fn;
	if (that.state.selectedElement == 'section') {
		fn = renderSectionInfo();
	}
	return (
		<div>
			<h1 className="variation-section-heading">Information</h1>
			{ fn }
		</div>
	)
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
			<div style={{width: "65%", borderRight: "1px solid rgba(85, 85, 85, 0.3)", display: "inline-block"}}>
				<Field placeholder="Please enter section" name="section" component={renderField} type="number" label="Section No" onFocus={that.setFocusElement.bind(that)} onBlur={that.setFocusElement.bind(that)} />
				<Field placeholder="Please enter minDistanceFromPrevAd" name="minDistanceFromPrevAd" component={renderField} type="number" label="minDistanceFromPrevAd" />
				<Row>
					<Col xs={12} className="u-padding-r10px">
						<Row>
							<Col xs={5} className="u-padding-r10px"><strong>Ad Size</strong></Col>
							<Col xs={7} className="u-padding-r10px">
								<Field name="adSize" component="select" className="inputMinimal">
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
							<Col xs={12} className="u-padding-r10px">
								<Row>
									<Col xs={5} className="u-padding-r10px"><strong>Float</strong></Col>
									<Col xs={7} className="u-padding-r10px">
										<Field name="float" component="select" className="inputMinimal">
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
				{
					currentUser.userType !== 'partner'
					? renderNetworkOptions(that, CodeBoxField)
					: null
				}
				<Row>
					<FieldArray name="notNear" component={renderNotNear} />
				</Row>
				{
					currentUser.userType == 'partner'
					? (<Field placeholder="Custom Zone Id" name="customZoneId" component={renderField} type="number" label="Custom Zone Id" />)
					: null
				}
				<Row>
					<Col className="u-padding-r10px" style={{ marginTop: '30px', marginBottom: '30px', clear: 'both' }} xs={2}>
						<Button className="btn-lightBg btn-save btn-block" type="submit">Save</Button>
					</Col>
				</Row>
			</div>
			<div style={{width: "35%", padding: "0px 10px", display: "inline-block", verticalAlign: "top"}}>
				{
					that.state.selectedElement
					? renderInfo(that)
					: null
				}
			</div>
	    </form>
    )
}

export { renderInContentAdder };