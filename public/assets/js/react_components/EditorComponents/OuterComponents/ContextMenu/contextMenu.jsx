var React = window.React,
	$ = window.jQuery,
	    _ = require("libs/third-party/underscore");

var Fluxxor =  require("libs/third-party/fluxxor"),
    FluxMixin = Fluxxor.FluxMixin(React);

var InsertMenu = require("./insertMenu.jsx");
var EditMenu = require("./editMenu.jsx");

module.exports = React.createClass({

    mixins: [FluxMixin],

	render: function(){
		var cm_style = {
			position: 'fixed',
			left: this.props.position.posX,
			top: this.props.position.posY,
			zIndex: 10000,
			cursor: "pointer"
		};

		return (<div style={cm_style}  className="open">
					{ this.props.isInsert ? <InsertMenu adSizes={this.props.adSizes} audiences={this.props.audiences} insertOptions={this.props.insertOptions} parents={this.props.parents} /> :
											<EditMenu adSizes={this.props.adSizes}
												section={this.props.section}
												adNetworks={this.props.adNetworks}
												templates = {this.props.templates}
												activeChannel = {this.props.activeChannel}
												audiences={this.props.audiences}
												adSize={this.props.adSize}
												audienceId={this.props.audienceId}  /> }
				</div>);
	}
});