import React from 'react';
import { Col } from 'react-bootstrap';
import { CustomMessage } from '../shared/index';
import { NOOP } from '../../configs/commonConsts';

const CustomList = props => {
	function renderTabbedHeaders() {
		return Object.keys(props.tabbedList.list)
			.map((item, key) => {
				const toMatch = props.tabbedList.list[item].key;
				return props.tabbedList.allowed.indexOf(props.tabbedList.list[item].key) !== -1 ? (
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
			.filter(ele => ele !== false);
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
		return props.options.map(option => (
			<li
				key={option.key}
				className={`option ${props.toMatch == option.key ? 'active' : ''}`}
				onClick={props.onClick.bind(null, option.key)}
			>
				<img src={option.image} alt={option.key} />
				<div className="information">
					<p className="header">{option.name}</p>
					{option.description ? <p className="description">{option.description}</p> : null}
				</div>
			</li>
		));
	}

	function renderSimpleList() {
		if (!props.options || !props.options.length) {
			return (
				<li key={1} style={{ width: '100%' }}>
					<CustomMessage
						message={"Seems like you haven't created any pagegroup for selected platform"}
						className="error"
						header="No Pagegroups Found"
						key={1}
					/>
				</li>
			);
		}
		return props.options.map((option, key) => {
			let activeClass = '';
			const disabled = props.toDisable && props.toDisable.includes(option);
			if (props.multiSelect) {
				activeClass = props.toMatch.includes(option) ? 'active' : activeClass;
			} else {
				activeClass = props.toMatch === option ? 'active' : activeClass;
			}
			if (props.disabled) {
				activeClass = disabled ? 'disabled' : activeClass;
			}
			return (
				<li
					key={key}
					className={`simpleOption ${activeClass}`}
					onClick={disabled ? NOOP : props.onClick.bind(null, option)}
				>
					{option.replace(':', ' - ')}
				</li>
			);
		});
	}

	function renderList() {
		const toReturn = [];
		if (props.simpleList) {
			toReturn.push(
				<ul className="options" key={1}>
					{renderSimpleList()}
				</ul>
			);
		} else if (props.tabbedList) {
			toReturn.push(
				<ul className="options" key={1}>
					{renderTabbedHeaders()}
				</ul>
			);
			toReturn.push(renderTabbedOptions());
		} else {
			toReturn.push(
				<ul className="options" key={1}>
					{renderIconList()}
				</ul>
			);
		}

		if (props.disabled && props.toDisable.length === props.options.length) {
			toReturn.push(<CustomMessage message={props.message} className="error" header="Limit Reached" key={2} />);
		}

		return <div>{toReturn}</div>;
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
