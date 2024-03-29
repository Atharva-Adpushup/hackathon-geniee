/* eslint-disable no-alert */
import React, { Component, Fragment } from 'react';
import { Table, Modal } from '@/Client/helpers/react-bootstrap-imports';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import CustomButton from '../../../../../../Components/CustomButton/index';
import CustomIcon from '../../../../../../Components/CustomIcon/index';
import Edit from '../../../../../../Components/EditBox/index';
import Loader from '../../../../../../Components/Loader';
import Empty from '../../../../../../Components/Empty';
import { getPageGroupHash, getAppBaseUrls } from '../../../../../../helpers/commonFunctions';
import CopyButtonWrapperContainer from '../../../../../../Containers/CopyButtonWrapperContainer';

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
		const { showNotification, updatePagegroupPattern, dataForAuditLogs } = this.props;
		const { siteId, pageGroup, platform } = extras;
		const pattern = name.trim();
		if (!pattern.length || pattern === DEFAULT_REGEX) {
			return showNotification({
				mode: 'error',
				title: 'Invalid Value',
				message: 'Please enter valid regex',
				autoDismiss: 5
			});
		}
		return updatePagegroupPattern(
			siteId,
			{
				pageGroup,
				platform,
				pattern
			},
			{
				...dataForAuditLogs,
				actionInfo: `Updated Page Group Pattern`
			}
		);
	};

	editRegex = value => {
		const { pattern, pageGroup, platform, siteId } = value;
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

	deletePagegroup = value => {
		const { deletePagegroup } = this.props;
		const { channelId, siteId, platform, pageGroup, dataForAuditLogs } = value;
		if (
			window.confirm(
				`Are you sure you want to delete ${platform}:${pageGroup} for siteId -- ${siteId}`
			)
		) {
			return deletePagegroup(
				siteId,
				{
					pageGroup,
					platform,
					channelId,
					channelKey: `${platform.toUpperCase()}:${pageGroup}`
				},
				{
					...dataForAuditLogs,
					actionInfo: 'Deleted Page Group'
				}
			);
		}
		return false;
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

				{keys.length === 0 ? (
					<Empty style={{ clear: 'both' }} />
				) : (
					<Fragment>
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
									const pageGroupHash = getPageGroupHash(channel.pageGroup, channel.platform);
									const { http } = getAppBaseUrls();
									const computedEditorLink = `${http}/api/visualEditor/${
										site.siteId
									}?updateHash=${pageGroupHash}`;

									return (
										<tr key={`${site.siteId}-${channel.pageGroup}-${channel.platform}`}>
											<td>{channel.pageGroup}</td>
											<td>{channel.platform}</td>
											<td>{channel.variationsCount}</td>
											<td>
												{pattern}
												<CopyButtonWrapperContainer
													content={pattern}
													className="u-text-red u-margin-l3"
												>
													<CustomIcon icon="copy" title="Copy Pagegroup Pattern" />
												</CopyButtonWrapperContainer>
												<CustomIcon
													icon="edit"
													className="u-text-red u-margin-l3 u-cursor-pointer"
													onClick={this.editRegex}
													toReturn={{
														pattern,
														pageGroup: channel.pageGroup,
														platform: channel.platform,
														siteId: site.siteId
													}}
													title="Edit Pagegroup Pattern"
												/>
											</td>
											<td>
												<a target="_blank" rel="noopener noreferrer" href={computedEditorLink}>
													<FontAwesomeIcon
														icon="code"
														className="u-text-red u-margin-r2 u-cursor-pointer"
														title="Open Editor"
													/>
												</a>
												|
												<CustomIcon
													icon="trash"
													className="u-text-red u-margin-l2 u-cursor-pointer"
													onClick={this.deletePagegroup}
													toReturn={{
														pageGroup: channel.pageGroup,
														platform: channel.platform,
														channelId: channel.channelId,
														siteId: site.siteId
													}}
													title="Delete Pagegroup Pattern"
												/>
											</td>
										</tr>
									);
								})}
							</tbody>
						</Table>
						<Modal show={show} onHide={this.modalToggle} bsSize="large">
							<Modal.Header>
								<Modal.Title>{modalData.header}</Modal.Title>
							</Modal.Header>
							<Modal.Body>{modalData.body}</Modal.Body>
							{modalData.footer ? <Modal.Body>{modalData.footer}</Modal.Body> : null}
							<div style={{ clear: 'both' }}>&nbsp;</div>
						</Modal>
					</Fragment>
				)}
			</Fragment>
		);
	}
}

export default Listing;
