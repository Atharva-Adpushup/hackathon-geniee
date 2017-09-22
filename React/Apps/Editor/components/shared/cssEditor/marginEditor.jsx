import React, { PropTypes } from 'react';
import { Field, reduxForm } from 'redux-form';
import { Row, Col, Button } from 'react-bootstrap';

class cssMarginEditor extends React.Component {
	setAlignment(alignment) {
		switch (alignment) {
			case 'left':
				this.props.initialize({
					'margin-left': '0px',
					'margin-right': 'auto',
					'margin-top': '0px',
					'margin-bottom': '0px'
				});
				break;
			case 'right':
				this.props.initialize({
					'margin-left': 'auto',
					'margin-right': '0px',
					'margin-top': '0px',
					'margin-bottom': '0px'
				});
				break;
			case 'center':
				this.props.initialize({
					'margin-left': 'auto',
					'margin-right': 'auto',
					'margin-top': '0px',
					'margin-bottom': '0px'
				});
				break;
			default:
				break;
		}
	}

	render() {
		const props = this.props;
		return (
			<form onSubmit={props.handleSubmit}>
				<div className="containerButtonBar">
					<div>
						<div className="manualSettings">
							<Row className="cssPropertiesWrap">
								<Col xs={12} className="pdLR-0 mB-5">
									Margin:{' '}
								</Col>
								<Col xs={12} className="pd-0">
									<Row className="cssPropertiesWrapInner">
										<Col xs={3} className="pd-2">
											<Field name="margin-left" component="input" type="text" />
											<span>Left</span>
										</Col>
										<Col xs={3} className="pd-2">
											<Field name="margin-right" component="input" type="text" />
											<span>Right</span>
										</Col>
										<Col xs={3} className="pd-2">
											<Field name="margin-top" component="input" type="text" />
											<span>Top</span>
										</Col>
										<Col xs={3} className="pd-2">
											<Field name="margin-bottom" component="input" type="text" />
											<span>Bottom</span>
										</Col>
									</Row>
								</Col>
							</Row>
						</div>

						<Row className="cssPropertiesAlign">
							<Col xs={4} className="pd-0 btnCol">
								<Button
									className="btn-align btn-align-left"
									onClick={this.setAlignment.bind(this, 'left')}
								>
									Left
								</Button>
							</Col>
							<Col xs={4} className="pd-0 btnCol">
								<Button
									className="btn-align btn-align-center"
									onClick={this.setAlignment.bind(this, 'center')}
								>
									Center
								</Button>
							</Col>
							<Col xs={4} className="pd-0 btnCol">
								<Button
									className="btn-align btn-align-right"
									onClick={this.setAlignment.bind(this, 'right')}
								>
									Right
								</Button>
							</Col>
						</Row>
						<Row>
							<Col xs={4} className="pd-0 btnCol" />
							<Col xs={4} className="pd-0 btnCol">
								<Button className="btn-lightBg btn-settings" onClick={props.onAdvanced}>
									Advanced
								</Button>
							</Col>
							<Col xs={4} className="pd-0 btnCol" />
						</Row>
					</div>

					<Row className="butttonsRow">
						<Col xs={6}>
							<Button type="submit" className="btn-lightBg btn-save ">
								Save Css
							</Button>
						</Col>
						<Col xs={6}>
							<Button className="btn-lightBg btn-cancel " onClick={props.onCancel}>
								Cancel
							</Button>
						</Col>
					</Row>
				</div>
			</form>
		);
	}
}

cssMarginEditor.propTypes = {
	handleSubmit: PropTypes.func.isRequired,
	onCancel: PropTypes.func.isRequired,
	onAdvanced: PropTypes.func.isRequired
};

export default reduxForm({
	form: 'cssMarginEditor' // a unique name for this form
})(cssMarginEditor);
