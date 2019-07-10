import React, { Component } from 'react';
import moment from 'moment';
import { Row, Col } from 'react-bootstrap';
import { ajax } from '../../../../common/helpers';

class General extends Component {
	constructor(props) {
		super(props);
		this.save = this.save.bind(this);
		this.state = {
			rs: false,
			pubId:
				window.currentUser &&
				window.currentUser.adNetworkSettings &&
				window.currentUser.adNetworkSettings.length &&
				window.currentUser.adNetworkSettings[0].pubId
					? window.currentUser.adNetworkSettings[0].pubId
					: ''
		};
		this.fetchRevenueShare = this.fetchRevenueShare.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.updatePubId = this.updatePubId.bind(this);
	}

	componentWillMount() {
		this.state.rs == false || this.state.rs == undefined ? this.fetchRevenueShare() : null;
	}

	handleChange(e) {
		this.setState({ rs: e.target.value });
	}

	fetchRevenueShare() {
		return ajax({
			url: `/user/site/${this.props.siteId}/getRevenueShare`,
			method: 'GET'
		}).then(response => {
			if (response.error) {
				alert('Error occured. Please try again later');
				return;
			}
			this.setState({ rs: response.rs });
		});
	}

	save() {
		let share = (this.state.rs == false || this.state.rs == undefined) && this.state.rs != 0 ? 10 : this.state.rs;
		return ajax({
			url: `/user/site/${this.props.siteId}/saveRevenueShare`,
			method: 'POST',
			data: JSON.stringify({ share, siteId: this.props.siteId })
		}).then(response => {
			if (response.error) {
				alert('Error occured. Please check Revenue Share value');
				return;
			}
			alert(
				`Revenue Share updated and revenue share will be effective from ${moment()
					.subtract(2, 'days')
					.format('DD-MM-YYYY')}`
			);
		});
	}

	updatePubId() {
		if (!this.state.pubId || !/pub/.test(this.state.pubId)) {
			alert('Invalid Publisher Id');
			return;
		}
		return ajax({
			url: '/user/updatePublisherId',
			method: 'POST',
			data: JSON.stringify({ pubId: this.state.pubId })
		}).then(response => {
			if (response.error) {
				alert('Error occured. Please check Publisher Id');
				return;
			}
			alert('Publisher Id updated');
		});
	}

	render() {
		return (
			<Row style={{ margin: '0px', padding: '15px' }}>
				<Col xs={6} style={{ padding: '15px', borderRight: '1px solid #ebebeb' }}>
					<h4>Revenue Share</h4>
					<p style={{ marginTop: '10px' }}>
						Any changes to Revenue Share will be effective from{' '}
						<strong>
							{moment()
								.subtract(2, 'days')
								.format('DD-MM-YYYY')}
						</strong>
					</p>
					<hr />
					<Col xs={8} className="u-padding-r5px">
						<input
							type="number"
							name="rs"
							className="input-field"
							value={this.state.rs}
							onChange={this.handleChange}
						/>
					</Col>
					<Col xs={4}>
						<button className="btn btn-save btn-default" style={{ width: '100%' }} onClick={this.save}>
							Save
						</button>
					</Col>
				</Col>
				<Col xs={6} style={{ padding: '15px' }}>
					<h4>User Adsense Publisher Id</h4>
					<p style={{ marginTop: '10px' }}>
						Publisher Id should be in the format <strong>pub-XXXXXXXXXXX</strong>
					</p>
					<hr />
					<Col xs={8} className="u-padding-r5px">
						<input
							type="text"
							name="pubId"
							className="input-field"
							value={this.state.pubId}
							onChange={e => this.setState({ pubId: e.target.value })}
						/>
					</Col>
					<Col xs={4}>
						<button
							className="btn btn-save btn-default"
							style={{ width: '100%' }}
							onClick={this.updatePubId}
						>
							Save
						</button>
					</Col>
				</Col>
			</Row>
		);
	}
}

export default General;
