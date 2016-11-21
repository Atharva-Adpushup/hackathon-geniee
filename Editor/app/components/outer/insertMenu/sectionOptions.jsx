import React, { PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import SelectBox from 'shared/select/select.js';
import CustomToggleSwitch from 'components/shared/customToggleSwitch.jsx';

const positions = ['Unknown', 'Header', 'Under the article/column', 'Sidebar', 'Footer'];

class sectionOptions extends React.Component {
	constructor(props) {
		super(props);
		this.onSave = this.onSave.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onFirstFoldChange = this.onFirstFoldChange.bind(this);
		this.state = {
			position: null,
			isAdInFirstFold: (props.adInFirstFold || false),
			isAdAsync: true
		};
	}

	onSave() {
		this.props.onCreateAd(this.state.position, null, this.state.isAdInFirstFold, this.state.isAdAsync);
	}

	onChange(position) {
		this.setState({ position });
	}

	onFirstFoldChange() {
		this.setState({
			isAdInFirstFold: !this.state.isAdInFirstFold
		});
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
				<CustomToggleSwitch labelText="First fold" className="u-margin-t15px u-margin-b15px" defaultLayout checked={this.state.isAdInFirstFold} name="adInFirstFold" onChange={this.onFirstFoldChange} layout="horizontal" size="m" id="js-ad-in-first-fold" on="Yes" off="No" />
				<CustomToggleSwitch labelText="Async tag" className="u-margin-t15px u-margin-b15px" disabled defaultLayout checked={this.state.isAdAsync} name="adIsAsync" layout="horizontal" size="m" id="js-ad-is-async" on="Yes" off="No" />
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
