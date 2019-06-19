import React, { Component, Fragment } from 'react';
import { Table, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';

import CustomButton from '../../../../../../Components/CustomButton/index';
import CustomIcon from '../../../../../../Components/CustomIcon/index';
import Edit from '../../../../../../Components/EditBox/index';
import Loader from '../../../../../../Components/Loader';
import { copyToClipBoard } from '../../../../../../helpers/commonFunctions';

const DEFAULT_REGEX = 'No Pattern Set';
class Listing extends Component {
	state = {
		show: false,
		modalData: { header: null, body: null, footer: null }
	};

	componentDidMount() {
		const { site, fetchChannelsInfo } = this.props;
		const { cmsInfo, siteId } = site;
		const { channelsInfo } = cmsInfo;

		if (!channelsInfo) fetchChannelsInfo(siteId);
	}

	modalToggle = (data = {}) => {
		const { show, modalData } = this.state;
		return this.setState({
			show: !show,
			modalData: {
				...modalData,
				...data
			}
		});
	};

	saveRegex = ({ name, extras }) => {
		const { showNotification, updatePagegroupPattern } = this.props;
		const { siteId, pageGroup, platform } = extras;
		if (!name || !name.trim().length || name === DEFAULT_REGEX) {
			return showNotification({
				mode: 'error',
				title: 'Invalid Value',
				message: 'Please enter valid regex',
				autoDimiss: 5
			});
		}
		return updatePagegroupPattern(siteId, {
			pageGroup,
			platform,
			pattern: name
		});
	};

	editRegex = value => {
		const [pattern, pageGroup, platform, siteId] = value.split('-');
		return this.modalToggle({
			header: 'Edit Pagegroup Pattern',
			body: (
				<Edit
					label="Pagegroup Pattern"
					name={`regex-${pageGroup}-${platform}-${siteId}`}
					extras={{
						pageGroup,
						platform,
						siteId
					}}
					value={pattern}
					leftSize={3}
					rightSize={9}
					onSave={this.saveRegex}
					onCancel={this.modalToggle}
				/>
			),
			footer: false
		});
	};

	render() {
		const { site, updateView } = this.props;
		const { cmsInfo, apConfigs } = site;
		const { channelsInfo } = cmsInfo;
		const keys = channelsInfo ? Object.keys(channelsInfo) : false;
		const { show, modalData } = this.state;

		if (!keys) return <Loader height="150px" />;

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
							const { pageGroupPattern = [] } = apConfigs;
							const pagegroupByDevice = pageGroupPattern[channel.platform] || [];
							const pagegroup =
								pagegroupByDevice.filter(pg => pg.pageGroup === channel.pageGroup)[0] || {};
							const { pattern = DEFAULT_REGEX } = pagegroup;
							return (
								<tr key={`${site.siteId}-${channel.pageGroup}-${channel.platform}`}>
									<td>{channel.pageGroup}</td>
									<td>{channel.platform}</td>
									<td>{channel.variationsCount}</td>
									<td>
										{pattern}
										<CustomIcon
											icon="copy"
											className="u-text-red u-margin-l3 u-cursor-pointer"
											onClick={copyToClipBoard}
											toReturn={pattern}
											title="Copy Pagegroup Pattern"
										/>
										<CustomIcon
											icon="edit"
											className="u-text-red u-margin-l3 u-cursor-pointer"
											onClick={this.editRegex}
											toReturn={`${pattern}-${channel.pageGroup}-${channel.platform}-${
												site.siteId
											}`}
											title="Edit Pagegroup Pattern"
										/>
									</td>
									<td>
										<Link to={`/user/site/${site.siteId}/editor`}>
											<FontAwesomeIcon icon="code" className="u-text-red u-margin-r2" />
										</Link>
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
				<Modal show={show} onHide={this.modalToggle}>
					<Modal.Header>
						<Modal.Title>{modalData.header}</Modal.Title>
					</Modal.Header>
					<Modal.Body>{modalData.body}</Modal.Body>
					{modalData.footer ? <Modal.Body>{modalData.footer}</Modal.Body> : null}
					<div style={{ clear: 'both' }}>&nbsp;</div>
				</Modal>
			</Fragment>
		);
	}
}

export default Listing;
