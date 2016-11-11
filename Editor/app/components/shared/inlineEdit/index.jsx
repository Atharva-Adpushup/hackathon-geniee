import React, { PropTypes } from 'react';
import { Row, Col, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

class InlineEdit extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			editMode: false,
			inputError: false
		};
	}

	triggerEdit() {
		this.setState({ editMode: true });
	}

	cancelEdit() {
		this.setState({ editMode: false });
	}

	submitValue() {
		if (!this.refs.editedText.value) {
			this.setState({ inputError: true });
			return;
		}

		this.setState({ editMode: false, inputError: false });
		this.props.submitHandler(this.refs.editedText.value);
	}

	render() {
		return (
			<div>
				{
					this.state.editMode ? (
						<Row>
							<Col className="u-padding-r10px" xs={6}>
								<input type="text" ref="editedText" placeholder={this.props.text} defaultValue={this.props.value} />
								<span className="error-message">{this.state.inputError ? this.props.errorMessage : ''}</span>
							</Col>
							<Col className="u-padding-r5px" xs={4}>
								<Button onClick={this.submitValue.bind(this)} className="btn-lightBg btn-save btn-block btn btn-default">Save</Button>
							</Col>
							<Col className="u-padding-r10px " xs={2}>
								<Button onClick={this.cancelEdit.bind(this)} className="btn-lightBg btn-cancel btn-ie-cancel btn-block btn btn-default"></Button>
							</Col>
						</Row>
					) : (
						<div>
							<strong>{this.props.value}</strong>
							{
								this.props.text ? (
									<OverlayTrigger placement="bottom" overlay={<Tooltip id="edit-variation-tooltip">Edit {this.props.text}</Tooltip>}>
										<button onClick={this.triggerEdit.bind(this)} className="btn-icn-edit"></button>
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
	value: PropTypes.string.isRequired
};

InlineEdit.defaultProps = {
	errorMessage: 'Input field cannot be blank'
};

export default InlineEdit;
