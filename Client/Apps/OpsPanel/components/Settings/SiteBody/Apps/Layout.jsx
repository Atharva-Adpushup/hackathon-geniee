/* eslint-disable no-case-declarations */
import React, { Component, Fragment } from 'react';
import { Panel, Table } from 'react-bootstrap';
import Loader from '../../../../../../Components/Loader';
import CustomToggleSwitch from '../../../../../../Components/CustomToggleSwitch/index';
import CustomMessage from '../../../../../../Components/CustomMessage/index';

class Layout extends Component {
	componentDidMount() {
		const { site, fetchChannelsInfo } = this.props;
		const { cmsInfo, siteId } = site;
		const { channelsInfo } = cmsInfo;

		if (!channelsInfo) fetchChannelsInfo(siteId);
	}

	handleToggle = (value, event) => {
		const attributeValue = event.target.getAttribute('name');
		const values = attributeValue.split('-');
		const name = values[0];
		const { updateChannelAutoOptimise } = this.props;

		switch (name) {
			case 'autoOptimise':
				const mode = values[1];
				if (mode === 'channel') {
					const [name, key, channelId, siteId, platform, pageGroup] = values;
					// update Channel
					updateChannelAutoOptimise(siteId, {
						channelKey: `${platform}:${pageGroup}`,
						channelId,
						autoOptimise: value
					});
				} else if (mode === 'site') {
					// update Site
				}
				break;

			case 'appStatus':
				const siteId = values[1];
				// update Site
				break;

			default:
				break;
		}
	};

	renderChannels() {
		const { site } = this.props;
		const {
			cmsInfo: { channelsInfo },
			siteId,
			siteDomain
		} = site;
		const channels = Object.keys(channelsInfo);

		return (
			<Fragment>
				{channels.map(channel => {
					const current = channelsInfo[channel];
					const {
						variations = {},
						autoOptimise: channelAutoOptimise,
						channelId,
						platform,
						pageGroup
					} = current;
					let traffic = 'No Variation Found';

					if (channelAutoOptimise === false) {
						const keys = Object.keys(variations).length;
						traffic = keys.map(variationId => {
							const variation = variations[variationId];
							return `${variation.name}:${variation.trafficDistribution}%`;
						});

						traffic = Array.isArray(traffic) ? traffic.join(', ') : traffic;
					}
					return (
						<tr>
							<td>{channel}</td>
							<td>
								<CustomToggleSwitch
									layout="nolabel"
									className="u-margin-b4 negative-toggle"
									checked={channelAutoOptimise}
									onChange={this.handleToggle}
									size="m"
									on="Yes"
									off="No"
									defaultLayout
									name={`autoOptimise-channel-${channelId}-${siteId}-${platform}-${pageGroup}`}
									id={`js-autoOptimise-${siteId}-${siteDomain}-${platform}-${pageGroup}`}
								/>
							</td>
							<td>{channelAutoOptimise ? 'N/A' : traffic}</td>
						</tr>
					);
				})}
			</Fragment>
		);
	}

	render() {
		const { site } = this.props;
		const { cmsInfo, apConfigs, siteId, siteDomain, apps } = site;
		const { channelsInfo } = cmsInfo;

		return !channelsInfo ? (
			<Loader height="100px" classNames="u-margin-v3" />
		) : (
			<Panel.Body collapsible>
				{!Object.prototype.hasOwnProperty.call(apps, 'layout') ? (
					<CustomMessage
						type="error"
						header="Information"
						message="Layout Status not found. Please set app status"
						rootClassNames="u-margin-b4"
						dismissible
					/>
				) : null}
				<CustomToggleSwitch
					labelText="App Status"
					className="u-margin-b4 negative-toggle"
					checked={apps.layout}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name={`appStatus-${siteId}-${siteDomain}`}
					id={`js-appStatus-${siteId}-${siteDomain}`}
				/>
				<CustomToggleSwitch
					labelText="Auto Optimize"
					className="u-margin-b4 negative-toggle"
					checked={apConfigs.autoOptimise}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name={`autoOptimise-site-${siteId}-${siteDomain}`}
					id={`js-autoOptimise-${siteId}-${siteDomain}`}
				/>
				<Table striped bordered hover>
					<thead>
						<tr>
							<th>Page Group</th>
							<th>Auto Optimize</th>
							<th>Traffic</th>
						</tr>
					</thead>
					<tbody>{this.renderChannels()}</tbody>
				</Table>
			</Panel.Body>
		);
	}
}

export default Layout;
