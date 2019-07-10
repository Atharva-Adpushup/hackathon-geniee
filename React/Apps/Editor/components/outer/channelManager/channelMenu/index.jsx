import React, { PropTypes, Component } from 'react';
import Menu from 'shared/menu/menu.jsx';
import MenuItem from 'shared/menu/menuItem.jsx';
import Info from './info.jsx';
import CloseChannel from './closeChannel.jsx';
import { uiCollections } from 'consts/commonConsts';
import TrafficPanel from './trafficPanel.jsx';

class channelMenu extends Component {
	constructor(props) {
		super(props);
		this.state = {
			activeItem: 0
		};
		this.updateActiveItem = this.updateActiveItem.bind(this);
	}

	updateActiveItem(value) {
		this.setState({ activeItem: value });
	}

	render() {
		const {
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
		} = this.props;

		if (!isVisible) {
			return null;
		}

		const items = [];
		const closeChannelById = () => {
			closeChannel(activeChannelId);
		};
		const saveTrafficDistributions = config => {
			Object.keys(config).forEach(key => {
				const value = config[key];
				editTrafficDistribution(key, value);
			});
		};
		const trafficDistributionConfig = {
			description: uiCollections.trafficDistribution.description,
			sumMismatchErrorMessage: uiCollections.trafficDistribution.errorMessage.sumMismatch
		};

		trafficDistributionConfig.sumMismatchErrorMessage = trafficDistributionConfig.sumMismatchErrorMessage.map(
			(text, id) => <span key={`td-error-${id}`}>{text}</span>
		);
		trafficDistributionConfig.sumMismatchErrorMessage.push(<strong key="td-error-max-value">100</strong>);

		items.push(
			<MenuItem key={1} icon="fa fa-info" contentHeading="Page Group Info">
				<Info
					onContentSelectorChange={changeContentSelector}
					onSampleUrlChange={saveSampleUrl}
					channel={channel}
				/>
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
			<Menu
				id="channelMenu"
				position={position}
				arrow="top"
				activeItem={this.state.activeItem}
				onMenuItemClick={this.updateActiveItem}
				onGlassClick={() => {
					this.updateActiveItem(0);
					hideMenu();
				}}
			>
				{items}
			</Menu>
		);
	}
}

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
