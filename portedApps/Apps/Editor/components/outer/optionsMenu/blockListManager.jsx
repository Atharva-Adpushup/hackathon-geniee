var React = window.React,
	Utils = require('libs/utils'),
	Row = require('BootstrapComponents/Row.jsx'),
	Col = require('BootstrapComponents/Col.jsx'),
	Input = require('BootstrapComponents/Input.jsx'),
	ListView = require('listView.jsx');

module.exports = React.createClass({
	getInitialState: function() {
		return {
			activeItem: null,
			name: ''
		};
	},
	getDefaultProps: function() {
		return {};
	},
	onremove: function(item) {
		if (confirm('Are you sure you want to delete url from list ?')) {
			var blockList = this.props.blockList;
			var index = this.props.blockList.indexOf(item);

			blockList.splice(index, 1);
			this.props.onSave(blockList);
		}
	},
	onActive: function(item) {
		var index = this.props.blockList.indexOf(item);
		this.setState({ activeItem: index, name: this.props.blockList[index] });
	},
	handleChange: function(ev) {
		ev.target.value ? this.setState({ name: ev.target.value.trim() }) : this.setState({ name: '' });
	},
	onSave: function() {
		var blockList = this.props.blockList;

		this.state.name = Utils.trimString(this.state.name);
		if (this.state.activeItem !== null) {
			blockList[this.state.activeItem] = this.state.name;
		} else if (blockList.indexOf(this.state.name) == -1) {
			blockList.push(this.state.name);
		}
		this.props.onSave(blockList);
		this.setState(this.getInitialState());
	},
	render: function() {
		var allset = this.state.name && this.state.name.length;
		try {
			allset && new RegExp(this.state.name);
		} catch (e) {
			allset = false;
		}

		return (
			<div className="containerButtonBar sm-pad">
				<Row>
					<Col xs={12}>
						<Input type="text" onChange={this.handleChange} value={this.state.name} />
					</Col>
					<Col xs={12}>
						<Button disabled={!allset} className="btn-lightBg btn-save btn-block" onClick={this.onSave}>
							Add New
						</Button>
					</Col>
				</Row>

				<Row>
					<ListView
						items={this.props.blockList || ['http://test.com']}
						removeHandler={this.onremove}
						addHandler={this.onActive}
					/>
				</Row>

				<Row className="butttonsRow">
					<Col xs={12}>
						<Button className="btn-lightBg btn-cancel btn-block" onClick={this.props.onBack}>
							Back
						</Button>
					</Col>
				</Row>
			</div>
		);
	}
});
