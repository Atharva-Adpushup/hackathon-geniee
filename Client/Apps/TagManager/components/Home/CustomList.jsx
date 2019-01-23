import React from 'react';
import { Col } from 'react-bootstrap';

const CustomList = props => {
	function renderTabbedHeaders() {
		return Object.keys(props.tabbedList.list)
			.map((item, key) => {
				const toMatch = props.tabbedList.list[item].key;
				return props.tabbedList.allowed.indexOf(props.tabbedList.list[item].key) != -1 ? (
					<li
						key={`${key}-${toMatch}`}
						className={`simpleOption ${props.platform == toMatch ? 'active' : ''}`}
						onClick={props.selectPlatform.bind(null, toMatch)}
					>
						{props.tabbedList.list[item].header}
					</li>
				) : (
					false
				);
			})
			.filter(ele => ele != false);
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
			return <ul className="options">{renderSimpleList()}</ul>;
		} else if (props.tabbedList) {
			return (
				<div>
					<ul className="options">{renderTabbedHeaders()}</ul>
					{renderTabbedOptions()}
				</div>
			);
		} else {
			return <ul className="options">{renderIconList()}</ul>;
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
				{renderList()}
			</Col>
			<div style={{ clear: 'both' }}>&nbsp;</div>
		</div>
	);
};

export default CustomList;
