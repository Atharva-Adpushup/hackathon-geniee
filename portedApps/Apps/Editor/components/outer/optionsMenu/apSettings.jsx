var React = window.React,
	Utils = require('libs/utils'),
	CommonConsts = require('editor/commonConsts'),
	Row = require('BootstrapComponents/Row.jsx'),
	Input = require('BootstrapComponents/Input.jsx'),
	Button = require('BootstrapComponents/Button.jsx'),
	EnableDisableSwitch = require('CustomComponents/EnableDisableSwitch.jsx'),
	BlockListManager = require('./blockListManager.jsx'),
	TextRangeListManager = require('CustomComponents/TextRangeListManager.jsx'),
	NumericCollectionManager = require('CustomComponents/NumericCollectionManager.jsx'),
	Col = require('BootstrapComponents/Col.jsx');

module.exports = React.createClass({
	mixins: [React.addons.LinkedStateMixin],
	getDefaultProps: function() {
		return {};
	},
	getInitialState: function(props) {
		props = props || this.props;
		return {
			displayMethod: props.apConfigs.displayMethod == CommonConsts.enums.site.displayMethod.ASYNC,
			adpushupPercentage: props.apConfigs.adpushupPercentage,
			engineRequestTimeout: props.apConfigs.engineRequestTimeout,
			xpathWaitTimeout: props.apConfigs.xpathWaitTimeout,
			explicitPlatform: props.apConfigs.explicitPlatform,
			manageBlockList: false,
			managePageGroupPattern: false,
			manageTrafficDistribution: false
		};
	},
	componentWillReceiveProps: function(nextprops) {
		if (
			Utils.deepDiffMapper.test(this.props.apConfigs, nextprops.apConfigs).isChanged &&
			!this.state.manageBlockList
		) {
			this.setState(this.getInitialState(nextprops));
		}
	},
	setValue: function(target, ev) {
		var val = parseInt(ev.currentTarget.value);
		switch (target) {
			case 'adpushupPercentage':
				if (val > 100) this.setState({ adpushupPercentage: 100 });
				else if (val < 0) this.setState({ adpushupPercentage: 0 });
				else this.setState({ adpushupPercentage: val });
				break;
			case 'engineRequestTimeout':
				if (val < 1000) this.setState({ engineRequestTimeout: 1000 });
				else this.setState({ engineRequestTimeout: val });
				break;
			case 'xpathWaitTimeout':
				if (val < 1000) this.setState({ xpathWaitTimeout: 1000 });
				else this.setState({ xpathWaitTimeout: val });
				break;
		}
	},
	toggleDisplayMethod: function(method) {
		this.setState({ displayMethod: method });
	},
	toggleListManagers: function(name) {
		switch (name) {
			case 'blockList':
				this.setState({ manageBlockList: !this.state.manageBlockList }, function() {
					this.props.onUpdate();
				});
				break;

			case 'pageGroupPattern':
				this.setState({ managePageGroupPattern: !this.state.managePageGroupPattern }, function() {
					this.props.onUpdate();
				});
				break;

			case 'trafficDistribution':
				this.setState(
					{ manageTrafficDistribution: !this.state.manageTrafficDistribution },
					function() {
						this.props.onUpdate();
					}
				);
		}
	},
	toggleExplicitPlatform: function(value) {
		this.setState({ explicitPlatform: value });
	},
	saveSettings: function() {
		this.props.onSave({
			displayMethod: this.state.displayMethod
				? CommonConsts.enums.site.displayMethod.ASYNC
				: CommonConsts.enums.site.displayMethod.SYNC,
			adpushupPercentage: this.state.adpushupPercentage,
			engineRequestTimeout: this.state.engineRequestTimeout,
			xpathWaitTimeout: this.state.xpathWaitTimeout,
			explicitPlatform: this.state.explicitPlatform
		});
		this.props.hideMenu();
	},
	saveBlockList: function(blocklist) {
		this.props.onSave({ blocklist: blocklist });
	},
	savePageGroupPatternList: function(list) {
		var isAdRecover = this.isAdRecoverInSite(),
			isApex = this.props.isApex,
			config = {};

		if (isAdRecover) {
			config = { adRecover: { pageGroupPattern: list } };
		} else if (isApex) {
			config = { pageGroupPattern: list };
		}

		this.props.onSave(config);
	},
	saveTrafficDistributionConfig: function(config) {
		this.props.onSave({ trafficDistribution: config });
	},
	renderPageGroupPatternLayout: function() {
		return (
			<Row>
				<Col className="u-padding-r10px" xs={12}>
					<Button
						className="btn-lightBg btn-edit"
						onClick={this.toggleListManagers.bind(null, 'pageGroupPattern')}
					>
						Manage Page Group Pattern
					</Button>
				</Col>
			</Row>
		);
	},
	renderTrafficDistributionLayout: function() {
		return (
			<Row>
				<Col className="u-padding-r10px" xs={12}>
					<Button
						className="btn-lightBg btn-edit"
						onClick={this.toggleListManagers.bind(null, 'trafficDistribution')}
					>
						Manage Traffic Distribution
					</Button>
				</Col>
			</Row>
		);
	},
	isAdRecoverInSite: function() {
		var isAdRecover = false,
			arr = this.props.allChannels;

		if (Array.isArray(arr) && arr.length > 0) {
			arr.map(function(channel) {
				if (channel.isAdRecover) {
					isAdRecover = true;
				}
			});
		}

		return isAdRecover;
	},

	render: function() {
		if (this.state.manageBlockList) {
			return (
				<BlockListManager
					renderInputText={true}
					blockList={this.props.apConfigs.blocklist || []}
					onSave={this.saveBlockList}
					onBack={this.toggleListManagers.bind(null, 'blockList')}
				/>
			);
		}

		if (this.state.managePageGroupPattern) {
			var listArr = this.isAdRecoverInSite()
				? this.props.apConfigs.adRecover.pageGroupPattern
				: this.props.isApex
				? this.props.apConfigs.pageGroupPattern || []
				: [];

			return (
				<TextRangeListManager
					list={listArr}
					onSave={this.savePageGroupPatternList}
					onBack={this.toggleListManagers.bind(null, 'pageGroupPattern')}
				/>
			);
		}

		if (this.state.manageTrafficDistribution) {
			var collection = this.props.allChannels;

			return (
				<NumericCollectionManager
					savedCollection={this.props.apConfigs.trafficDistribution}
					collection={collection}
					onSave={this.saveTrafficDistributionConfig}
					onBack={this.toggleListManagers.bind(null, 'trafficDistribution')}
				/>
			);
		}

		var isChanged = Utils.deepDiffMapper.test(this.state, this.getInitialState(this.props))
			.isChanged;
		return (
			<div className="containerButtonBar sm-pad">
				<Row>
					<Col className="u-padding-r10px" xs={8}>
						<b>Adpushup Percentage</b>
					</Col>
					<Col className="u-padding-r10px" xs={4}>
						<input
							type="number"
							onChange={this.setValue.bind(null, 'adpushupPercentage')}
							value={this.state.adpushupPercentage}
						/>
					</Col>
				</Row>
				<Row>
					<Col className="u-padding-r10px" xs={8}>
						<b>E3 Timeout</b>
					</Col>
					<Col className="u-padding-r10px" xs={4}>
						<input
							type="number"
							onChange={this.setValue.bind(null, 'engineRequestTimeout')}
							value={this.state.engineRequestTimeout}
						/>
					</Col>
				</Row>
				<Row>
					<Col className="u-padding-r10px" xs={8}>
						<b>Xpath Timeout</b>
					</Col>
					<Col className="u-padding-r10px" xs={4}>
						<input
							type="number"
							onChange={this.setValue.bind(null, 'xpathWaitTimeout')}
							value={this.state.xpathWaitTimeout}
						/>
					</Col>
				</Row>

				<Row>
					<Col className="u-padding-r10px" xs={8}>
						<b>Display Method</b>
					</Col>
					<Col xs={4}>
						<EnableDisableSwitch
							size="s"
							id="displayType"
							onChange={this.toggleDisplayMethod}
							checked={this.state.displayMethod}
							on="Async"
							off="Sync"
						/>
					</Col>
				</Row>
				<Row>
					<Col className="u-padding-r10px" xs={8}>
						<b>Platform Explicit</b>
					</Col>
					<Col xs={4}>
						<EnableDisableSwitch
							size="s"
							id="explicit Platform"
							onChange={this.toggleExplicitPlatform}
							checked={this.state.explicitPlatform}
							on="Yes"
							off="No"
						/>
					</Col>
				</Row>
				{/* <Row>
					<Col className="u-padding-r10px" xs={12}>
						<Button
							className="btn-lightBg btn-edit"
							onClick={this.toggleListManagers.bind(null, 'blockList')}
						>
							Manage BlockList
						</Button>
					</Col>
				</Row> */}
				{this.isAdRecoverInSite() || this.props.isApex ? this.renderPageGroupPatternLayout() : null}
				{this.props.isApex ? this.renderTrafficDistributionLayout() : null}

				<Row className="butttonsRow">
					<Col className="pd-10" xs={12}>
						<Button
							disabled={!isChanged}
							className="btn-lightBg btn-save btn-block"
							onClick={this.saveSettings}
						>
							Save
						</Button>
					</Col>
				</Row>
			</div>
		);
	}
});
