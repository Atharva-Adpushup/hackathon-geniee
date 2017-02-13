import React, { PropTypes } from 'react';
import Menu from 'shared/menu/menu.jsx';
import MenuItem from 'shared/menu/menuItem.jsx';
import Info from './info.jsx';
import CloseChannel from './closeChannel.jsx';
import NumericCollectionManager from 'components/shared/NumericCollectionManager/index.jsx';
import { uiCollections } from 'consts/commonConsts';

const channelMenu = ({ isVisible, activeChannelId, allTrafficDistributions, editTrafficDistribution,
	position, hideMenu, saveSampleUrl, channel, partner, closeChannel, changeContentSelector }) => {

	if (!isVisible) {
		return null;
	}

	const items = [],
		closeChannelById = () => {
			closeChannel(activeChannelId);
		},
		saveTrafficDistributions = (config) => {
			Object.keys(config).forEach((key) => {
				const value = config[key];
				editTrafficDistribution(key, value);
			});
		},
		trafficDistributionConfig = {
			description: uiCollections.trafficDistribution.description,
			sumMismatchErrorMessage: uiCollections.trafficDistribution.errorMessage.sumMismatch
		};

	trafficDistributionConfig.sumMismatchErrorMessage = trafficDistributionConfig.sumMismatchErrorMessage.map((text, id) => <span key={`td-error-${id}`}>{text}</span>);
	trafficDistributionConfig.sumMismatchErrorMessage.push(<strong key="td-error-max-value">100</strong>);

	items.push((
		<MenuItem key={1} icon="fa fa-info" contentHeading="Page Group Info">
			<Info onContentSelectorChange={changeContentSelector} onSampleUrlChange={saveSampleUrl} channel={channel} />
		</MenuItem>
	));

	items.push((
		<MenuItem key={2} icon="fa fa-exchange" contentHeading="Traffic Distribution">
			<NumericCollectionManager description={trafficDistributionConfig.description} sumMismatchErrorMessage={trafficDistributionConfig.sumMismatchErrorMessage}
				collection={allTrafficDistributions} uiMinimal required maxValue={100} onSave={a => saveTrafficDistributions(a)} />
		</MenuItem>
	));

	items.push((
		<MenuItem key={3} icon="fa fa-times" contentHeading="Close Channel">
			<CloseChannel closeChannelById={closeChannelById} />
		</MenuItem>
	));

	return (
		<Menu id="channelMenu" position={position} arrow="top" activeItem={0} onGlassClick={hideMenu}>
			{items}
		</Menu>
	);
};

channelMenu.propTypes = {
	isVisible: PropTypes.bool.isRequired,
	partner: PropTypes.string,
	position: PropTypes.object,
	channels: PropTypes.array,
	hideMenu: PropTypes.func
};

channelMenu.defaultProps = {
	isVisible: false
};

export default channelMenu;
