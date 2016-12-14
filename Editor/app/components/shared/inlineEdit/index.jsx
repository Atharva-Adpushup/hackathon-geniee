import React, { PropTypes } from 'react';
import { Row, Col, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import './inlineEdit.scss';
import requiredIf from 'react-required-if';

class InlineEdit extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			editMode: false,
			inputError: false,
			disableSave: false
		};
	}

	triggerEdit() {
		this.setState({ editMode: true });
	}

	cancelEdit() {
		this.setState({ editMode: false, inputError: false });
	}

	submitValue() {
		if (!this.refs.editedText.value) {
			this.setState({ inputError: true });
			return;
		}

		this.setState({ editMode: false, inputError: false });
		this.props.submitHandler(this.props.adCode ? btoa(this.refs.editedText.value) : this.refs.editedText.value);
	}

	changeValue() {
		const validated = this.props.validation(this.refs.editedText.value);
		!validated ? this.setState({ disableSave: true, inputError: true }) : this.setState({ disableSave: false, inputError: false });
	}

	render() {
		const colCompact = this.props.compact ? 12 : 6,
			adCodeStyles = {
				width: 150,
				textOverflow: 'ellipsis',
				whiteSpace: 'nowrap',
				overflow: 'hidden',
				display: 'inline-block'
			},
			adCodeEdit = {
				verticalAlign: 'super'
			},
			adCodeCheck = this.props.adCode ? (!this.props.value ? '' : atob(this.props.value)) : this.props.value;
		return (
			<div>
				{
					this.state.editMode ? (
						<Row style={{margin: 0}}>
							<Col className="u-padding-r10px" xs={colCompact}>
								<input type="text" ref="editedText" placeholder={this.props.text} defaultValue={adCodeCheck} onChange={this.props.validation ? this.changeValue.bind(this) : ()=>{}} />
								<span className="error-message">{this.state.inputError ? (this.props.validationError ? this.props.validationError : this.props.errorMessage) : ''}</span>
							</Col>
							{
								this.props.compact ? (
									<div>
										<Col className="u-padding-r5px" xs={8}>
											<Button disabled={this.state.disableSave} onClick={this.submitValue.bind(this)} className="btn-lightBg btn-save btn-block btn btn-default">Save</Button>
										</Col>
										<Col className="u-padding-r10px " xs={4}>
											<Button onClick={this.cancelEdit.bind(this)} className="btn-lightBg btn-cancel btn-ie-cancel btn-block btn btn-default"></Button>
										</Col>
									</div>
								) : (
									<div>
										<Col className="u-padding-r5px" xs={4}>
											<Button onClick={this.submitValue.bind(this)} className="btn-lightBg btn-save btn-block btn btn-default">Save</Button>
										</Col>
										<Col className="u-padding-r10px " xs={2}>
											<Button onClick={this.cancelEdit.bind(this)} className="btn-lightBg btn-cancel btn-ie-cancel btn-block btn btn-default"></Button>
										</Col>
									</div>
								)
							}
						</Row>
					) : (
						<div>
							<strong style={{fontWeight: this.props.font ? this.props.font : 700}}>{
								this.props.value ? (
									<span style={ this.props.adCode ? adCodeStyles : {} }> {this.props.adCode ? atob(this.props.value) : this.props.value} </span>
								) : `Edit ${this.props.text}`
							}</strong>
							{
								this.props.text ? (
									<OverlayTrigger placement="bottom" overlay={<Tooltip id="edit-variation-tooltip">Edit {this.props.text}</Tooltip>}>
										<button style={ this.props.adCode ? adCodeEdit : {} } onClick={this.triggerEdit.bind(this)} className="btn-icn-edit"></button>
									</OverlayTrigger>
								) : <button onClick={this.triggerEdit.bind(this)} className="btn-icn-edit"></button>
							}
						</div>
					)
				}
			</div>
		);
	}
}

InlineEdit.propTypes = {
	text: PropTypes.string.isRequired,
	submitHandler: PropTypes.func.isRequired,
	errorMessage: PropTypes.string.isRequired,
	value: PropTypes.string.isRequired,
	compact: PropTypes.bool,
	font: PropTypes.number,
	validation: PropTypes.func,
	validationError: requiredIf(PropTypes.string, props => props.validation),
	adCode: PropTypes.bool
};

InlineEdit.defaultProps = {
	errorMessage: 'Input field cannot be blank'
};

export default InlineEdit;
