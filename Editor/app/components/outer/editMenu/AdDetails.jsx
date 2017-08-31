import React, { Component } from 'react';

class AdDetails extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		const { ad, xpath, editCss, editNetwork } = this.props;
		return (
			<div>
				<div>
				<p>Network : <strong>{ad.network}</strong><span className="adDetails-icon" onClick={editNetwork}><i className="btn-icn-edit" /></span></p>
				{
					ad.network == 'ADP Tags'
					?
						(
							<div>
								<p>Price Floor : <strong>{ad.networkData && ad.networkData.priceFloor ? ad.networkData.priceFloor : 0}</strong></p>
							</div>
						)
					:
						(
							<div>
								<p>Ad Code :
									{
										ad.adCode != null && ad.adCode != 'null' && ad.adCode != ""
										? <pre>
											{
												ad.adCode
											}
										</pre>
										: <strong> Not added</strong>
									}
								</p>
							</div>
						)
				}
				</div>
				<div>
					<p>XPath : <strong>{xpath}</strong><span className="adDetails-icon" onClick={editCss}><i className="btn-icn-edit" /></span></p>
				</div>
				<div>
					<pre>
						<span className="adDetails-icon" onClick={editCss}><i className="btn-icn-edit" /></span>
						{
							Object.keys(ad.css).map((value, key) => {
								return <p key={key} style={{margin: 0}}>{value} : {ad.css[value]}</p>
							})
						}
					</pre>
				</div>
			</div>
		)
	}
}

export default AdDetails;