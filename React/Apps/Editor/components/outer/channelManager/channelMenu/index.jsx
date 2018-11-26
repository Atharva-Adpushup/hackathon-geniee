import React, { PropTypes } from 'react';
import Menu from 'shared/menu/menu.jsx';
import MenuItem from 'shared/menu/menuItem.jsx';
import Info from './info.jsx';
import CloseChannel from './closeChannel.jsx';
import { uiCollections } from 'consts/commonConsts';
import TrafficPanel from './trafficPanel.jsx';

const channelMenu = ({
	isVisible,
	activeChannelId,
	allTrafficDistributions,
	editTrafficDistribution,
	position,
	hideMenu,
	saveSampleUrl,
	updateAutoptimize,
	channel,
	partner,
	closeChannel,
	changeContentSelector
}) => {
	if (!isVisible) {
		return null;
	}

	const items = [],
		closeChannelById = () => {
			closeChannel(activeChannelId);
		},
		saveTrafficDistributions = config => {
			Object.keys(config).forEach(key => {
				const value = config[key];
				editTrafficDistribution(key, value);
			});
		},
		trafficDistributionConfig = {
			description: uiCollections.trafficDistribution.description,
			sumMismatchErrorMessage: uiCollections.trafficDistribution.errorMessage.sumMismatch
		};

	trafficDistributionConfig.sumMismatchErrorMessage = trafficDistributionConfig.sumMismatchErrorMessage.map(
		(text, id) => <span key={`td-error-${id}`}>{text}</span>
	);
	trafficDistributionConfig.sumMismatchErrorMessage.push(<strong key="td-error-max-value">100</strong>);

	items.push(
		<MenuItem key={1} icon="fa fa-info" contentHeading="Page Group Info">
			<Info onContentSelectorChange={changeContentSelector} onSampleUrlChange={saveSampleUrl} channel={channel} />
		</MenuItem>
	);

	items.push(
		<MenuItem key={2} icon="fa fa-exchange" contentHeading="Traffic Distribution">
			<TrafficPanel
				trafficDistributionConfig={trafficDistributionConfig}
				onAutoptimizeChange={updateAutoptimize}
				allTrafficDistributions={allTrafficDistributions}
				saveTrafficDistributions={saveTrafficDistributions}
				channel={channel}
			/>
		</MenuItem>
	);

	items.push(
		<MenuItem key={3} icon="fa fa-times" contentHeading="Close Channel">
			<CloseChannel closeChannelById={closeChannelById} />
		</MenuItem>
	);

	return (
		<Menu id="channelMenu" position={position} arrow="top" activeItem={1} onGlassClick={hideMenu}>
			{items}
		</Menu>
	);
};

channelMenu.propTypes = {
	isVisible: PropTypes.bool.isRequired,
	partner: PropTypes.string,
	position: PropTypes.object,
	channels: PropTypes.array,
	hideMenu: PropTypes.func,
	onAutoptimizeChange: PropTypes.func
};

channelMenu.defaultProps = {
	isVisible: false
};

export default channelMenu;
