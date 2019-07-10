var React = window.React,
	Utils = require('libs/utils'),
	Row = require('BootstrapComponents/Row.jsx'),
	Col = require('BootstrapComponents/Col.jsx'),
	CustomCssEditor = require('CustomComponents/CustomForm/CustomCssEditor.jsx'),
	Panel = require('BootstrapComponents/Panel.jsx'),
	Accordion = require('BootstrapComponents/Accordion.jsx');

module.exports = React.createClass({
	getInitialState: function() {
		return {
			currentMargin: '',
			leftMargin: this.props.blockList.left,
			rightMargin: this.props.blockList.right,
			noneMargin: this.props.blockList.none
		};
	},

	getDefaultProps: function() {
		var defaultMargins = {
			'margin-left': 0,
			'margin-right': 0,
			'margin-top': 0,
			'margin-bottom': 0
		};

		return {
			blockList: {
				left: defaultMargins,
				none: defaultMargins,
				right: defaultMargins
			}
		};
	},

	onChange: function(name, value) {
		switch (name) {
			case 'leftMargin':
				this.setState({ currentMargin: name, leftMargin: value });
				break;

			case 'noneMargin':
				this.setState({ currentMargin: name, noneMargin: value });
				break;

			case 'rightMargin':
				this.setState({ currentMargin: name, rightMargin: value });
				break;
		}
	},

	onSave: function() {
		var margins = {
			left: this.state.leftMargin,
			none: this.state.noneMargin,
			right: this.state.rightMargin
		};

		this.props.onSave(margins);
		this.setState({ currentMargin: '' });
	},

	render: function() {
		return (
			<div className="containerButtonBar sm-pad">
				<Accordion defaultActiveKey="1">
					<Panel header="Left Margin" eventKey="1">
						<CustomCssEditor
							labelText="Left"
							name="leftMargin"
							value={this.state.leftMargin}
							onValueChange={this.onChange.bind(null, 'leftMargin')}
						/>
					</Panel>

					<Panel header="Center Margin" eventKey="2">
						<CustomCssEditor
							labelText="Center"
							name="noneMargin"
							value={this.state.noneMargin}
							onValueChange={this.onChange.bind(null, 'noneMargin')}
						/>
					</Panel>

					<Panel header="Right Margin" eventKey="3">
						<CustomCssEditor
							labelText="Right"
							name="rightMargin"
							value={this.state.rightMargin}
							onValueChange={this.onChange.bind(null, 'rightMargin')}
						/>
					</Panel>
				</Accordion>

				<Row className="butttonsRow">
					<Col xs={6} md={6}>
						<Button
							disabled={!this.state.currentMargin}
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
