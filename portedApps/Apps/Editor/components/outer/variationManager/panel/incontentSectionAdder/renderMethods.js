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
								networkConfig={that.props.networkConfig}
								ad={{...that.getAdSize()}} // Passing sizes for isResponsive flag
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
				<p className="u-margin-b15px">
					Each <strong>Section no</strong> maps to a minimum bracket of default pixels (600 on DESKTOP, 450 on
					MOBILE) with reference to the content selector. Every section is calculated using either of two
					techniques named <strong>Even Spacing</strong> and <strong>Equal Brackets</strong>.{' '}
					<i>
						Even Spacing is applied first and Equal Brackets is applied as fallback if the former gets
						failed.
					</i>
				</p>
				<p>
					<strong>Even Spacing</strong> technique divides <mark>content selector height</mark> with{' '}
					<mark>number of sections</mark> defined in configuration. If resulting value is greater than or
					equal to user defined section bracket value, only then this technique is applied. <br />
					For example, computed section brackets for <mark>content selector height of 2500px</mark> with{' '}
					<mark>4 sections</mark> and <mark>default section bracket of 600px</mark> are as follows
				</p>
				<ul>
					<li>
						Section No 1 : <strong>(0 - 625) pixels</strong>
					</li>
					<li>
						Section No 2 : <strong>(625 - 1250) pixels</strong>
					</li>
					<li>
						Section No 3 : <strong>(1250 - 1875) pixels</strong>
					</li>
					<li>
						Section No 4 : <strong>(1875 - 2500) pixels</strong>
					</li>
				</ul>

				<p className="u-margin-t15px">
					<strong>Equal Brackets</strong> technique uses <mark>section bracket</mark> value defined in
					configuration. This technique is applied when <strong>Even Spacing</strong> technique fails.
					<br />
					For example, computed section brackets for <mark>content selector height of 2100px</mark> with{' '}
					<mark>4 sections</mark> and <mark>default section bracket of 600px</mark> are as follows
				</p>
				<ul>
					<li>
						Section No 1 : <strong>(0 - 600) pixels</strong>
					</li>
					<li>
						Section No 2 : <strong>(600 - 1200) pixels</strong>
					</li>
					<li>
						Section No 3 : <strong>(1200 - 1800) pixels</strong>
					</li>
				</ul>
			</div>
		);
	},
	renderCustomAdSizeInfo = () => {
		return (
			<div>
				<p>
					If valid custom ad size <strong>width</strong> and <strong>height</strong> values are entered,
					<mark>Ad Size</mark> dropdown value will be ignored.
				</p>
			</div>
		);
	},
	renderInfo = that => {
		let fn;
		const selectedElement = that.state.selectedElement;
		const isSectionElement = !!(selectedElement === 'section' || selectedElement === 'name');
		const isCustomAdSizeElement = !!(
			selectedElement === 'customAdSizeWidth' || selectedElement === 'customAdSizeHeight'
		);

		if (isSectionElement) {
			fn = renderSectionInfo();
		} else if (isCustomAdSizeElement) {
			fn = renderCustomAdSizeInfo();
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
						label="Minimum distance from previous ad"
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
					<Field
						placeholder="Please enter custom ad size width"
						name="customAdSizeWidth"
						component={renderField}
						type="number"
						label="Custom ad size width"
						onFocus={that.setFocusElement.bind(that)}
						onBlur={that.setFocusElement.bind(that)}
					/>
					<Field
						placeholder="Please enter custom ad size height"
						name="customAdSizeHeight"
						component={renderField}
						type="number"
						label="Custom ad size height"
						onFocus={that.setFocusElement.bind(that)}
						onBlur={that.setFocusElement.bind(that)}
					/>

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
