import React, { Component } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import InlineEdit from 'shared/inlineEdit/index.jsx';
import SelectBox from 'shared/select/select.js';
import { floats, networks } from 'consts/commonConsts';
import NetworkOptions from 'shared/networkOptions/NetworkOptions';

class EditOptions extends Component {
	constructor(props) {
		super(props);
		this.state = {
			float: this.props.section.float
		};

		this.onFloatSelectChange = this.onFloatSelectChange.bind(this);
		this.onPartnerDataUpdate = this.onPartnerDataUpdate.bind(this);
		this.renderContent = this.renderContent.bind(this);
		this.submitHandler = this.submitHandler.bind(this);
	}

	onFloatSelectChange(float) {
		this.setState({ float });

		const sectionId = this.props.section.id,
			adId = this.props.section.ads[0].id;
		this.props.onIncontentFloatUpdate(sectionId, adId, float);
	}

	onPartnerDataUpdate(customZoneId) {
		const sectionId = this.props.section.id,
			adId = this.props.section.ads[0].id,
			partnerData = $.extend(true, {}, this.props.section.partnerData);

		partnerData.customZoneId = customZoneId;
		this.props.onUpdatePartnerData(sectionId, adId, partnerData);
	}

	submitHandler = networkData => {
		this.props.updateNetwork(this.props.section.ads[0].id, networkData);
		this.props.showNotification({
			mode: 'success',
			title: 'Operation Successful',
			message: 'Section Updated'
		});
	};

	renderContent() {
		return (
			<div className="mT-10">
				<NetworkOptions
					onSubmit={this.submitHandler}
					onCancel={this.toggleNetworkEditor}
					ad={this.props.section.ads[0]}
					buttonType={2}
					fromPanel={true}
					id={this.props.section.id}
				/>
			</div>
		);
	}

	render() {
		return (
			<div>
				{this.props.isCustomZoneId ? (
					<Row>
						<Col className="u-padding-r10px" xs={4}>
							Zone Id
						</Col>
						<Col className="u-padding-l10px" xs={8}>
							<InlineEdit
								type="number"
								compact
								validate
								value={this.props.customZoneId}
								submitHandler={this.onPartnerDataUpdate}
								text="Custom Zone Id"
								errorMessage="Custom zone id cannot be blank"
							/>
						</Col>
					</Row>
				) : null}
				{!this.props.section.isIncontent ? (
					<Row>
						<Col className="u-padding-r10px" xs={4}>
							XPath
						</Col>
						<Col className="u-padding-l10px" xs={8}>
							<InlineEdit
								compact
								validate
								cancelEditHandler={this.props.onResetErrors.bind(null, this.props.section.id)}
								customError={this.props.ui.errors.xpath ? this.props.ui.errors.xpath.error : false}
								dropdownList={this.props.section.allXpaths}
								value={this.props.section.xpath}
								keyUpHandler={this.props.onValidateXPath.bind(null, this.props.section.id)}
								submitHandler={this.props.onUpdateXPath.bind(null, this.props.section.id)}
								editClickHandler={this.props.onSectionAllXPaths.bind(
									null,
									this.props.section.id,
									this.props.section.xpath
								)}
								text="XPath"
								errorMessage={
									this.props.ui.errors.xpath && this.props.ui.errors.xpath.error
										? this.props.ui.errors.xpath.message
										: 'XPath cannot be blank'
								}
							/>
						</Col>
					</Row>
				) : (
					<Row>
						<Col className="u-padding-r10px" xs={4}>
							Float
						</Col>
						<Col className="u-padding-l10px" xs={8}>
							<SelectBox
								value={this.state.float}
								label="Select Float"
								onChange={this.onFloatSelectChange}
								showClear={false}
							>
								{floats.map((float, index) => (
									<option key={index} value={float}>
										{float}
									</option>
								))}
							</SelectBox>
						</Col>
					</Row>
				)}
				{this.renderContent()}
			</div>
		);
	}
}

export default EditOptions;
