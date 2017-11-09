import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Row, Col } from 'react-bootstrap';
import { ajax } from '../../../../common/helpers';

class General extends Component {
	constructor(props) {
		super(props);
		this.save = this.save.bind(this);
	}
	save() {
		let inputField = ReactDOM.findDOMNode(this.refs.revenueShare),
			share = inputField.value;

		share = !share ? 10 : share;
		return ajax({
			url: `/user/site/${this.props.siteId}/saveRevenueShare`,
			method: 'POST',
			data: JSON.stringify({ share, siteId: this.props.siteId })
		}).then(response => {
			if (response.error) {
				alert('Error occured. Please try again later');
				return;
			}
			alert('Revenue Share updated');
		});
	}

	render() {
		return (
			<Row style={{ margin: '0px', padding: '15px' }}>
				<Col xs={6} style={{ padding: '15px', border: '1px solid #ebebeb' }}>
					<h4>Revenue Share</h4>
					<hr />
					<Col xs={8} className="u-padding-r5px">
						<input type="number" name="revenueShare" ref="revenueShare" className="input-field" />
					</Col>
					<Col xs={4}>
						<button className="btn btn-save btn-default" style={{ width: '100%' }} onClick={this.save}>
							Save
						</button>
					</Col>
				</Col>
			</Row>
		);
	}
}

export default General;
