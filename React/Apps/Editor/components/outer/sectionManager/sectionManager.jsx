var React = window.React,
	CommonConsts = require('editor/commonConsts'),
	Status = CommonConsts.enums.status;
(Button = require('BootstrapComponents/Button.jsx')),
	(Tree = require('./statsBaseUnit.jsx')),
	(EnableDisableSwitch = require('CustomComponents/EnableDisableSwitch.jsx')),
	(SectionStats = require('./sectionStats.jsx')),
	(Row = require('BootstrapComponents/Row.jsx')),
	(Col = require('BootstrapComponents/Col.jsx'));

module.exports = React.createClass({
	getInitialState: function() {
		return {
			activeSection: null,
			active: false,
			statsMode: false
		};
	},
	componentWillReceiveProps: function(nextProps) {
		if (this.props.channel.id !== nextProps.channel.id) {
			this.setState({ statsMode: false });
		}
	},
	getDefaultProps: function() {
		return {};
	},
	toggleSectionManager: function() {
		this.setState({ active: !this.state.active });
	},
	toggleStatsMode: function() {
		if (
			!this.state.statsMode &&
			(this.props.channel.statsStatus == Status.NOT_LOADED || this.props.channel.statsStatus == Status.FAILED)
		) {
			this.props.flux.actions.loadChannelStats(
				this.props.channel.id,
				this.props.channel.pageGroup,
				this.props.channel.platform
			);
		}
		this.setState({ statsMode: !this.state.statsMode });
	},
	handleMouseOver: function(section) {
		this.props.flux.actions.scrollSectionToScreen(section);
	},
	renderWaitMessage: function() {
		return <div className="message">Please wait loading stats.</div>;
	},
	renderFailMessage: function() {
		return <div className="message">Oops! error while loading stats.</div>;
	},
	renderWithStats: function() {
		if (this.props.channel.statsStatus == Status.LOADING) {
			return this.renderWaitMessage();
		} else if (this.props.channel.statsStatus == Status.FAILED) {
			return this.renderFailMessage();
		} else if (this.props.channel.statsStatus == Status.NOT_LOADED) {
			return this.renderFailMessage();
		} else {
			return (
				<ul className="list">
					<li className="statshead">
						<Row>
							<Col xs={3}>SectionName</Col>
							<Col xs={1}>Imp</Col>
							<Col xs={2}>Clicks</Col>
							<Col xs={1}>CTR</Col>
							<Col xs={2}>Xpath Miss</Col>
							<Col xs={2}>Active view</Col>
						</Row>
					</li>
					<li>
						<div className="statsWrapper">
							<ul>
								{_(this.props.sections).map(
									function(section) {
										if (section.stats)
											return (
												<SectionStats
													style={section.xpathMissing ? { backgroundColor: 'red' } : null}
													onMouseOver={this.handleMouseOver.bind(this, section)}
													name={section.name}
													data={section.stats}
												/>
											);
									}.bind(this)
								)}
							</ul>
						</div>
					</li>
				</ul>
			);
		}
	},
	renderWithoutStats: function() {
		return (
			<ul className="list">
				<li className="statshead">
					<Row>
						<Col xs={12}>SectionName</Col>
					</Row>
				</li>
				<li>
					<div className="statsWrapper">
						<ul>
							{_(this.props.sections).map(
								function(section) {
									return (
										<li
											className="level-og"
											key={section.id}
											style={section.xpathMissing ? { backgroundColor: 'red' } : null}
											onMouseOver={this.handleMouseOver.bind(this, section)}
										>
											<div className="row">
												<Col xs={12}>{section.name}</Col>
											</div>
										</li>
									);
								}.bind(this)
							)}
						</ul>
					</div>
				</li>
			</ul>
		);
	},
	renderCollapsed: function() {
		return null;
	},
	render: function() {
		if (!this.props.sections || !Array.isArray(this.props.sections) || !this.props.sections.length) return null;

		return (
			<div className={!this.state.active ? 'switcher-hidden' : null}>
				<div className={this.state.statsMode ? 'sectionManager statsmode' : 'sectionManager'}>
					<a onClick={this.toggleSectionManager} className="switcher-toggle" title="Toggle the switcher">
						Toggle
					</a>
					<div className="wrapper">
						<div className="heading">
							<a>Section Manager</a>
							<EnableDisableSwitch
								size="s"
								id={'statsMode'}
								onChange={this.toggleStatsMode}
								checked={this.state.statsMode}
								on="Stats"
								off="Nav"
							/>
						</div>
						<div className="content">
							{!this.state.active
								? this.renderCollapsed()
								: this.state.statsMode ? this.renderWithStats() : this.renderWithoutStats()}
						</div>
					</div>
				</div>
			</div>
		);
	}
});
