import React, { PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import Codemirror from 'react-codemirror';

class customCodeEditor extends React.Component {
	constructor(props) {
		super(props);

		const code = this.props.code ? this.props.code : '';
		this.state = {
			code: this.props.textEdit ? code : atob(code),
			error: false
		};
		this.updateCode = this.updateCode.bind(this);
		this.save = this.save.bind(this);
		this.updateCode = this.updateCode.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			code: nextProps.textEdit ? nextProps.code : atob(nextProps.code),
			error: false
		});
	}

	save() {
		try {
			!this.props.textEdit ? this.props.onSubmit(btoa(this.state.code)) : this.props.onSubmit(this.state.code);
		} catch (e) {
			console.log(e);
			this.setState({ error: true });
		}
	}

	updateCode(code) {
		try {
			this.setState({ code, error: false }, () => {
				return this.props.onChange ? this.props.onChange(code) : null;
			});
		} catch (e) {
			this.setState({ error: true });
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

		// Check if code box is a redux form component
		if (this.props.isField) {
			const { label, input, meta } = this.props.field;
			return (
				<div key={this.props.customId}>
					<Col xs={12} className="u-padding-r10px">
						<Row>
							<Col xs={5} className="u-padding-r10px">
								<strong>{label}</strong>
							</Col>
							<Col xs={7} className="u-padding-r10px">
								<Codemirror
									value={this.state.code}
									onChange={this.updateCode}
									options={options}
									{...input}
								/>
								{meta.touched && meta.error && <div className="error-message">{meta.error}</div>}
							</Col>
						</Row>
					</Col>
				</div>
			);
		} else {
			// Check if code box is meant to be a regular text editor
			if (this.props.textEdit) {
				let className = 'codeEditor-small ',
					disabled = this.props.enableSave ? false : this.props.code == '' ? true : false;

				className += this.props.parentExpanded ? ' codeEditor-large' : ' ';

				return (
					<div className={className} key={this.props.customId}>
						<Codemirror value={this.state.code} onChange={this.updateCode} options={options} />
						<br />
						{this.props.showButtons
							? <Button
									disabled={this.state.code == ''}
									className="btn-lightBg btn-save"
									onClick={this.save}
								>
									{this.props.textEditBtn ? this.props.textEditBtn : 'Save'}
								</Button>
							: null}
					</div>
				);
			} else {
				let className = this.props.showButtons ? 'containerButtonBar' : '';
				if (this.props.size == 'small') {
					className += ' pd-b100';
				}
				return (
					<div className={className} key={this.props.customId}>
						{this.state.error && <div>Some Error in Code, remove comma in last property if there.</div>}
						<Codemirror value={this.state.code} onChange={this.updateCode} options={options} />
						{this.props.showButtons
							? <Row className="butttonsRow">
									<Col xs={6}>
										<Button
											disabled={this.state.error}
											className="btn-lightBg btn-save"
											onClick={this.save}
										>
											Save
										</Button>
									</Col>
									<Col xs={6}>
										<Button className="btn-lightBg btn-cancel" onClick={this.props.onCancel}>
											{this.props.cancelText || 'Cancel'}
										</Button>
									</Col>
								</Row>
							: ''}
					</div>
				);
			}
		}
	}
	static defaultProps = {
		enableSave: false
	};
}

customCodeEditor.propTypes = {
	code: PropTypes.string,
	key: PropTypes.string,
	isField: PropTypes.bool,
	textEdit: PropTypes.bool,
	enableSave: PropTypes.bool,
	textEditBtn: PropTypes.string,
	size: PropTypes.string,
	showButtons: PropTypes.bool,
	parentExpanded: PropTypes.bool,
	onSubmit: PropTypes.func,
	onCancel: PropTypes.func,
	onChange: PropTypes.func,
	cancelText: PropTypes.string
};

export default customCodeEditor;
