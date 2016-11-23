import React, { PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import SelectBox from 'shared/select/select.js';
import CustomToggleSwitch from 'components/shared/customToggleSwitch.jsx';
import LabelWithButton from 'components/shared/labelWithButton.jsx';
import CodeBox from 'shared/codeBox';

const positions = ['Unknown', 'Header', 'Under the article/column', 'Sidebar', 'Footer'];

class sectionOptions extends React.Component {
	constructor(props) {
		super(props);
		// Bind all methods 'this' so that 'this' keyword inside
		// them correctly points to class instance object while execution
		this.onSave = this.onSave.bind(this);
		this.onChange = this.onChange.bind(this);
		this.onFirstFoldChange = this.onFirstFoldChange.bind(this);
		this.toggleCustomAdCode = this.toggleCustomAdCode.bind(this);
		this.onCustomAdCodeChange = this.onCustomAdCodeChange.bind(this);
		// Set initial state
		this.state = {
			position: undefined,
			isAdInFirstFold: (props.firstFold || false),
			isAdAsync: true,
			manageCustomCode: false,
			customAdCode: ''
		};
	}

	onSave() {
		this.props.onCreateAd(this.state.position, this.state.customAdCode, this.state.isAdInFirstFold, this.state.isAdAsync);
	}

	onChange(position) {
		this.setState({ position });
	}

	onFirstFoldChange() {
		this.setState({
			isAdInFirstFold: !this.state.isAdInFirstFold
		});
	}

	onCustomAdCodeChange(adCode) {
		this.setState({
			customAdCode: adCode
		}, () => {
			this.toggleCustomAdCode();
		});
	}

	toggleCustomAdCode() {
		this.setState({
			manageCustomCode: !this.state.manageCustomCode
		});
	}

	render() {
		const customAdCodeText = (this.state.customAdCode ? 'Edit' : 'Add'),
			isAdCreateBtnDisabled = !!((this.state.position !== null) && (typeof this.state.position !== 'undefined'));

		if (this.state.manageCustomCode) {
			return (<CodeBox code={this.state.customAdCode} onSubmit={this.onCustomAdCodeChange} onCancel={this.toggleCustomAdCode} />);
		}

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
				<LabelWithButton name="customAdCode" className="u-margin-t15px u-margin-b15px" onButtonClick={this.toggleCustomAdCode} labelText="Custom Ad code" layout="horizontal" buttonText={customAdCodeText} />
				<Row className="butttonsRow">
					<Col xs={6}>
						<Button className="btn-lightBg btn-cancel btn-block" onClick={this.props.onCancel}>Back</Button>
					</Col>
					<Col xs={6}>
						<Button disabled={!(isAdCreateBtnDisabled)} className="btn-lightBg btn-save btn-block" onClick={this.onSave}>Create Ad</Button>
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
