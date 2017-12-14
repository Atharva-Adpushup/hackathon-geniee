import React, { Component } from 'react';
import { Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import InlineEdit from 'shared/inlineEdit/index.jsx';

class AdDetails extends Component {
	constructor(props) {
		super(props);
		this.renderXPathAndCSS = this.renderXPathAndCSS.bind(this);
		this.renderSectionName = this.renderSectionName.bind(this);
		this.renderNetworkDetails = this.renderNetworkDetails.bind(this);
		this.renderEventData = this.renderEventData.bind(this);
	}

	renderXPathAndCSS() {
		return (
			<div>
				<div className="mB-10">
					<pre>
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
					</pre>
				</div>
				<div>
					<pre>
						<OverlayTrigger placement="bottom" overlay={<Tooltip id="edit-css">Edit CSS</Tooltip>}>
							<span className="adDetails-icon" onClick={this.props.editCss}>
								<i className="btn-icn-edit" />
							</span>
						</OverlayTrigger>
						{Object.keys(this.props.ad.css).map((value, key) => {
							return (
								<p key={key} style={{ margin: 0, fontWeight: 'bold' }}>
									{value} : {this.props.ad.css[value]}
								</p>
							);
						})}
					</pre>
				</div>
			</div>
		);
	}

	renderSectionName() {
		return (
			<div className="mB-10">
				<p style={{ marginBottom: '0px' }}>Section Name</p>
				<InlineEdit
					validate
					value={this.props.section.name}
					submitHandler={this.props.onRenameSection.bind(null, this.props.section, this.props.variationId)}
					text="Section Name"
					errorMessage="Section Name cannot be blank"
				/>
			</div>
		);
	}

	renderNetworkDetails() {
		const { ad, editNetwork } = this.props;
		let pfKeyExists = ad.networkData && ad.networkData.keyValues && Object.keys(ad.networkData.keyValues).length,
			fpKey = pfKeyExists
				? Object.keys(ad.networkData.keyValues).filter(key => key.match(/FP/g)) || 'FP_SA'
				: 'FP_SA',
			priceFloor = pfKeyExists ? ad.networkData.keyValues[fpKey] : 0,
			headerBidding =
				ad.networkData && ad.networkData.hasOwnProperty('headerBidding')
					? String(ad.networkData.headerBidding)
					: 'true';

		return (
			<div>
				<p>
					Network :{' '}
					<strong>
						{ad.network.charAt(0).toUpperCase() + ad.network.slice(1).replace(/([A-Z])/g, ' $1')}
					</strong>
					<OverlayTrigger placement="bottom" overlay={<Tooltip id="edit-network">Edit Network</Tooltip>}>
						<span className="adDetails-icon" onClick={editNetwork}>
							<i className="btn-icn-edit" />
						</span>
					</OverlayTrigger>
				</p>
				{ad.network == 'adpTags' ? (
					<div>
						<p>
							PF Key : <strong>{fpKey}</strong>
						</p>
						<p>
							Price Floor : <strong>{priceFloor}</strong>
						</p>
						<p>
							Header Bidding : <strong>{headerBidding}</strong>
						</p>
					</div>
				) : (
					<div className="mB-10">
						<span className="mB-10">Ad Code : </span>
						{ad.networkData && ad.networkData.adCode != null && ad.networkData.adCode.trim().length ? (
							<pre style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
								{atob(ad.networkData.adCode)}
							</pre>
						) : (
							<strong> Not added</strong>
						)}
					</div>
				)}
			</div>
		);
	}

	renderEventData() {
		const { section, ad } = this.props;
		return (
			<div>
				<p>
					Event : <strong>{section.formatData.event.toUpperCase()}</strong>
					<OverlayTrigger
						placement="bottom"
						overlay={<Tooltip id="edit-interactive-ad-data">Edit Interactive Ad Data</Tooltip>}
					>
						<span className="adDetails-icon" onClick={this.props.editInteractiveAd}>
							<i className="btn-icn-edit" />
						</span>
					</OverlayTrigger>
				</p>
				{section.formatData.eventData && Object.keys(section.formatData.eventData).length ? (
					<p>
						Value : <strong>{section.formatData.eventData.value}</strong>
					</p>
				) : null}
				<p>
					Format :{' '}
					<strong>
						{section.formatData.type}
						{section.formatData.placement}
					</strong>
				</p>
			</div>
		);
	}

	render() {
		const { fromPanel, showEventData } = this.props;
		return (
			<div id="ad-details">
				<div>
					{!fromPanel ? this.renderSectionName() : null}
					{this.renderNetworkDetails()}
				</div>
				{!fromPanel ? this.renderXPathAndCSS() : null}
				{showEventData ? this.renderEventData() : null}
			</div>
		);
	}
}

AdDetails.defaultProps = {
	fromPanel: false
};

export default AdDetails;
