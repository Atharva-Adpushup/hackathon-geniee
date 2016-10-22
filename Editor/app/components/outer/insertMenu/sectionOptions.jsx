import React, { PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import SelectBox from 'shared/select/select.js';

const positions = ['Unknown', 'Header', 'Under the article/column', 'Sidebar', 'Footer'];

class sectionOptions extends React.Component {
	constructor(props) {
		super(props);
		this.onSave = this.onSave.bind(this);
		this.onChange = this.onChange.bind(this);
		this.state = {
			position: null
		};
	}

	onSave() {
		this.props.onCreateAd(this.state.position);
	}

	onChange(position) {
		this.setState({ position });
	}

	render() {
		return (
			<div className="containerButtonBar sectionOptions">
				<Row>
					<Col md={3}><b>Position</b></Col>
					<Col md={9}>
						<SelectBox value={this.state.position} label="Select Position" onChange={this.onChange}>
							{
								positions.map((position, index) => (
									<option key={index} value={index}>{position}</option>
								))
							}
						</SelectBox>
					</Col>
				</Row>
				<Row className="butttonsRow">
					<Col xs={6}>
						<Button className="btn-lightBg btn-cancel btn-block" onClick={this.props.onCancel}>Back</Button>
					</Col>
					<Col xs={6}>
						<Button disabled={!(!!this.state.position)} className="btn-lightBg btn-save btn-block" onClick={this.onSave}>Create Ad</Button>
					</Col>
				</Row>
			</div>
		);
	}

}

sectionOptions.propTypes = {
	onCreateAd: PropTypes.func.isRequired,
	onCancel: PropTypes.func.isRequired
};

export default sectionOptions;
