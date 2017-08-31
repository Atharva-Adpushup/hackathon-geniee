import React, { Component, PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import CodeBox from 'shared/codeBox';
import SelectBox from 'shared/select/select';
import AdpTags from './AdpTags';

class NetworkOptions extends Component {
	constructor(props) {
		super(props);
		this.state = { network: this.props.ad && this.props.ad.network ? this.props.ad.network : false }
		this.onChange = this.onChange.bind(this);
		this.submitHandler = this.submitHandler.bind(this);
	}

	onChange(value) {
		this.setState({ network: value });
	}

	submitHandler(value, isCodeBox = true) {
		this.props.adDescriptor
		?
			isCodeBox
			? this.props.onSubmit(value, this.state.network, false)
			: this.props.onSubmit(value, this.state.network, true)
		:
			isCodeBox
			? this.props.onSubmit(null, value, null, null, null, null, this.state.network)
			: this.props.onSubmit(null, null, null, null, null, value, this.state.network)
	}

	render() {
		const dropDownItems = ['Adsense', 'ADX', 'ADP Tags', 'DFP', 'Critieo', 'Custom'];
		let code = this.props.ad && this.props.ad.adCode ? this.props.ad.adCode : "";
		return (
			<div className="networkOptionsRow">
				<SelectBox value={this.state.network} label="Select Network" onChange={this.onChange}>
					{
						dropDownItems.map((item, index) => (
							<option key={index} value={item}>{item}</option>
						))
					}
				</SelectBox>
				{
					this.state.network == 'ADP Tags'
					? <AdpTags value={this.props.ad && this.props.ad.networkData && this.props.ad.networkData.priceFloor ? this.props.ad.networkData.priceFloor : 0} showButtons={true} submitHandler={this.submitHandler} onCancel={this.props.onCancel} />
					: this.state.network
						? 
							(
								<div className="mT-10">
									<CodeBox showButtons={true} onSubmit={this.submitHandler} onCancel={this.props.onCancel} code={code} customClass="customButtonsRow" />
								</div>
							)
						: null
				}
			</div>
		);
	}
}

export default NetworkOptions;

/* 
	New
		Select Ad Size
			Select Network
				if ADP Tag then
					show Price Floor input
				else
					show AdCode
			then save
	Edit
		if ADP Tag then 
			show Price Floor input 
		else
			show AdCode
		then save

	Write to DB on master save
*/