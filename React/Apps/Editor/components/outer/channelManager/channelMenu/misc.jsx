var React = window.React;

module.exports = React.createClass({
	getInitialState: function() {
		return {};
	},
	getDefaultProps: function() {
		return {};
	},
	handleClick: function(type) {
		this.props.showCodeEditor(type);
	},
	render: function() {
		return (
			<div>
				<div className="installBtnBg">
					<Row>
						<Col xs={12}>
							<Button
								className="btn-lightBg btn-before btn-block"
								onClick={this.handleClick.bind(this, 'beforeAp')}
							>
								Before Js
							</Button>
						</Col>
					</Row>
				</div>
				<div className="installBtnBg">
					<Row>
						<Col xs={12}>
							<Button
								className="btn-lightBg btn-after btn-block"
								onClick={this.handleClick.bind(this, 'afterAp')}
							>
								After Js
							</Button>
						</Col>
					</Row>
				</div>
			</div>
		);
	}
});
