import React, { Component } from 'react';
import { Row, Col, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import { makeFirstLetterCapitalize } from '../../../lib/helpers';
import AdNetworkDetails from './AdNetworkDetails.jsx';

class AdElement extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showNetworkDetails: false
		};
		this.renderButton = this.renderButton.bind(this);
		this.toggleNetworkDetails = this.toggleNetworkDetails.bind(this);
	}

	toggleNetworkDetails() {
		this.setState({
			showNetworkDetails: !this.state.showNetworkDetails
		});
	}

	renderButton(label, handler) {
		return (
			<div
				className="btn btn-lightBg btn-default"
				style={{ display: 'inline', float: 'right', margin: '10px 15px 0px 0px' }}
				onClick={handler}
			>
				{label}
			</div>
		);
	}

	render() {
		const { ad } = this.props;
		return (
			<div key={`adELement-${ad.id}`}>
				<OverlayTrigger placement="bottom" overlay={<Tooltip id="delete-ad-tooltip">Delete Ad</Tooltip>}>
					<Button className="btn-close" type="submit">
						{/* onClick={deleteAd.bind(null, props.ad.id)} */}
						x
					</Button>
				</OverlayTrigger>
				<Col xs={3} className="ad-image">
					<img
						src={`/assets/images/tagManager/types/${ad.formatData.platform}/${ad.formatData.type}${
							ad.formatData.placement ? `-${ad.formatData.placement}` : ''
						}.png`}
					/>
				</Col>
				<Col xs={9} className="ad-details">
					{this.state.showNetworkDetails ? (
						<AdNetworkDetails ad={ad} />
					) : (
						<div key={'adDetails' + ad.id}>
							<p>
								Ad Id: <strong>{ad.id}</strong>
							</p>
							<p>
								Platform: <strong>{makeFirstLetterCapitalize(ad.formatData.platform)}</strong>
							</p>
							<p>
								Type:{' '}
								<strong>
									{makeFirstLetterCapitalize(ad.formatData.type)}
									{ad.formatData.placement
										? ' ' + makeFirstLetterCapitalize(ad.formatData.placement)
										: ''}
								</strong>
							</p>
							<p>
								Size:{' '}
								<strong>
									{ad.width}x{ad.height}
								</strong>
							</p>
							<pre>
								{`<div id="${ad.id}">
	<script>
		var adpushup = adpushup || {};
		adpushup.que = adpushup.que || [];
		adpushup.que.push(funtion() {
		adpushup.triggerAd('${ad.id}');
		})
	</script>
</div>`}
							</pre>
							{window.isSuperUser
								? this.renderButton('Show Network Details', this.toggleNetworkDetails)
								: null}
							{this.renderButton('Copy Adcode', () => {})}
						</div>
					)}
				</Col>
			</div>
		);
	}
}

export default AdElement;
