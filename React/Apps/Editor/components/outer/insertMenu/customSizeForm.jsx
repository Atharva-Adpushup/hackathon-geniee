import React, { PropTypes } from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import $ from 'jquery';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';
import Button from 'react-bootstrap/lib/Button';

class CustomSizeForm extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			toggleFormVisibility: false,
			height: 0,
			width: 0
		};
		this.policiesPassed = this.policiesPassed.bind(this);
	}

	policiesPassed() {
		const height = this.state.height,
			width = this.state.width,
			isWidth = !!(width),
			isHeight = !!(height),
			isDimensions = !!(isWidth && isHeight),
			isDimensionsLessThanZero = !!(isDimensions && (height <= 0 || width <= 0));

		if (!isDimensions || isDimensionsLessThanZero) {
			return false;
		}
		// Below code is commented as not required right now
		// /*Only one dimension can be greater than 300 pixels
		//  The minimum width is 120 pixels
		//  The minimum height is 50 pixels
		//  Neither height nor width can exceed 1200 pixels.*/
		// if (
		// 	this.state.width >= 120 &&
		// 	this.state.width <= 1200 &&
		// 	(this.state.height >= 50 && this.state.height <= 1200)
		// ) {
		// 	if (this.state.height > 300 && this.state.width > 300) {
		// 		return false;
		// 	}
		// 	return true;
		// }

		return true;
	}

	toggleForm() {
		this.setState({ toggleFormVisibility: !this.state.toggleFormVisibility }, () => {
			// this.props.updateMenu();
		});
	}

	save() {
		const self = this,
			adSize = {
				width: self.state.width,
				height: self.state.height
			};

		this.props.onSave(adSize, true);
	}

	// renderPolicyInfoTip() {
	// 	return (
	// 		<OverlayTrigger placement='bottom' overlay={<Tooltip><div>Only one dimension can be greater than 300 pixels.<br/>The minimum width is 120 pixels.<br/>The minimum height is 50 pixels.<br/>Neither height nor width can exceed 1200 pixels.</div></Tooltip>}>
	// 			<i style={{"margin":"5px"}} className="fa fa-info"/>
	// 		</OverlayTrigger>
	// 	);
	// }

	handleOnChange(e, identifier) {
		//NOTE: For below 'persist()', refer to this guide https://facebook.github.io/react/docs/events.html
		e.persist();
		const $targetEl = $(e.target),
			value = parseInt($targetEl.val(), 10);

		switch (identifier) {
			case 'width':
				this.setState({ width: value });
				break;

			case 'height':
				this.setState({ height: value });
				break;

			default:
				break;
		}
	}

	render() {
		if (!this.state.toggleFormVisibility) {
			return (
				<div>
					<Row style={{ textAlign: 'center' }}>
						<Col xs={12}>
							<Button className="btn-lightBg btn-add" onClick={a => this.toggleForm(a)}>
								Add New Size
							</Button>
						</Col>
					</Row>
				</div>
			);
		}
		const policiesPassed = this.policiesPassed();
		return (
			<div className="sm-pad" style={{ backgroundColor: 'rgba(85, 85, 85, 0.05)' }}>
				<Row>
					<Col xs={6}>
						<b>Width</b>
					</Col>
					<Col xs={6}>
						<b>Height</b>
					</Col>
				</Row>
				<Row>
					<Col xs={6}>
						<input
							style={{ width: '100%' }}
							onChange={a => this.handleOnChange(a, 'width')}
							placeholder="Width"
							type="number"
						/>
					</Col>
					<Col xs={6}>
						<input
							style={{ width: '100%' }}
							onChange={a => this.handleOnChange(a, 'height')}
							placeholder="Height"
							type="number"
						/>
					</Col>
				</Row>
				<Row style={{ textAlign: 'center' }}>
					<Col xs={12}>
						<Button
							disabled={!policiesPassed ? 'disabled' : ''}
							className="btn-lightBg btn-add"
							onClick={a => this.save(a)}
						>
							ADD
						</Button>
						{/****this.props.isApex ? null : this.renderPolicyInfoTip()***/}
					</Col>
				</Row>
			</div>
		);
	}
}

export default CustomSizeForm;
