var React = window.React,
	Menu = require('CustomComponents/Menu/menu.jsx'),
	MenuItem = require('CustomComponents/Menu/menuItem.jsx'),
	AdSizeSelector = require('./adSizeSelector.jsx'),
	ParentSelector = require('./parentSelector.jsx'),
	Row = require('BootstrapComponents/Row.jsx'),
	Col = require('BootstrapComponents/Col.jsx'),
	CommonConsts = require('editor/commonConsts'),
	CodeBox = require('./codeBox.jsx'),
	cmds = CommonConsts.enums.actionManager.publicCommands,
	levels = CommonConsts.enums.actionManager.levels,
	Fluxxor = require('libs/third-party/fluxxor'),
	FluxMixin = Fluxxor.FluxMixin(React);


module.exports = React.createClass({
	mixins: [FluxMixin],

	getInitialState: function() {
		return {
			activeMenuItem: 0/* (this.props.insertOptions.length + 1)*/,
			adSize: null,
			position: null,
			activePosition: null,
			showCodeBox: false
		};
	},
	insertAdSize: function(position, adSize) {
		// if apex is set then on size click we need to show the code box component
		if (this.props.apex) {
			this.setState({ adSize: adSize, position: position, showCodeBox: true });
			return;
		}

		if (this.props.section) {
			this.getFlux().actions.createAction({
				name: cmds.ADD_SIZE_TO_SECTION,
				owner: levels.SECTION,
				ownerId: this.props.section.id,
				audienceId: this.props.audiences[0].id,
				adSize: adSize
			});
		} else {
			this.getFlux().actions.addSection(this.props.parents[0].xpath, position, adSize, this.props.audiences[0].id);
		}
		this.props.intro.exit();
	},
	onGlassClick: function() {
		this.getFlux().actions.hideMenu();
	},
	handleClickForIntro: function() {
		this.props.intro.goToStep(8);
	},
	// CodeBox Fucntions
	onCodeBoxSave: function(adCode) {
		this.getFlux().actions.addSection(this.props.parents[0].xpath, this.state.position, this.state.adSize, this.props.audiences[0].id, adCode);
	},
	onCodeBoxBack: function() {
		this.setState({ adSize: null, position: null, showCodeBox: false });
	},
	render: function() {
		var items = [];
		if (this.state.showCodeBox) {
			items.push( <MenuItem
					onClick = {this.handleClickForIntro}
					icon= "ap-append"
					contentComponent={<CodeBox onSave={this.onCodeBoxSave} onBack={this.onCodeBoxBack}/>}
					contentHeading={'AdCode'}
					/>
				);
		} else {
			items = this.props.insertOptions.map(function(option) {
				var Class = 'ap-append';
				if (option === 'Prepend') {
					Class = 'ap-prepend';
				} else if (option === 'Insert After') {
					Class = 'ap-insertafter';
				} else if (option === 'Insert Before') {
					Class = 'ap-insertbefore';
				}

				return (
					<MenuItem
						onClick = {this.handleClickForIntro}
						icon={Class}
						contentComponent={<AdSizeSelector
							tabSelect={this.tabSelect}
							activeTab={0}
							flux={this.getFlux() }
							checked={this.state.adSize}
							adSizes={this.props.adSizes}
							onCheckedItem={this.insertAdSize.bind(null, option) }/>
						}
						contentHeading={option}
						/>
				);
			}.bind(this));
		}
		items.push((<MenuItem icon="fa-sitemap" contentComponent={<ParentSelector  selectors={this.props.parents} />} contentHeading="Select Parent"/>));
		return (
			<Menu id="insertMenu" arrow="none" onGlassClick={this.onGlassClick} targetX={this.props.position.posX} targetY={this.props.position.posY} activeItem={this.state.activeMenuItem}>
				{items}
			</Menu>
		);
	}
});
