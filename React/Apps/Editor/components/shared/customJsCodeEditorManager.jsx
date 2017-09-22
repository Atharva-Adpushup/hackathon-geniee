var React = window.React,
	Utils = require('libs/utils'),
	Row = require('BootstrapComponents/Row.jsx'),
	Col = require('BootstrapComponents/Col.jsx'),
	CustomJsCodeEditor = require('CustomComponents/CustomForm/CustomJsCodeEditor.jsx');

var CustomJsCodeEditorManager = React.createClass({
	getInitialState: function() {
		return {
			manageValue: false,
			value: this.props.code ? atob(this.props.code) : ''
		};
	},

	getDefaultProps: function() {
		return {};
	},

	onChange: function(code) {
		this.setState({
			value: code,
			manageValue: true
		});
	},

	onSave: function() {
		this.props.onSave(btoa(this.state.value));
		this.setState({ manageValue: false });
	},

	render: function() {
		return (
			<div className="containerButtonBar sm-pad">
				<CustomJsCodeEditor
					owner="channelIncontent"
					name="jsCodeEditor"
					value={this.state.value}
					onValueChange={this.onChange}
				/>

				<Row className="butttonsRow">
					<Col xs={6} md={6}>
						<Button
							disabled={!this.state.manageValue}
							className="btn-lightBg btn-save"
							onClick={this.onSave}
						>
							Save
						</Button>
					</Col>
					<Col xs={6} md={6}>
						<Button className="btn-lightBg btn-cancel" onClick={this.props.onBack}>
							Back
						</Button>
					</Col>
				</Row>
			</div>
		);
	}
});

module.exports = CustomJsCodeEditorManager;
