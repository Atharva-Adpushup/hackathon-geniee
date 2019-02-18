import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import Codemirror from 'react-codemirror';

class customCodeEditor extends React.Component {
	static defaultProps = {
		enableSave: false,
		code: '',
		textEdit: false,
		onChange: () => {}
	};

	constructor(props) {
		super(props);
		const { code, textEdit } = this.props;
		this.state = {
			code: textEdit ? code : window.atob(code),
			error: false
		};
		this.updateCode = this.updateCode.bind(this);
		this.save = this.save.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			code: nextProps.textEdit ? nextProps.code : window.atob(nextProps.code),
			error: false
		});
	}

	save() {
		const { onSubmit } = this.props;
		const { code, textEdit } = this.state;
		try {
			!textEdit ? onSubmit(window.btoa(code)) : onSubmit(code);
		} catch (e) {
			console.log(e);
			this.setState({ error: true });
		}
	}

	updateCode(code) {
		const { onChange } = this.props;
		try {
			this.setState({ code, error: false }, () => (onChange ? onChange(code) : null));
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
		const {
			isField,
			field,
			customId,
			textEdit,
			enableSave,
			parentExpanded,
			showButtons,
			textEditBtn,
			size,
			onCancel,
			cancelText
		} = this.props;
		const { code, error } = this.state;

		// Check if code box is a redux form component
		if (isField) {
			const { label, input, meta } = field;
			return (
				<div key={customId}>
					<Col xs={12} className="u-padding-r10px">
						<Row>
							<Col xs={5} className="u-padding-r10px">
								<strong>{label}</strong>
							</Col>
							<Col xs={7} className="u-padding-r10px">
								<Codemirror value={code} onChange={this.updateCode} options={options} {...input} />
								{meta.touched && meta.error && <div className="error-message">{meta.error}</div>}
							</Col>
						</Row>
					</Col>
				</div>
			);
		}
		// Check if code box is meant to be a regular text editor
		if (textEdit) {
			let className = 'codeEditor-small ';
			const disabled = enableSave ? false : code === '';
			className += parentExpanded ? ' codeEditor-large' : ' ';

			return (
				<div className={className} key={customId}>
					<Codemirror value={code} onChange={this.updateCode} options={options} />
					<br />
					{showButtons ? (
						<Button disabled={code === ''} className="btn-lightBg btn-save" onClick={this.save}>
							{textEditBtn || 'Save'}
						</Button>
					) : null}
				</div>
			);
		}
		let className = showButtons ? 'containerButtonBar' : '';
		if (size == 'small') {
			className += ' pd-b100';
		}
		return (
			<div className={className} key={customId}>
				{error && <div>Some Error in Code, remove comma in last property if there.</div>}
				<Codemirror value={code} onChange={this.updateCode} options={options} />
				{showButtons ? (
					<Row className="butttonsRow">
						<Col xs={6}>
							<Button disabled={error} className="btn-lightBg btn-save" onClick={this.save}>
								Save
							</Button>
						</Col>
						<Col xs={6}>
							<Button className="btn-lightBg btn-cancel" onClick={onCancel}>
								{cancelText || 'Cancel'}
							</Button>
						</Col>
					</Row>
				) : (
					''
				)}
			</div>
		);
	}
}

// customCodeEditor.propTypes = {
// 	code: PropTypes.string,
// 	key: PropTypes.string,
// 	isField: PropTypes.bool,
// 	textEdit: PropTypes.bool,
// 	enableSave: PropTypes.bool,
// 	textEditBtn: PropTypes.string,
// 	size: PropTypes.string,
// 	showButtons: PropTypes.bool,
// 	parentExpanded: PropTypes.bool,
// 	onSubmit: PropTypes.func,
// 	onCancel: PropTypes.func,
// 	onChange: PropTypes.func,
// 	cancelText: PropTypes.string
// };

export default customCodeEditor;
