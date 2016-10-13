var React = window.React,
	$ = window.jQuery,
	ContentArea = require('./content.jsx'),
	Glass = require('../glass.jsx'),
	ContentExtension = require('./contentExtension.jsx');

module.exports = React.createClass({
	mixins: [],
	propTypes: {
		activeItem: React.PropTypes.number,
		defaultActiveComponent: React.PropTypes.element,
		targetX: React.PropTypes.number.isRequired,
		targetY: React.PropTypes.number.isRequired,
		onGlassClick: React.PropTypes.func,
		arrow: React.PropTypes.string
	},
	getDefaultProps: function() {
		return {
			arrow: 'top'
		};
	},
	componentWillReceiveProps: function(nextprops) {
		if ((typeof nextprops.activeItem != 'undefined')) {
			this.setState(this.getInitialState(nextprops));
		}
	},
	getInitialState: function(props) {
		props = props || this.props;
		return {
			hide: false,
			activeItem: props.activeItem || 0,
			activeComponent: (typeof props.activeItem != 'undefined') ? props.children[props.activeItem].props.contentComponent : (props.defaultActiveComponent || null),
			activeHeading: (typeof props.activeItem != 'undefined') ? props.children[props.activeItem].props.contentHeading : (null),
			contentExt: (typeof props.activeItem != 'undefined') ? props.children[props.activeItem].props.contentExt : (null)
		};
	},
	handleItemClick: function(itemNumber, Component, heading, contentExt) {
		if (typeof this.props.onActiveMenuChange == 'function') {
			this.props.onActiveMenuChange(itemNumber);
		}
		else {
			this.setState({
				activeItem: itemNumber,
				activeComponent: Component,
				activeHeading: heading,
				contentExt: contentExt
			});
		}
	},
	fixCss: function() {
		var $contentWrapper = $(React.findDOMNode(this.refs.contentArea)),
			$contentEl = $contentWrapper.find('.MenuBarContainer'),
			$contentExt = $(React.findDOMNode(this.refs.contentExt)),
			$main = $(React.findDOMNode(this.refs.main)),
			$toolBar = $(React.findDOMNode(this.refs.toolBar)),
			screenWidth = $(window).width(),
			screenHeight = $(window).height();

		if (this.props.targetX > (screenWidth / 2)) {
			$main.css({ right: screenWidth - this.props.targetX, left: '' });
		}

		if ($contentEl.height() < $toolBar.height()) {
			$contentWrapper.css({ height: $toolBar.height() + 80 });
		} else {
			$contentWrapper.css({ height: $contentEl.height() + 80 });
		}

		if ($contentExt.length) {
			var extAreWidth = ($contentWrapper.width() / 2);
			$contentExt.css({ 'min-width': $contentWrapper.width() / 3, 'max-width': extAreWidth });
			$main.css({ width: $contentWrapper.width() + (($contentWrapper.width() / 2) + 40) });
		} else {
			$main.css({ width: $contentWrapper.width() + 40 });
		}

		if ($main.get(0).getBoundingClientRect().bottom > screenHeight) {
			$main.css({ top: this.props.targetY - $main.height() });
		}

		$main.css({ opacity: 1 });
	},
	componentDidMount: function() {
		this.fixCss();
	},
	componentDidUpdate: function() {
		this.fixCss();
	},
	handleComponentUpdate: function() {
		this.fixCss();
	},
	handleItemMouseOut: function(itemNumber) {

	},
	calculatePosition: function() {

	},
	getArrowClass: function() {
		switch (this.props.arrow) {
			case 'top':
				return 'arrowTop';
			case 'none':
				return '';
			default:
				return 'arrowBottom';
		}
	},
	getMenuOrientationClass: function() {
		var part1, part2;
		part1 = 'Top';// /(this.props.targetY > (window.screen.availHeight / 2)) ? "Bottom" : "Top"; //consider only Top until menu is fixed properly
		part2 = (this.props.targetX > ($(window).width() / 2)) ? 'Right' : 'Left';

		return part1 + part2;
	},
	onGlassClick: function() {
		if (this.props.onGlassClick) {
			this.props.onGlassClick();
		} else {
			this.setState({ hide: true });
		}
	},
	render: function() {
		var self = this,
			activeComponent = React.addons.cloneWithProps(this.state.activeComponent, {
				onUpdate: self.handleComponentUpdate
			});
		var style = {
			position: 'absolute',
			opacity: 0,
			top: this.props.targetY,
			left: this.props.targetX,
			zIndex: 10000
		};
		if (this.state.hide) {
			return (null);
		}

		return (
			<div >
				<Glass clickHandler={this.onGlassClick}/>
				<div id={this.props.id ? this.props.id : null} ref="main" style={style}>
					<div className={'MenuBarComponentWrap ' + this.getMenuOrientationClass() }>
						<ul ref="toolBar" className={'MenuBarWrapper ' + this.getArrowClass() }>
							{this.props.children.map(function(el, index) {
								return React.addons.cloneWithProps(el, {
									onClick: self.handleItemClick.bind(this, index),
									key: index,
									isActive: (self.state.activeItem === index)
								});
							}.bind(this)) }
						</ul>
						{this.state.activeComponent ? <ContentArea icon={this.props.children[this.state.activeItem].props.icon} ref="contentArea" activeComponent={activeComponent} activeHeading={this.state.activeHeading} /> : null}
						{this.state.contentExt ? <ContentExtension ref="contentExt">{this.state.contentExt}</ContentExtension> : null}
					</div>
				</div>
			</div>
		);
	}
})
	;