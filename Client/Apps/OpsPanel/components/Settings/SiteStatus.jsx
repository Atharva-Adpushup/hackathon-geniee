/* eslint-disable no-nested-ternary */
import React, { Component } from 'react';
import { Modal, Table } from 'react-bootstrap';

import axiosInstance from '../../../../helpers/axiosInstance';
import Loader from '../../../../Components/Loader/index';
import CustomError from '../../../../Components/CustomError/index';

class SiteStatus extends Component {
	state = {
		isLoading: true,
		isError: false
	};

	componentDidMount() {
		const { site } = this.props;
		if (site) {
			axiosInstance
				.get(`/site/status?siteId=${site}`)
				.then(res => {
					const { data = [] } = res.data;
					this.setState({ statuses: data, isLoading: false, isError: false });
				})
				.catch(() => this.setState({ statuses: null, isLoading: false, isError: true }));
		}
	}

	renderBody() {
		const { isLoading, isError, statuses } = this.state;

		if (isLoading) return <Loader height="300px" />;
		if (isError) return <CustomError />;

		const services = Object.keys(statuses);

		return (
			<Table striped bordered hover>
				<thead>
					<tr>
						<th>Service</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					{services.map(key => {
						const service = statuses[key];
						const { status, displayText, message = null } = service;
						const toPrint = message || (status ? 'Complete' : 'Incomplete');

						return (
							<tr key={key}>
								<td>{displayText}</td>
								<td>
									<strong>{toPrint}</strong>
								</td>
							</tr>
						);
					})}
				</tbody>
			</Table>
		);
	}

	render() {
		const { site, show, modalToggle } = this.props;

		if (!site) return null;

		return (
			<Modal show={show} onHide={modalToggle}>
				<Modal.Header>
					<Modal.Title>Site Status - {site}</Modal.Title>
				</Modal.Header>
				<Modal.Body>{this.renderBody()}</Modal.Body>
				<div style={{ clear: 'both' }}>&nbsp;</div>
			</Modal>
		);
	}
}

export default SiteStatus;
