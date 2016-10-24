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
							<Col className="u-padding-r10px" xs={4}>
								<input type="text" ref="editedText" placeholder="Enter Variation Name" defaultValue={this.props.text} />
								<span className="error-message">{this.state.inputError ? this.props.errorMessage : ''}</span>
							</Col>
							<Col className="u-padding-r10px" xs={2}>
								<Button onClick={this.submitValue.bind(this)} className="btn-lightBg btn-save btn-block btn btn-default">Save</Button>
							</Col>
						</Row>
					) : (
						<div>
							<strong>{this.props.text}</strong>
							<OverlayTrigger placement="bottom" overlay={<Tooltip id="edit-variation-tooltip">Rename Variation</Tooltip>}>
								<button onClick={this.triggerEdit.bind(this)} className="btn-icn-edit"></button>
							</OverlayTrigger>
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
	errorMessage: PropTypes.string.isRequired
};

InlineEdit.defaultProps = {
	errorMessage: 'Input field cannot be blank'
};

export default InlineEdit;
