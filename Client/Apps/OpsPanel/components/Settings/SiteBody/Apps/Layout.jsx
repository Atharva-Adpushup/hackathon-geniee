/* eslint-disable react/no-danger */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable no-case-declarations */
import React, { Component, Fragment } from 'react';
import { Panel, Table } from 'react-bootstrap';
import Loader from '../../../../../../Components/Loader';
import CustomToggleSwitch from '../../../../../../Components/CustomToggleSwitch/index';
import CustomMessage from '../../../../../../Components/CustomMessage/index';
import CustomButton from '../../../../../../Components/CustomButton/index';

class Layout extends Component {
	state = {
		loading: false
	};

	componentDidMount() {
		const { site, fetchChannelsInfo } = this.props;
		const {
			cmsInfo,
			siteId,
			apConfigs: { autoOptimise = false },
			apps = {}
		} = site;
		const { channelsInfo } = cmsInfo;
		const status = Object.prototype.hasOwnProperty.call(apps, 'layout') ? apps.layout : undefined;

		if (!channelsInfo) {
			return fetchChannelsInfo(siteId).then(channels => {
				this.setState({
					siteAutoOptimise: autoOptimise,
					status,
					channels
				});
			});
		}
		return this.setState({
			siteAutoOptimise: autoOptimise,
			status,
			channels: channelsInfo
		});
	}

	handleToggle = (value, event) => {
		const attributeValue = event.target.getAttribute('name');
		const values = attributeValue.split('-');
		const name = values[0];

		switch (name) {
			case 'autoOptimise':
				const mode = values[1];
				if (mode === 'channel') {
					const [name, key, siteId, platform, pageGroup] = values;
					const channelKey = `${platform}:${pageGroup}`;
					// update Channel
					this.setState(state => ({
						...state,
						channels: {
							...state.channels,
							[channelKey]: {
								...state.channels[channelKey],
								autoOptimise: value
							}
						}
					}));
				} else if (mode === 'site') {
					// update Site
					this.setState(state => {
						const { channels = {} } = state;
						const keys = Object.keys(channels);

						keys.forEach(key => {
							channels[key].autoOptimise = value;
						});

						return {
							siteAutoOptimise: value,
							channels
						};
					});
				}
				break;

			case 'appStatus':
				this.setState({ status: value });
				break;

			default:
				break;
		}
	};

	handleSave = () => {
		const { status = undefined, channels = undefined, siteAutoOptimise = undefined } = this.state;
		const {
			site: { siteId },
			updateAppStatus,
			updateSiteAutoOptimise,
			updateChannelAutoOptimise
		} = this.props;
		const promises = [];

		if (status !== undefined) {
			promises.push(updateAppStatus.bind(null, siteId, { app: 'layout', value: status }));
		}
		if (siteAutoOptimise !== undefined) {
			promises.push(updateSiteAutoOptimise.bind(null, siteId, { autoOptimise: siteAutoOptimise }));
		}
		if (channels !== undefined) {
			const keys = Object.keys(channels);
			keys.forEach(key => {
				const current = channels[key];
				promises.push(
					updateChannelAutoOptimise.bind(null, siteId, {
						...current,
						channelKey: `${current.platform}:${current.pageGroup}`
					})
				);
			});
		}

		if (promises.length) {
			this.setState({ loading: true });
			return promises
				.reduce(
					(p, cb) => p.then(() => (typeof cb === 'function' ? cb() : true)),
					Promise.resolve()
				)
				.then(() => this.setState({ loading: false }));
		}
		return true;
	};

	renderChannels() {
		const {
			site: { siteId }
		} = this.props;
		const { channels: channelsInfo } = this.state;

		const channels = Object.keys(channelsInfo);

		return (
			<Fragment>
				{channels.map(channel => {
					const current = channelsInfo[channel];
					const {
						variations = {},
						autoOptimise: channelAutoOptimise,
						platform,
						pageGroup,
						channelId
					} = current;
					let traffic = '';
					const keys = Object.keys(variations);
					const isAutoOptimiseDisabled = !!(
						channelAutoOptimise === false ||
						channelAutoOptimise === 'false' ||
						channelAutoOptimise === undefined
					);
					const hasVariations = !!keys.length;

					if (isAutoOptimiseDisabled && hasVariations) {
						keys.forEach(variationId => {
							const variation = variations[variationId];
							traffic += `<p><span class="u-text-bold">${variation.name}</span> -- ${
								variation.trafficDistribution
							}%</p>`;
						});
					} else {
						traffic = 'No Variation Found';
					}
					return (
						<tr key={`channel-row-${siteId}-${channelId}`}>
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
									name={`autoOptimise-channel-${siteId}-${platform}-${pageGroup}`}
									id={`js-autoOptimise-${siteId}-${channelId}-${platform}-${pageGroup}`}
								/>
							</td>
							<td dangerouslySetInnerHTML={{ __html: channelAutoOptimise ? 'N/A' : traffic }} />
						</tr>
					);
				})}
			</Fragment>
		);
	}

	render() {
		const { loading, status, siteAutoOptimise, channels } = this.state;
		const {
			site: { siteId, siteDomain },
			resetTab
		} = this.props;

		if (!channels || loading) return <Loader height="100px" classNames="u-margin-v3" />;

		return (
			<Panel.Body collapsible>
				{status === undefined ? (
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
					checked={status}
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
					labelText="Auto Optimize (Site)"
					className="u-margin-b4 negative-toggle"
					checked={siteAutoOptimise}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name={`autoOptimise-site-${siteId}-${siteDomain}`}
					id={`js-autoOptimise-${siteId}-${siteDomain}`}
				/>
				<Table striped bordered hover className="custom-table">
					<thead>
						<tr>
							<th>Page Group</th>
							<th>Auto Optimize</th>
							<th>Traffic</th>
						</tr>
					</thead>
					<tbody>{this.renderChannels()}</tbody>
				</Table>
				<CustomButton variant="secondary" className="pull-right" onClick={resetTab}>
					Cancel
				</CustomButton>
				<CustomButton
					variant="primary"
					className="pull-right u-margin-r3"
					onClick={this.handleSave}
					showSpinner={loading}
				>
					Save
				</CustomButton>
			</Panel.Body>
		);
	}
}

export default Layout;
