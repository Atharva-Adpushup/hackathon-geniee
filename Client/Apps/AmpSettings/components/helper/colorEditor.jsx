import React, { PropTypes } from 'react';
import { Row, Col, Button } from '@/Client/helpers/react-bootstrap-imports';
import reactCSS from 'reactcss';
import ColorPicker from './ColorPicker.jsx';

class ColorEditor extends React.Component {
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

	formatCss = () => {
		let formatedStr = Object.entries(this.state).reduce((styleString, [propName, propValue]) => {
			if (propValue) return `${styleString}${propName}:${propValue};`;
			else return `${styleString}`;
		}, '');
		this.props.handleSubmit(formatedStr);
	};
	render = () => {
		let { props } = this;
		return (
			<div>
				<div className="manualSettings">
					<Row className="cssPropertiesWrap">
						<Col xs={12} className="mB-5">
							Border:
						</Col>
						<Col xs={12}>
							<Row className="cssPropertiesWrapInner">
								<Col xs={3} className="pd-2 mB-5">
									<input
										type="text"
										name="border-left"
										value={this.state['border-left'] || ''}
										onChange={this.handleOnChange}
									/>
									<span>Left</span>
								</Col>
								<Col xs={3} className="pd-2 mB-5">
									<input
										type="text"
										name="border-right"
										value={this.state['border-right'] || ''}
										onChange={this.handleOnChange}
									/>
									<span>Right</span>
								</Col>
								<Col xs={3} className="pd-2 mB-5">
									<input
										type="text"
										name="border-top"
										value={this.state['border-top'] || ''}
										onChange={this.handleOnChange}
									/>
									<span>Top</span>
								</Col>
								<Col xs={3} className="pd-2 mB-5">
									<input
										type="text"
										name="border-bottom"
										value={this.state['border-bottom'] || ''}
										onChange={this.handleOnChange}
									/>
									<span>Bottom</span>
								</Col>
								<Col xs={6} className="pd-2">
									<ColorPicker
										value={this.state['border-color'] || '#fff'}
										handleChange={color => {
											this.setState({ ['border-color']: color.hex });
										}}
									/>
									<span>Color</span>
								</Col>
								<Col xs={6} className="pd-2">
									<select
										className="form-control"
										name="border-style"
										value={this.state['border-style'] || ''}
										onChange={this.handleOnChange}
									>
										<option value="none">none</option>
										<option value="hidden">hidden</option>
										<option value="dotted">dotted</option>
										<option value="dashed">dashed</option>
									</select>
									<span>Style</span>
								</Col>
							</Row>
						</Col>
					</Row>
				</div>
				<div className="manualSettings">
					<Row className="cssPropertiesWrap">
						<Col xs={12} className="mB-5">
							Background:
						</Col>
						<Col xs={12}>
							<Row className="cssPropertiesWrapInner">

								<Col xs={12} className="pd-2 mB-5">
									<input
										type="text"
										name="background-image"
										value={this.state['background-image'] || ''}
										onChange={this.handleOnChange}
									/>
									<span>Image Url</span>
								</Col>
								<Col xs={3} className="pd-2 mB-5">
									<input
										type="text"
										name="background-origin"
										value={this.state['background-origin'] || ''}
										onChange={this.handleOnChange}
									/>
									<span>Image Origin</span>
								</Col>
								<Col xs={3} className="pd-2 mB-5">
									<input
										type="text"
										name="background-position"
										value={this.state['background-position'] || ''}
										onChange={this.handleOnChange}
									/>
									<span>Image Position</span>
								</Col>
								<Col xs={3} className="pd-2 mB-5">
									<input
										type="text"
										name="background-repeat"
										value={this.state['background-repeat'] || ''}
										onChange={this.handleOnChange}
									/>
									<span>Image Repeat</span>
								</Col>
								<Col xs={3} className="pd-2 mB-5">
									<input
										type="text"
										name="background-size"
										value={this.state['background-size'] || ''}
										onChange={this.handleOnChange}
									/>
									<span>Image Size</span>
								</Col>
								<Col xs={6} className="pd-2">
									<input
										type="text"
										name="background-attachment"
										value={this.state['background-attachment'] || ''}
										onChange={this.handleOnChange}
									/>
									<span>Image Attachment</span>
								</Col>
								<Col xs={6} className="pd-2">
									<ColorPicker
										value={this.state['background-color'] || '#fff'}
										handleChange={color => {
											this.setState({ ['background-color']: color.hex });
										}}
									/>
									<span>Color</span>
								</Col>
							</Row>
						</Col>
					</Row>
				</div>
				<div className="manualSettings">
					<Row className="cssPropertiesWrap">
						<Col xs={4} className="mB-5">
							Color:
						</Col>
						<Col xs={8}>
							<ColorPicker
								value={this.state['color'] || '#fff'}
								handleChange={color => {
									this.setState({ color: color.hex });
								}}
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
	};
}

export default ColorEditor;
