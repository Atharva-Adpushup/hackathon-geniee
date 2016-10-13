var React = window.React,
	Fluxxor = require('libs/third-party/fluxxor'),
	FluxMixin = Fluxxor.FluxMixin(React),
	Menu = require('CustomComponents/Menu/menu.jsx'),
	MenuItem = require('CustomComponents/Menu/menuItem.jsx'),
	ChannelAdder = require('./channelAdder.jsx'),
	Row = require('BootstrapComponents/Row.jsx'),
	Col = require('BootstrapComponents/Col.jsx'),
	ChannelList = require('./channelList.jsx');


module.exports = React.createClass({

	mixins: [FluxMixin],

	getInitialState: function() {
		return {
			activeMenuItem: 0
		};
	},
	onGlassClick: function() {
		this.getFlux().actions.hideMenu();
	},
	saveChannel: function(channelJson) {
		this.getFlux().actions.createChannel(channelJson);
	},
	openChannel: function(channel) {
		this.getFlux().actions.openChannel(channel);
	},
	render: function() {
		return (
			<Menu id="newChannelMenu" onGlassClick={this.onGlassClick} targetX={this.props.position.posX} targetY={this.props.position.posY} activeItem={this.state.activeMenuItem}>
				<MenuItem icon="fa-files-o" contentHeading="Create New Page Group" contentComponent={<ChannelAdder apex={this.props.apex}  cmsInfo={this.props.cmsInfo} channels={this.props.channels} adRecover={this.props.adRecover} onSave={this.saveChannel}/>}/>
				<MenuItem icon="fa fa-list-ul" contentHeading="Load Page Group" contentComponent={<ChannelList channels={this.props.channels} onClick={this.openChannel}/>}/>
			</Menu>
		);
	}
});
