import React, { Component, PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import CodeBox from 'shared/codeBox';
import SelectBox from 'shared/select/select';
import AdpTags from './AdpTags';

class NetworkOptions extends Component {
	constructor(props) {
		super(props);
		this.state = { network: this.props.ad && this.props.ad.network ? this.props.ad.network : false };
		this.onChange = this.onChange.bind(this);
		this.submitHandler = this.submitHandler.bind(this);
	}

	onChange(value) {
		this.setState({ network: value });
	}

	componentDidMount() {
		if (this.props.onUpdate) {
			this.props.onUpdate();
		}
	}

	componentDidUpdate() {
		if (this.props.onUpdate) {
			this.props.onUpdate();
		}
	}

	submitHandler(value, isCodeBox = true, isHeaderBiddingActivated) {
		this.props.adDescriptor
			? isCodeBox
				? this.props.onSubmit(value, this.state.network, false)
				: this.props.onSubmit(value, this.state.network, true, isHeaderBiddingActivated)
			: isCodeBox
				? this.props.onSubmit(null, value, null, null, null, null, this.state.network, isHeaderBiddingActivated)
				: this.props.onSubmit(null, null, null, null, null, value, this.state.network, isHeaderBiddingActivated);
	}

	render() {
		const dropDownItems = ['adsense', 'adx', 'adpTags', 'dfp', 'critieo', 'custom'];
		let code = this.props.ad && this.props.ad.adCode ? this.props.ad.adCode : '';
		return (
			<div className="networkOptionsRow">
				<SelectBox value={this.state.network} label="Select Network" onChange={this.onChange}>
					{dropDownItems.map((item, index) => (
						<option key={index} value={item}>
							{item.charAt(0).toUpperCase() + item.slice(1).replace(/([A-Z])/g, ' $1')}
						</option>
					))}
				</SelectBox>
				{this.state.network == 'adpTags' ? (
					<AdpTags
						priceFloorFromProps={
							this.props.ad && this.props.ad.networkData && this.props.ad.networkData.priceFloor
								? this.props.ad.networkData.priceFloor
								: 0
						}
						headerBiddingFlag={
							this.props.ad &&
							this.props.ad.networkData &&
							this.props.ad.networkData.hasOwnProperty('headerBidding')
								? this.props.ad.networkData.headerBidding
								: 1
						}
						showButtons={this.props.showButtons || true}
						submitHandler={this.submitHandler}
						onCancel={this.props.onCancel}
					/>
				) : this.state.network ? (
					<div className="mT-10">
						<CodeBox
							showButtons={this.props.showButtons || true}
							onSubmit={this.submitHandler}
							onCancel={this.props.onCancel}
							code={code}
							size="small"
						/>
					</div>
				) : null}
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
