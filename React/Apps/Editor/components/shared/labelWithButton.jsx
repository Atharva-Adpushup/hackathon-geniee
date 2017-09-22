import React, { PropTypes } from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import Button from 'react-bootstrap/lib/Button';

class labelWithButton extends React.Component {
	renderHorizontalLayout() {
		return (
			<div className="clearfix">
				<Col xs={8}>
					<b>{this.props.labelText}</b>
				</Col>
				<Col className="u-padding-l10px" xs={4}>
					<Button className="btn-lightBg" onClick={this.props.onButtonClick}>
						{this.props.buttonText}
					</Button>
				</Col>
			</div>
		);
	}

	renderVerticalLayout() {
		return (
			<div className="clearfix">
				<Col className="u-padding-b5px" xs={12} md={12}>
					<b>{this.props.labelText}</b>
				</Col>
				<Col className="u-padding-0px" xs={12} md={12}>
					<Button className="btn-lightBg" onClick={this.props.onButtonClick}>
						{this.props.buttonText}
					</Button>
				</Col>
			</div>
		);
	}

	render() {
		const options = {
			layout: this.props.layout.toLowerCase() ? this.props.layout.toLowerCase() : 'horizontal',
			layoutClassName: 'form-group',
			classNamesProps: this.props.className && this.props.className.length > 0 ? this.props.className : ''
		};

		if (options.layout === 'vertical') {
			options.layoutClassName += ' form-group--vertical';
		} else if (options.layout === 'horizontal') {
			options.layoutClassName += ' form-group--horizontal';
		}

		// Concatenate props class names
		options.layoutClassName += ` ${options.classNamesProps}`;

		return (
			<Row key={this.props.name} className={options.layoutClassName}>
				{options.layout === 'vertical' ? this.renderVerticalLayout() : this.renderHorizontalLayout()}
			</Row>
		);
	}
}

labelWithButton.defaultProps = {
	name: 'labelWithButton',
	labelText: 'Custom Label',
	layout: 'horizontal',
	buttonText: 'button'
};

labelWithButton.propTypes = {
	name: PropTypes.string,
	labelText: PropTypes.string,
	layout: PropTypes.string,
	buttonText: PropTypes.string,
	onButtonClick: PropTypes.func
};

export default labelWithButton;
