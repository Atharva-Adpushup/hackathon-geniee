import React from 'react';
import { Row, Col } from 'react-bootstrap';

const CustomList = props => {
	return (
		<div>
			<Col md={props.leftSize}>
				<h3>{props.heading}</h3>
				<h4>{props.subHeading}</h4>
			</Col>
			<Col md={props.rightSize}>
				<ul className="options">
					{props.options.map((option, key) => {
						return props.simpleList ? (
							<li
								key={key}
								className={`simpleOption ${props.toMatch == option ? 'active' : ''}`}
								onClick={props.onClick.bind(null, option)}
							>
								{option}
							</li>
						) : (
							<li
								key={option.key}
								className={`option ${props.toMatch == option.key ? 'active' : ''}`}
								onClick={props.onClick.bind(null, option.key)}
							>
								<p className="header">{option.name}</p>
								<img src={option.image} />
							</li>
						);
					})}
				</ul>
			</Col>
			<div style={{ clear: 'both' }}>&nbsp;</div>
		</div>
	);
};

export default CustomList;
