/* eslint-disable no-alert */
/* eslint-disable react/no-danger */
/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
/* eslint-disable no-case-declarations */
import React, { Component, Fragment } from 'react';
import { Panel, Table } from '@/Client/helpers/react-bootstrap-imports';
import cloneDeep from 'lodash/cloneDeep';
import Loader from '../../../../../../Components/Loader';
import CustomToggleSwitch from '../../../../../../Components/CustomToggleSwitch/index';
import CustomMessage from '../../../../../../Components/CustomMessage/index';
import CustomButton from '../../../../../../Components/CustomButton/index';

class Layout extends Component {
	static resetState = apps => {
		const status = Object.prototype.hasOwnProperty.call(apps, 'layout') ? apps.layout : undefined;
		return {
			loading: false,
			status
		};
	};

	constructor(props) {
		super(props);
		const {
			site: { apps = {} }
		} = props;
		this.state = { ...Layout.resetState(apps) };
		this.shouldDisableSave = false;
	}

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

	resetTabWrapper = () => {
		const {
			resetTab,
			site: {
				apps = {},
				apConfigs: { autoOptimise = false },
				cmsInfo: { channelsInfo = {} }
			}
		} = this.props;

		this.setState(
			{ ...Layout.resetState(apps), siteAutoOptimise: autoOptimise, channels: channelsInfo },
			() => resetTab()
		);
	};

	checkTraffic = () => {
		const { channels } = this.state;
		const channelKeys = Object.keys(channels);

		if (!channelKeys || !channelKeys.length) return true;

		let isInvalid = false;

		channelKeys.forEach(channelKey => {
			const current = channels[channelKey];
			const { variations = {}, autoOptimise } = current;
			const variationKeys = Object.keys(variations);

			if (autoOptimise || !variationKeys || !variationKeys.length) return;

			const total = variationKeys.reduce((acc, id) => {
				const variation = variations[id];
				return acc + parseInt(variation.trafficDistribution, 10);
			}, 0);
			isInvalid = isInvalid || total !== 100;
		});

		return !isInvalid;
	};

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
						let { channels = {} } = state;
						channels = cloneDeep(channels);
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
		const isTrafficValid = this.checkTraffic();

		if (!isTrafficValid)
			return window.alert(
				'Total variation traffic is less than 100. Please update traffic in Editor/Enable Auto Optimise before save.'
			);

		const { status = undefined, channels = undefined, siteAutoOptimise = undefined } = this.state;
		const {
			site: { siteId },
			updateAppStatus,
			updateSiteAutoOptimise,
			updateChannelAutoOptimise,
			dataForAuditLogs
		} = this.props;
		const promises = [];

		if (status !== undefined) {
			promises.push(
				updateAppStatus.bind(null, siteId, { app: 'layout', value: status }, dataForAuditLogs)
			);
		}
		if (siteAutoOptimise !== undefined) {
			promises.push(
				updateSiteAutoOptimise.bind(
					null,
					siteId,
					{ autoOptimise: siteAutoOptimise },
					dataForAuditLogs
				)
			);
		}
		if (channels !== undefined) {
			const keys = Object.keys(channels);
			keys.forEach(key => {
				const current = channels[key];
				promises.push(
					updateChannelAutoOptimise.bind(
						null,
						siteId,
						{
							...current,
							channelKey: `${current.platform}:${current.pageGroup}`
						},
						dataForAuditLogs
					)
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
				.then(() =>
					this.setState(() => ({
						loading: false
					}))
				);
		}
		return true;
	};

	renderChannels() {
		const {
			site: { siteId }
		} = this.props;
		const { channels: channelsInfo } = this.state;

		const channels = Object.keys(channelsInfo);
		let sum = 0;

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
							sum += parseInt(variation.trafficDistribution, 10);
						});
					} else {
						traffic = 'No Variation Found';
					}
					if (!this.shouldDisableSave && sum < 100) this.shouldDisableSave = true;
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
			site: { siteId, siteDomain }
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
				<CustomButton variant="secondary" className="pull-right" onClick={this.resetTabWrapper}>
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
