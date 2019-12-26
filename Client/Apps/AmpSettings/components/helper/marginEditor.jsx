import React, { PropTypes } from 'react';
import { Row, Col, Button } from '@/Client/helpers/react-bootstrap-imports';

class MarginEditor extends React.Component {
	constructor(props) {
		super(props);
		this.state = this.getFormattedCss(props.css);
	}

	componentWillReceiveProps() {
		let { props } = this, css = props.css;
		this.setState(this.getFormattedCss(css));
	}

	getFormattedCss(css) {
		let formatData = {};
		if (css) {
			css = css.split(';');
			for (let value of css) {
				let property = value.split(':');
				formatData[property[0]] = property[1];
			}
		}
		return formatData;
	}

	handleOnChange = e => {
		const target = e.target, name = target.name, value = target.value;
		this.setState({ [name]: value });
	};

	setAlignment = ({ name, value }) => {
		this.setState({ [name]: value });
	};
	formatCss = () => {
		let formatedStr = Object.entries(this.state).reduce((styleString, [propName, propValue]) => {
			if (propValue) return `${styleString}${propName}:${propValue};`;
			else return `${styleString}`;
		}, '');
		this.props.handleSubmit(formatedStr);
	};

	render() {
		let { props } = this;
		const fontStyle = {
			textAlign: 'center',
			border: '1px solid #e6e6e6'
		};
		return (
			<div>
				<div className="manualSettings">
					<Row className="cssPropertiesWrap">
						<Col xs={12} className="mB-5">
							Margin:
						</Col>
						<Col xs={12}>
							<Row className="cssPropertiesWrapInner">
								<Col xs={3} className="pd-2">
									<input
										name="margin-left"
										type="text"
										value={this.state['margin-left'] || ''}
										onChange={this.handleOnChange}
									/>
									<span>Left</span>
								</Col>
								<Col xs={3} className="pd-2">
									<input
										name="margin-right"
										type="text"
										value={this.state['margin-right'] || ''}
										onChange={this.handleOnChange}
									/>
									<span>Right</span>
								</Col>
								<Col xs={3} className="pd-2">
									<input
										name="margin-top"
										type="text"
										value={this.state['margin-top'] || ''}
										onChange={this.handleOnChange}
									/>
									<span>Top</span>
								</Col>
								<Col xs={3} className="pd-2">
									<input
										name="margin-bottom"
										type="text"
										value={this.state['margin-bottom'] || ''}
										onChange={this.handleOnChange}
									/>
									<span>Bottom</span>
								</Col>
							</Row>
						</Col>
					</Row>
				</div>
				<div className="manualSettings">
					<Row className="cssPropertiesWrap">
						<Col xs={12} className="mB-5">
							Padding:
						</Col>
						<Col xs={12}>
							<Row className="cssPropertiesWrapInner">
								<Col xs={3} className="pd-2">
									<input
										name="padding-left"
										value={this.state['padding-left'] || ''}
										onChange={this.handleOnChange}
										type="text"
									/>
									<span>Left</span>
								</Col>
								<Col xs={3} className="pd-2">
									<input
										name="padding-right"
										value={this.state['padding-right'] || ''}
										onChange={this.handleOnChange}
										type="text"
									/>
									<span>Right</span>
								</Col>
								<Col xs={3} className="pd-2">
									<input
										name="padding-top"
										value={this.state['padding-top'] || ''}
										onChange={this.handleOnChange}
										type="text"
									/>
									<span>Top</span>
								</Col>
								<Col xs={3} className="pd-2">
									<input
										name="padding-bottom"
										value={this.state['padding-bottom'] || ''}
										onChange={this.handleOnChange}
										type="text"
									/>
									<span>Bottom</span>
								</Col>
							</Row>
						</Col>
					</Row>
				</div>
				<div className="manualSettings">
					<Row className="cssPropertiesWrap">
						<Col xs={12} className="mB-5">
							Text Alignment:
						</Col>
						<Col xs={12}>

							<Row className="cssPropertiesWrapInner">
								<Col xs={4} className="pd-0 btnCol">
									<Button
										className="btn-align btn-align-left"
										type="button"
										onClick={() => this.setAlignment({ name: 'text-align', value: 'left' })}
									>
										Left
									</Button>
								</Col>
								<Col xs={4} className="pd-0 btnCol">
									<Button
										className="btn-align btn-align-center"
										type="button"
										onClick={() => this.setAlignment({ name: 'text-align', value: 'center' })}
									>
										Center
									</Button>
								</Col>
								<Col xs={4} className="pd-0 btnCol">
									<Button
										className="btn-align btn-align-right"
										type="button"
										onClick={() => this.setAlignment({ name: 'text-align', value: 'right' })}
									>
										Right
									</Button>
								</Col>
							</Row>
						</Col>
					</Row>

				</div>

				<div className="manualSettings">
					<Row className="cssPropertiesWrap">
						<Col xs={12} className="mB-5">
							Font:
						</Col>
						<Col xs={12}>

							<Row className="cssPropertiesWrapInner">
								<Col xs={6} className="pd-2">
									<input
										name="font-size"
										value={this.state['font-size'] || ''}
										onChange={this.handleOnChange}
										type="text"
									/>
									<span>Size</span>
								</Col>
								<Col xs={6} className="pd-2">
									<input
										name="font-weight"
										value={this.state['font-weight'] || ''}
										onChange={this.handleOnChange}
										type="text"
									/>
									<span>Weight</span>
								</Col>
							</Row>
						</Col>

					</Row>

				</div>
				<div className="manualSettings">
					<Row className="cssPropertiesWrap">
						<Col xs={6} className="mB-5">
							Line Height:
						</Col>
						<Col xs={6} className="pd-2 cssPropertiesWrapInner">
							<input
								name="line-height"
								value={this.state['line-height'] || ''}
								onChange={this.handleOnChange}
								type="text"
							/>

						</Col>

					</Row>

				</div>
				<Row>
					<Col xs={6}>
						<Button type="button" className="btn-lightBg btn-save " onClick={this.formatCss}>
							Save Css
						</Button>
					</Col>
					<Col xs={6}>
						<Button type="button" className="btn-lightBg btn-cancel " onClick={props.onCancel}>
							Cancel
						</Button>
					</Col>
				</Row>

			</div>
		);
	}
}

export default MarginEditor;
