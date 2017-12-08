import React, { Component } from 'react';
import { Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import InlineEdit from 'shared/inlineEdit/index.jsx';

class AdDetails extends Component {
	constructor(props) {
		super(props);
		this.renderXPathAndCSS = this.renderXPathAndCSS.bind(this);
		this.renderSectionName = this.renderSectionName.bind(this);
		this.renderNetworkDetails = this.renderNetworkDetails.bind(this);
		this.renderAdCode = this.renderAdCode.bind(this);
		this.renderCommonDetails = this.renderCommonDetails.bind(this);
		this.genieeOptions = this.genieeOptions.bind(this);
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

	renderCommonDetails(fpKey, priceFloor, headerBidding, title) {
		return (
			<div>
				<p>
					PF Key : <strong>{fpKey}</strong>
				</p>
				<p>
					Price Floor : <strong>{priceFloor}</strong>
				</p>
				<p>
					{title}: <strong>{headerBidding}</strong>
				</p>
			</div>
		);
	}

	genieeOptions(position, firstFold, zoneId) {
		return (
			<div>
				<p>
					Position : <strong>{position}</strong>
				</p>
				<p>
					First fold : <strong>{firstFold}</strong>
				</p>
				<p>
					Geniee Zone Id : <strong>{zoneId}</strong>
				</p>
			</div>
		);
	}

	renderAdCode(adCode) {
		<div className="mB-10">
			<span className="mB-10">Ad Code : </span>
			{adCode ? (
				<pre style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{adCode}</pre>
			) : (
				<strong> Not added</strong>
			)}
		</div>;
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
					: 'true',
			firstFold =
				ad.networkData && ad.networkData.hasOwnProperty('firstFold')
					? String(ad.networkData.firstFold)
					: 'true',
			position =
				ad.networkData &&
				ad.networkData.hasOwnProperty('position') &&
				String(ad.networkData.position) != '' &&
				ad.networkData.position != null
					? ad.networkData.position
					: 'Not set',
			dynamicAllocation =
				ad.networkData && ad.networkData.hasOwnProperty('dynamicAllocation')
					? String(ad.networkData.dynamicAllocation)
					: 'true',
			adCode =
				ad.networkData && ad.networkData.adCode != null && ad.networkData.adCode.trim().length
					? atob(ad.networkData.adCode)
					: false,
			zoneId = ad.networkData && ad.networkData.hasOwnProperty('zoneId') ? ad.networkData.zoneId : 'Not Set';

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
					this.renderCommonDetails(fpKey, priceFloor, headerBidding, 'Header Bidding')
				) : ad.network == 'geniee' ? (
					<div>
						<div>
							{this.renderCommonDetails(fpKey, priceFloor, dynamicAllocation, 'Dynamic Allocation')}
						</div>
						<div>{this.genieeOptions(position, firstFold, zoneId)}</div>
						<div>{this.renderAdCode(adCode)}</div>
					</div>
				) : (
					this.renderAdCode(adCode)
				)}
			</div>
		);
	}

	render() {
		const { fromPanel } = this.props;
		return (
			<div id="ad-details">
				<div>
					{!fromPanel ? this.renderSectionName() : null}
					{this.renderNetworkDetails()}
				</div>
				{!fromPanel ? this.renderXPathAndCSS() : null}
			</div>
		);
	}
}

AdDetails.defaultProps = {
	fromPanel: false
};

export default AdDetails;
