import React from 'react';
import CodeBox from 'shared/codeBox';
import { Row, Col, Button } from 'react-bootstrap';

const Form = props => {
	return (
		<div className="mT-10">
			<Row>
				<Col xs={5}>
					<strong>Adunit Id</strong>
				</Col>
				<Col xs={7}>
					<input
						type="text"
						placeholder="Enter Adunit Id"
						className="inputBasic mB-10"
						value={props.adunitId}
						onChange={props.inputChange}
					/>
				</Col>
			</Row>
			<div>
				<CodeBox
					showButtons={props.showButtons || true}
					onSubmit={props.onSubmit}
					onCancel={props.onCancel}
					onChange={props.onCodeBoxChange}
					code={props.adCode}
					size={props.codeBoxSize}
				/>
			</div>
		</div>
	);
};

export default Form;
