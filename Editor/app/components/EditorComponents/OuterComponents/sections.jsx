var React = window.React;
var _ = require("../../../libs/third-party/underscore"),

var TabList = require("./UIComponents/tabList.jsx");

var Fluxxor = require("Fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React),
    StoreWatchMixin = Fluxxor.StoreWatchMixin;

var AdTabs = React.createClass({
	getDefaultProps: function(){
		return {
			'AdSizes': {
				'Square' : {
					'300 x 300': {
						width: '300',
						height: '300'
					},

					'380 x 236' : {
						width: '380',
						height: '286'
					}
				},

				'Horizontal' : {
					'300 x 300': {
						width: '300',
						height: '300'
					},

					'380 x 236' : {
						width: '380',
						height: '286'
					}
				},

				'Vertical' : {
					'300 x 300': {
						width: '300',
						height: '300'
					},

					'380 x 236' : {
						width: '380',
						height: '286'
					}
				},
			}
		};
	},

	render: function(){
		var Tabs = [];

		for( tabTitle in this.props.AdSizes )
		{
			var tabContent = [];
			for( adName in this.props.AdSizes[tabTitle] )
			{
				tabContent.push(<input type="radio" />);
			}
			Tabs.push(<div title={tabTitle}>{tabContent}</div>);
		}

		return (<TabList>{Tabs}</TabList>);
	}
});

module.exports = React.createClass({

	getDefaultProps: function(){
		return {
			adSizes: {
				'768x76': {
					width: 768,
					height: 76
				}
			},

			contextMenuClass: "_ADP_contextMenu"
		};
	},

    mixins: [FluxMixin, StoreWatchMixin("ContextMenuStore")],

    getStateFromFlux: function() {
        var flux = this.getFlux();
        return flux.store("ContextMenuStore").getState();
    },
	render: function(){
		if( this.state.menuVisibility === true)
		{
			var cm_style = {
				position: 'fixed',
				left: this.state.position.posX,
				top: this.state.position.posY,
				zIndex: 11,
				cursor: "pointer"
			};
			return (<div style={cm_style} className="panel panel-primary">
				<div className="panel-heading">Ad Size</div>
					<div className="panel-body">
						<AdTabs />
					</div>
				</div>);
		} else {
			return null;
		}
	}
});