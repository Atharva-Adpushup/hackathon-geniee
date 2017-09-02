import React, { Component } from 'react';
import { Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import InlineEdit from 'shared/inlineEdit/index.jsx';

class AdDetails extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		const { ad, editCss, editNetwork, userType } = this.props;
		return (
			<div id="ad-details">
				<div>
				<p>Network : <strong>{ad.network}</strong>
					<OverlayTrigger placement="bottom" overlay={<Tooltip id="edit-network">Edit Network</Tooltip>}>
						<span className="adDetails-icon" onClick={editNetwork}><i className="btn-icn-edit" /></span>
					</OverlayTrigger>
				</p>
				{
					ad.network == 'ADP Tags'
					?
						(
							<div>
								<p>Price Floor : <strong>{ad.networkData && ad.networkData.priceFloor ? ad.networkData.priceFloor : 0}</strong></p>
							</div>
						)
					:
						userType != 'partner'
						? (
							<div className="mB-10">
								<span className="mB-10">Ad Code : </span>
								{
									ad.adCode != null && ad.adCode != 'null' && ad.adCode != ""
									? <pre style={{ whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
										{
											atob(ad.adCode)
										}
									</pre>
									: <strong> Not added</strong>
								}
							</div>
						) : null
				}
				</div>
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
							editClickHandler={this.props.onSectionAllXPaths.bind(null, this.props.section.id, this.props.section.xpath)}
							text="XPath"
							errorMessage={(this.props.ui.errors.xpath && this.props.ui.errors.xpath.error) ? this.props.ui.errors.xpath.message : 'XPath cannot be blank'}
						/>
					</pre>
				</div>
				<div>
					<pre>
						<OverlayTrigger placement="bottom" overlay={<Tooltip id="edit-css">Edit CSS</Tooltip>}>
							<span className="adDetails-icon" onClick={editCss}><i className="btn-icn-edit" /></span>
						</OverlayTrigger>
						{
							Object.keys(ad.css).map((value, key) => {
								return <p key={key} style={{margin: 0, fontWeight: "bold"}}>{value} : {ad.css[value]}</p>
							})
						}
					</pre>
				</div>
			</div>
		)
	}
}

export default AdDetails;