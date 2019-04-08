import React, { PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import Codemirror from 'react-codemirror';

class CodeEditor extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			code: this.props.code ? window.atob(this.props.code) : '',
			error: false
		};
		this.updateCode = this.updateCode.bind(this);
		this.save = this.save.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			code: window.atob(nextProps.code),
			error: false
		});
	}

	save() {
		try {
			JSON.parse(window.btoa(this.state.code));
			this.setState(
				{
					error: false
				},
				() => this.props.onSubmit(window.btoa(this.state.code))
			);
		} catch (e) {
			this.setState({ error: true });
		}
	}

	updateCode(code) {
		try {
			this.setState({ code, error: false }, () => (this.props.onChange ? this.props.onChange(code) : null));
		} catch (e) {
			console.log(e);
			this.setState({ error: true, code });
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
				{this.state.error && <div className="error-message">{this.props.error}</div>}
				<Codemirror
					value={this.state.code}
					onChange={this.updateCode}
					options={options}
					{...this.props.extra}
				/>
				{this.props.showButtons ? (
					<Row className="butttonsRow">
						<Col xs={6}>
							<Button
								disabled={this.state.error || this.state.empty}
								className="btn-lightBg btn-save"
								onClick={this.save}
							>
								Save
							</Button>
						</Col>
						{this.props.onCancel ? (
							<Col xs={6}>
								<Button className="btn-lightBg btn-cancel" onClick={this.props.onCancel}>
									Cancel
								</Button>
							</Col>
						) : (
							''
						)}
					</Row>
				) : null}
			</div>
		);
	}
}

CodeEditor.propTypes = {
	code: PropTypes.string,
	error: PropTypes.string.isRequired,
	showButtons: PropTypes.bool,
	onChange: PropTypes.func,
	onSubmit: PropTypes.func,
	onCancel: PropTypes.func
};

CodeEditor.defaultProps = {
	code: '{}',
	error: 'Some error occurred, please check your code.',
	showButtons: true,
	onChange: () => {},
	onSubmit: () => {},
	onCancel: () => {},
	extra: {}
};

export default CodeEditor;
