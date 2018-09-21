import React from 'react';
import { Row, Col } from 'react-bootstrap';

const CustomList = props => {
	function renderTabbedHeaders() {
		return Object.keys(props.tabbedList.list).map((item, key) => (
			<li
				key={`${key}-${props.tabbedList.list[item].key}`}
				className={`simpleOption ${props.platform == props.tabbedList.list[item].key ? 'active' : ''}`}
				onClick={props.selectPlatform.bind(null, props.tabbedList.list[item].key)}
			>
				{props.tabbedList.list[item].header}
			</li>
		));
	}

	function renderTabbedOptions() {
		return props.platform && props.tabbedList.list[props.platform].options ? (
			<ul className="options">
				{props.tabbedList.list[props.platform].options.map((option, key) => (
					<li
						key={`${key}-${option}`}
						className={`simpleOption ${props.toMatch == option ? 'active' : ''}`}
						onClick={props.onClick.bind(null, option)}
					>
						{option}
					</li>
				))}
			</ul>
		) : null;
	}

	function renderTabbedList() {
		return renderTabbedHeaders();
	}

	function renderIconList() {
		return props.options.map((option, key) => (
			<li
				key={option.key}
				className={`option ${props.toMatch == option.key ? 'active' : ''}`}
				onClick={props.onClick.bind(null, option.key)}
			>
				<img src={option.image} />
				<div className="information">
					<p className="header">{option.name}</p>
					{option.description ? <p className="description">{option.description}</p> : null}
				</div>
			</li>
		));
	}

	function renderSimpleList() {
		return props.options.map((option, key) => (
			<li
				key={key}
				className={`simpleOption ${props.toMatch == option ? 'active' : ''}`}
				onClick={props.onClick.bind(null, option)}
			>
				{option}
			</li>
		));
	}

	function renderList() {
		if (props.simpleList) {
			return renderSimpleList();
		} else if (props.tabbedList) {
			return renderTabbedList();
		} else {
			return renderIconList();
		}
	}

	return (
		<div>
			<Col md={props.leftSize}>
				<h3>{props.heading}</h3>
				<h4>{props.subHeading}</h4>
			</Col>
			<Col md={props.rightSize}>
				{props.listHeaders ? (
					<div className="list-heading">
						<h3>{props.listHeaders.heading}</h3>
						{props.listHeaders.subHeading ? <h4>{props.listHeaders.subHeading}</h4> : null}
					</div>
				) : null}
				<ul className="options">{renderList()}</ul>
				{props.tabbedList ? renderTabbedOptions() : null}
			</Col>
			<div style={{ clear: 'both' }}>&nbsp;</div>
		</div>
	);
};

export default CustomList;
