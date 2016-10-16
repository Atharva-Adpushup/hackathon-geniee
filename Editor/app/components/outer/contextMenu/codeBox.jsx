var React = window.React,
	Col = require('BootstrapComponents/Col.jsx'),
	Row = require('BootstrapComponents/Row.jsx'),
	Button = require('BootstrapComponents/Button.jsx'),
	CodeMirror = require('libs/third-party/codemirror/codemirror.min.js'),
	CodeMirrorJS = require('libs/third-party/codemirror/codemirror.javascript.min.js'),
	CodeMirrorEditor = require('CustomComponents/codeMirrorEditor.js');

module.exports = React.createClass({
	getInitialState: function() {
		return {
			code: this.props.code ? atob(this.props.code) : ''
		};
	},
	getDefaultProps: function() {
		return {};
	},
	save: function() {
		this.props.onSave(btoa(this.state.code));
	},
	render: function() {
		var cM = React.createFactory(CodeMirrorEditor);
		return (
			<div className="containerButtonBar">
				{this.state.error ? (<div>Some Error in Code, remove comma in last property if there.</div>) : null}
				{
					cM({
						// style: {border: '1px solid black'},
						textAreaClassName: ['form-control'],
						textAreaStyle: { minHeight: '5em' },
						value: this.state.code,
						mode: 'javascript',
						theme: 'solarized',
						onChange: function(e) {
							this.setState({ code: e.target.value });
						}.bind(this)
					})
				}
				<Row className="butttonsRow">
					{
						this.props.onBack ? (<div>
							<Col xs={6}>
								<Button disabled={!this.state.code} className="btn-lightBg btn-save" onClick={this.save}>Save</Button>
							</Col>
							<Col xs={6}>
								<Button className="btn-lightBg btn-cancel" onClick={this.props.onBack}>Back</Button>
							</Col>
						</div>) :

							(<div>
								<Col xs={6}>
									<Button disabled={!this.state.code} className="btn-lightBg btn-save" onClick={this.save}>Save</Button>
								</Col>
								<Col xs={6}>
									{this.props.onDelete ? (<Button className="btn-lightBg btn-cancel" onClick={this.props.onDelete}>Delete</Button>) : null}
								</Col>
							</div>)
					}
				</Row>
			</div>
		);
	}
});
