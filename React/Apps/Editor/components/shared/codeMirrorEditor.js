const React = require('react'),
	ReactDOM = require('react-dom');
let CodeMirror;

// adapted from:
// https://github.com/facebook/react/blob/master/docs/_js/live_editor.js#L16

// also used as an example:
// https://github.com/facebook/react/blob/master/src/browser/ui/dom/components/ReactDOMInput.js

const IS_MOBILE =
	typeof navigator === 'undefined' ||
	(navigator.userAgent.match(/Android/i) ||
		navigator.userAgent.match(/webOS/i) ||
		navigator.userAgent.match(/iPhone/i) ||
		navigator.userAgent.match(/iPad/i) ||
		navigator.userAgent.match(/iPod/i) ||
		navigator.userAgent.match(/BlackBerry/i) ||
		navigator.userAgent.match(/Windows Phone/i));

if (!IS_MOBILE) {
	CodeMirror = require('libs/codemirror/codemirror.min.js');
}

const CodeMirrorEditor = React.createClass({
	getInitialState() {
		return { isControlled: this.props.value != null };
	},

	propTypes: {
		value: React.PropTypes.string,
		defaultValue: React.PropTypes.string,
		style: React.PropTypes.object,
		className: React.PropTypes.string,
		onChange: React.PropTypes.func
	},

	componentDidMount() {
		const isTextArea = this.props.forceTextArea || IS_MOBILE;
		if (!isTextArea) {
			this.editor = CodeMirror.fromTextArea(ReactDOM.findDOMNode(this.refs.editor), this.props);
			this.editor.on('change', this.handleChange);
		}
	},

	componentDidUpdate() {
		if (this.editor) {
			if (this.props.value != null) {
				if (this.editor.getValue() !== this.props.value) {
					this.editor.setValue(this.props.value);
				}
			}
		}
	},

	handleChange() {
		if (this.editor) {
			const value = this.editor.getValue();
			if (value !== this.props.value) {
				this.props.onChange && this.props.onChange({ target: { value } });
				if (this.editor.getValue() !== this.props.value) {
					if (this.state.isControlled) {
						this.editor.setValue(this.props.value);
					} else {
						this.props.value = value;
					}
				}
			}
		}
	},

	render() {
		const editor = React.createElement('textarea', {
			ref: 'editor',
			value: this.props.value,
			readOnly: this.props.readOnly,
			defaultValue: this.props.defaultValue,
			onChange: this.props.onChange,
			style: this.props.textAreaStyle,
			lineNumbers: true,
			extraKeys: { 'Ctrl-Space': 'autocomplete' },
			className: this.props.textAreaClassName || this.props.textAreaClass
		});

		return React.createElement('div', { style: this.props.style, className: this.props.className }, editor);
	}
});

module.exports = CodeMirrorEditor;
