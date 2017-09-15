import React, { PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import Codemirror from 'react-codemirror';

//require('libs/codemirror/codemirror.min');
//require('libs/codemirror/codemirror.javascript.min');
//	CodeMirrorEditor = require('shared/codeMirrorEditor');

class CodeEditor extends React.Component {
	constructor(props) {
		super(props);
		let code = JSON.stringify(props.code, null, 4);
		//code = formatCode(code);

		this.state = {
			code: code || '{\r\n}',
			error: false,
			empty: !this.props.code || !Object.keys(this.props.code).length ? true : false
		};

		this.updateCode = this.updateCode.bind(this);
		this.save = this.save.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		this.setState({ code: JSON.stringify(nextProps.code, null, 4) });
	}

	save() {
		try {
			this.props.onSubmit(JSON.parse(this.state.code));
		} catch (e) {
			this.setState({ error: true });
		}
	}

	updateCode(newCode) {
		try {
			JSON.parse(this.state.code);
		
			if(!newCode || !Object.keys(newCode).length) {
				this.setState({ empty: true });
			} else {
				this.setState({ empty: false });
			}

			this.setState({ code: newCode, error: false });
		} catch (e) {
			this.setState({ error: true, code: newCode });
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
		};
		return (
			<div className="containerButtonBar">
				{this.state.error && (<div className="error-message">{this.props.error}</div>)}
				<Codemirror value={this.state.code} onChange={this.updateCode} options={options} />

				<Row className="butttonsRow">
					<Col xs={6}>
						<Button disabled={this.state.error || this.state.empty} className="btn-lightBg btn-save" onClick={this.save}>Save</Button>
					</Col>
					{
						this.props.onCancel ? (
							<Col xs={6}>
								<Button className="btn-lightBg btn-cancel" onClick={this.props.onCancel}>Cancel</Button>
							</Col>
						) : ''
					}
				</Row>
			</div>
		);
	}
}

CodeEditor.propTypes = {
	code: PropTypes.object.isRequired,
	error: PropTypes.string.isRequired,
	onSubmit: PropTypes.func.isRequired,
	onCancel: PropTypes.func
};

CodeEditor.defaultProps = {
	code: '{}',
	error: 'Some error occurred, please check your code.'
};

export default CodeEditor;
