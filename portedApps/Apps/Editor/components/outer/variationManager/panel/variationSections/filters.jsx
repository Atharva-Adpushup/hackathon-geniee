import React from 'react';
import { Row, Col, Button } from 'react-bootstrap';

const Filters = props => {
	return (
		<Row className="mb-20">
			<Col xs={3}>
				{/* <input
					placeholder="Enter section name"
					ref="sectionName"
					type="text"
					className="inputMinimal"
					style={{ padding: '14px 10px' }}
				/> */}
			</Col>
			<Col xs={9}>
				<Col xs={9}>
					<Col xs={6}>
						<label for="startDate">Start Date : </label>
						<input
							type="date"
							name="startDate"
							className="pdAll-5 inputMinimal"
							value={props.startDate}
							onChange={props.datesUpdated}
						/>
					</Col>
					<Col xs={6}>
						<label for="endDate">End Date : </label>
						<input
							type="date"
							name="endDate"
							className="pdAll-5 inputMinimal"
							value={props.endDate}
							onChange={props.datesUpdated}
						/>
					</Col>
				</Col>
				<Col xs={3} className="mT-15">
					<Button className="btn-lightBg btn-block" onClick={props.generateReport} type="submit">
						<i className="fa fa-bar-chart" />Generate
					</Button>
				</Col>
			</Col>
		</Row>
	);
};

export default Filters;
