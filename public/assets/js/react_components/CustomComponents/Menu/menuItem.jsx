var React = window.React;

module.exports = React.createClass({
	mixins: [],
	propTypes: {
		contentExt: React.PropTypes.element,
		contentComponent: React.PropTypes.element.isRequired,
		contentHeading: React.PropTypes.string,
		icon: React.PropTypes.string,
		text: React.PropTypes.string,
		onClick: React.PropTypes.func,
		//onMouseOut: React.PropTypes.func,
		isActive: React.PropTypes.bool,
		onActive: React.PropTypes.func
	},
	getDefaultProps: function() {
		return {
			onActive: function() { },
			onClick: function() { }
		};
	},
	getInitialState: function() {
		return { activeNode: null };
	},
	handleClick: function(ev) {
		this.state.activeNode = ev.target;
		this.props.onClick(this.props.contentComponent, this.props.contentHeading, this.props.contentExt);
		this.props.onActive(this);
	},
	handleMouseOut: function() {
		this.state.activeNode = null;
		//this.props.onMouseOut(this.props.contentComponent,this.props.contentHeading)
	},
	render: function() {
		var content = [], self = this;

		function createMarkup(html) { return { __html: html } };

		if (this.props.icon == "apSize") {
			content.push(<i dangerouslySetInnerHTML={createMarkup(self.props.text.split(" ").join("</br>")) } className="apSize"></i>)
			content.push(<div className="apcross"></div>)
		}
		else {
			content.push(<i className={"fa " + this.props.icon}></i>)
		}
		return (
			<li key={this.props.key}>
				<a href="#" onClick={this.handleClick} className={this.props.isActive == true ? "MenuBarItem active " : "MenuBarItem"}>
					{content}
				</a>
				<div className="MenuBarItemRibbon">enable</div>
			</li>
		);
	}
})