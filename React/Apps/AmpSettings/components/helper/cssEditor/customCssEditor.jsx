import React, { PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import Codemirror from 'react-codemirror';

//require('libs/codemirror/codemirror.min');
//require('libs/codemirror/codemirror.javascript.min');
//	CodeMirrorEditor = require('shared/codeMirrorEditor');

class customCssEditor extends React.Component {
	constructor(props) {
		super(props);
		let css = JSON.stringify(props.css);
		css = css.replace(/,/g, ',\r\n');
		css = css.replace(/{/, '{\r\n');
		css = css.replace(/}/, '\r\n}');
		this.state = {
			css: css || '{\r\n}',
			error: false
		};

		this.updateCode = this.updateCode.bind(this);
		this.save = this.save.bind(this);
	}

	save() {
		try {
			this.props.onSubmit(JSON.parse(this.state.css));
		} catch (e) {
			this.setState({ error: true });
		}
	}

	updateCode(newCss) {
		try {
			JSON.parse(newCss);
			this.setState({ css: newCss, error: false });
		} catch (e) {
			this.setState({ error: true, css: newCss });
		}
	}

	render() {
		const options = {
			// style: {border: '1px solid black'},
			textAreaClassName: ['form-control'],
			textAreaStyle: { minHeight: '5em' },
			mode: 'javascript',
			theme: 'solarized',
			lineNumbers: true
		},
		isCompact = !!(this.props.compact),
		compactStyles = isCompact ? {paddingBottom: '70px'} : {};

		return (
			<div style={compactStyles} className="containerButtonBar">
				{this.state.error && <div>Some Error in CSS, remove comma in last property if there.</div>}
				<Codemirror value={this.state.css} onChange={this.updateCode} options={options} />

				<Row className="butttonsRow">
					<Col xs={6}>
						<Button disabled={this.state.error} className="btn-lightBg btn-save" onClick={this.save}>
							Save
						</Button>
					</Col>
					<Col xs={6}>
						<Button className="btn-lightBg btn-cancel" onClick={this.props.onCancel}>
							Cancel
						</Button>
					</Col>
				</Row>
			</div>
		);
	}
}

customCssEditor.propTypes = {
	css: PropTypes.object.isRequired,
	onSubmit: PropTypes.func.isRequired,
	onCancel: PropTypes.func.isRequired
};

customCssEditor.defaultProps = {
	css: '{}'
};

export default customCssEditor;
