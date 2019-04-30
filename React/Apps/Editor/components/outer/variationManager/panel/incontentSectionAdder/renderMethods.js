// In-content section adder render methods

import { Field, FieldArray } from 'redux-form';
import { Row, Col, Button } from 'react-bootstrap';
import CodeBox from 'shared/codeBox';
import SelectBox from 'shared/select/select';
import { networks } from 'consts/commonConsts';
import NetworkOptions from 'shared/networkOptions/NetworkOptions';

const renderField = field => {
		return (
			<div>
				<Col xs={12} className="u-padding-r10px">
					<Row>
						<Col xs={5} className="u-padding-r10px">
							<strong>{field.label}</strong>
						</Col>
						<Col xs={7} className="u-padding-r10px">
							<input
								type={field.type}
								placeholder={field.placeholder}
								{...field.input}
								className="inputMinimal"
							/>
							{field.meta.touched && field.meta.error && (
								<div className="error-message">{field.meta.error}</div>
							)}
						</Col>
					</Row>
				</Col>
			</div>
		);
	},
	renderTextAreaField = field => {
		return (
			<div>
				<Col xs={12} className="u-padding-r10px">
					<Row>
						<Col xs={5} className="u-padding-r10px">
							<strong>{field.label}</strong>
						</Col>
						<Col xs={7} className="u-padding-r10px">
							<textarea
								placeholder={field.placeholder}
								{...field.input}
								rows="6"
								className="inputMinimal"
							/>
							{field.meta.touched && field.meta.error && (
								<div className="error-message">{field.meta.error}</div>
							)}
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
						<Button className="btn-lightBg" type="button" onClick={() => fields.push({})}>
							Add property
						</Button>
					</Col>
					{touched && error && <span>{error}</span>}
				</Col>
			</li>
			<div className="mB-10" style={{ clear: 'both' }} />
			{fields.map((property, index) => (
				<li className="u-margin-b15px" key={index}>
					<Field
						name={`${property}.selector`}
						type="text"
						component={renderField}
						label="HTML selector"
						placeholder="For example, .paragraph"
					/>
					<Field
						name={`${property}.pixels`}
						type="text"
						component={renderField}
						label="Pixel distance from selector"
						placeholder="For example, 300"
					/>
					<Button className="btn-lightBg" type="button" onClick={() => fields.remove(index)}>
						Remove property
					</Button>
				</li>
			))}
		</ul>
	),
	renderNetworkOptions = that => {
		return (
			<Row>
				<Col xs={12} className="u-padding-r10px" style={{ marginBottom: '50px' }}>
					<Row>
						<Col xs={5} className="u-padding-r10px">
							<strong>Select Network</strong>
						</Col>
						<Col xs={7} className="u-padding-r10px mb-10 incontent-network-code-box">
							<NetworkOptions
								onSubmit={networkObj => that.setNetwork(networkObj)}
								onCancel={() => {}}
								buttonType={2}
								fromPanel={true}
								showNotification={that.props.showNotification}
								isInsertMode={true}
								zonesData={that.props.zonesData}
							/>
						</Col>
					</Row>
				</Col>
			</Row>
		);
	},
	renderSectionInfo = () => {
		return (
			<div>
				<p>
					Each <strong>Section no</strong> maps to a minimum bracket of 600 pixels in reference to the content
					selector. The bracket increases by 100 pixels for successive section numbers. i.e.
				</p>
				<ul>
					<li>
						Section No 1 : <strong>(0 - 600) pixels</strong>
					</li>
					<li>
						Section No 2 : <strong>(500 - 1200) pixels</strong>
					</li>
					<li>
						Section No 3 : <strong>(1000 - 1800) pixels</strong>
					</li>
					<li>
						Section No 4 : <strong>(1500 - 2400) pixels</strong>
					</li>
					<li>...and so on</li>
				</ul>
			</div>
		);
	},
	renderInfo = that => {
		let fn;
		if (that.state.selectedElement == 'section') {
			fn = renderSectionInfo();
		}
		return (
			<div>
				<h1 className="variation-section-heading">Information</h1>
				{fn}
			</div>
		);
	},
	renderInContentAdder = (that, getSupportedSizes) => {
		return (
			<form>
				<h1 className="variation-section-heading">Add Incontent Section</h1>
				<div style={{ width: '65%', borderRight: '1px solid rgba(85, 85, 85, 0.3)', display: 'inline-block' }}>
					<Field
						placeholder="Please enter section"
						name="section"
						component={renderField}
						type="number"
						label="Section No"
						onFocus={that.setFocusElement.bind(that)}
						onBlur={that.setFocusElement.bind(that)}
					/>
					<Field
						placeholder="Please enter section name"
						name="name"
						component={renderField}
						type="text"
						label="Section Name"
						onFocus={that.setFocusElement.bind(that)}
						onBlur={that.setFocusElement.bind(that)}
					/>
					<Field
						placeholder="Please enter minDistanceFromPrevAd"
						name="minDistanceFromPrevAd"
						component={renderField}
						type="number"
						label="minDistanceFromPrevAd"
					/>
					<Row>
						<Col xs={12} className="u-padding-r10px">
							<Row>
								<Col xs={5} className="u-padding-r10px">
									<strong>Ad Size</strong>
								</Col>
								<Col xs={7} className="u-padding-r10px">
									<Field name="adSize" component="select" className="inputMinimal">
										{getSupportedSizes(that.props.customSizes).map((pos, index) => (
											<option key={index} name={pos}>
												{pos}
											</option>
										))}
									</Field>
								</Col>
							</Row>
						</Col>
					</Row>
					{that.props.activeChannel.platform !== 'MOBILE' ? (
						<Row>
							<Col xs={12} className="u-padding-r10px">
								<Row>
									<Col xs={5} className="u-padding-r10px">
										<strong>Float</strong>
									</Col>
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
					) : null}
					<Row>
						<FieldArray name="notNear" component={renderNotNear} />
					</Row>
					<Row>
						<Field
							name="customCSS"
							placeholder="Please enter customCSS"
							label="customCSS"
							component={renderTextAreaField}
						/>
					</Row>
					{renderNetworkOptions(that)}
				</div>
				<div style={{ width: '35%', padding: '0px 10px', display: 'inline-block', verticalAlign: 'top' }}>
					{that.state.selectedElement ? renderInfo(that) : null}
				</div>
			</form>
		);
	};

export { renderInContentAdder };
