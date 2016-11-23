import React, { PropTypes } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import Codemirror from 'react-codemirror';

class customCodeEditor extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			code: this.props.code ? atob(this.props.code) : '',
			error: false
		};

		this.updateCode = this.updateCode.bind(this);
		this.save = this.save.bind(this);
	}

	save() {
		try {
			this.props.onSubmit(btoa(this.state.code));
		} catch (e) {
			this.setState({ error: true });
		}
	}

	updateCode(code) {
		try {
			this.setState({ code, error: false });
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
			theme: 'solarized'
		};

		if(this.props.isField) {
			const { label, input, meta } = this.props.field; 
			return (
				<div>
					<Col xs={12} className="u-padding-r10px">
						<Row>
							<Col xs={3} className="u-padding-r10px"><strong>{label}</strong></Col>
							<Col xs={6} className="u-padding-r10px">
								<Codemirror value={this.state.code} onChange={this.updateCode} options={options} {...input} />
								{meta.touched && meta.error && <div className="error-message">{meta.error}</div>}
							</Col>
						</Row>
					</Col>
				</div>
			);
		}
		else {
			return (
				<div className={this.props.showButtons ? 'containerButtonBar' : ''}>
					{this.state.error && (<div>Some Error in CSS, remove comma in last property if there.</div>)}
					<Codemirror value={this.state.code} onChange={this.updateCode} options={options} />
					{
						this.props.showButtons ? (
						<Row className="butttonsRow">
							<Col xs={6}>
								<Button disabled={this.state.error} className="btn-lightBg btn-save" onClick={this.save}>Save</Button>
							</Col>
							<Col xs={6}>
								<Button className="btn-lightBg btn-cancel" onClick={this.props.onCancel}>Cancel</Button>
							</Col>
						</Row> ) : ''
					}
				</div>
			);
		}
	}
}

customCodeEditor.propTypes = {
	code: PropTypes.string,
	isField: PropTypes.bool,
	showButtons: PropTypes.bool,
	onSubmit: PropTypes.func,
	onCancel: PropTypes.func
};

export default customCodeEditor;
