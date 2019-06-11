import React, { Component, Fragment } from 'react';
import { Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import CustomButton from '../../../../../../Components/CustomButton/index';
import Loader from '../../../../../../Components/Loader';

class Listing extends Component {
	componentDidMount() {
		const { site, fetchChannelsInfo } = this.props;
		const { cmsInfo, siteId } = site;
		const { channelsInfo } = cmsInfo;

		if (!channelsInfo) fetchChannelsInfo(siteId);
	}

	render() {
		const { site, updateView } = this.props;
		const { cmsInfo } = site;
		const { channelsInfo } = cmsInfo;
		const keys = channelsInfo ? Object.keys(channelsInfo) : false;

		if (!keys) {
			return <Loader height="100px" />;
		}

		return (
			<Fragment>
				<CustomButton
					variant="secondary"
					className="pull-right u-margin-b3"
					data-view="create"
					onClick={updateView}
				>
					Create Pagegroup
				</CustomButton>

				<Table striped bordered hover>
					<thead>
						<tr>
							<th>Name</th>
							<th>Platform</th>
							<th>Variations</th>
							<th>Regex Pattern</th>
							<th>Action</th>
						</tr>
					</thead>
					<tbody>
						{keys.map(key => {
							const channel = channelsInfo[key];
							return (
								<tr key={`${site.siteId}-${channel.pageGroup}-${channel.platform}`}>
									<td>{channel.pageGroup}</td>
									<td>{channel.platform}</td>
									<td>{channel.variationsCount}</td>
									<td>
										www.rentdigs.com
										<FontAwesomeIcon
											icon="edit"
											className="u-text-red u-margin-l2"
											onClick={() => {
												console.log('Regex Edit Clicked Clicked');
											}}
										/>
									</td>
									<td>
										<FontAwesomeIcon
											icon="code"
											className="u-text-red u-margin-r2"
											onClick={() => {
												console.log('Editor Clicked');
											}}
										/>
										|
										<FontAwesomeIcon
											icon="trash"
											className="u-text-red u-margin-l2"
											onClick={() => {
												console.log('Trash Clicked');
											}}
										/>
									</td>
								</tr>
							);
						})}
					</tbody>
				</Table>
			</Fragment>
		);
	}
}

export default Listing;
