var React = window.React,
	CodeMirror = require('libs/third-party/codemirror/codemirror.min.js'),
	CodeMirrorJS = require('libs/third-party/codemirror/codemirror.javascript.min.js'),
	CodeMirrorEditor = require('CustomComponents/codeMirrorEditor.js'),
	Row = require('BootstrapComponents/Row.jsx'),
	Col = require('BootstrapComponents/Col.jsx');

module.exports = React.createClass({
	getInitialState: function() {
		var adRecoverStr = 'adRecover.',
			defaultState = '(function($){' + '\n ' + '\n ' + '\n ' + '})(adpushup.ap.$)',
			/*defaultIncontentState = "(function($){" +
                    '\n\t$.extend( window.apConfig,{'+
                    '\n\t\tadAwareness: false,//set true if want Auto analysis to be ad aware' +
                    '\n\t\tignoreRanges: [ ],// ranges in array as [[0, 100], [200, 230]];' +
                    '\n\t\tmaxOffset: 2000,//- Max offset till which ads should be tried provided no of ads > minPlacements.' +
                    '\n\t\tmaxPlacements: 5,//- Max no of placements that should be done.' +
                    '\n\t\tminPlacements: 3,//- Min no of placements that should be done.' +
                    '\n\t\tminDistance: 200,//- Minimum distance between two consecutive pointers that should be made' +
                    '\n\t\tignoreXpath: ""//- a particular css path to ignore' +
                    '\n\t})'+
                "\n " +
                "})($)",*/
			defaultIncontentState = '(function($){' + '\n ' + '\n ' + '\n ' + '})($)';

		defaultState = this.props.isAdRecover ? defaultState.replace(/adpushup./g, adRecoverStr) : defaultState;

		return {
			code: this.props.data.code
				? atob(this.props.data.code)
				: this.props.data.owner == 'channel_incontent' ? defaultIncontentState : defaultState
		};
	},
	getDefaultProps: function() {
		return {
			isAdRecover: false
		};
	},
	componentWillReceiveProps(nextProps) {},
	save: function() {
		if (this.props.data.owner == 'channel_incontent') {
			this.props.flux.actions.saveIncontentCustomJs(this.props.data.id, btoa(this.state.code));
		} else {
			this.props.flux.actions.saveChannelBeforeAfterJs(
				this.props.data.id,
				this.props.data.type,
				btoa(this.state.code)
			);
		}
		this.props.flux.actions.hideMenu();
	},
	close: function() {
		this.props.flux.actions.hideMenu();
	},
	render: function() {
		var CodeMirror = React.createFactory(CodeMirrorEditor);
		return (
			<Modal
				className="_ap_modal"
				onRequestHide={this.close}
				keyboard={true}
				title="Code Editor"
				backdrop="static"
				animation={true}
			>
				{CodeMirror({
					// style: {border: '1px solid black'},
					textAreaClassName: ['form-control'],
					textAreaStyle: { minHeight: '10em' },
					value: this.state.code,
					mode: 'javascript',
					theme: 'solarized',
					lineNumbers: true,
					gutters: ['CodeMirror-lint-markers'],
					lint: true,
					onChange: function(e) {
						this.setState({ code: e.target.value });
					}.bind(this)
				})}
				<Row className="modal-footer modalfooter-btn codeEditorFooter">
					<Col xs={6}>
						<Button ref="saveUrl" onClick={this.save} className="btn-lightBg btn-save">
							Save Code
						</Button>
					</Col>
					<Col xs={6}>
						<Button onClick={this.close} className="btn-lightBg btn-cancel">
							Close
						</Button>
					</Col>
				</Row>
			</Modal>
		);
	}
});
