/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { Col } from 'react-bootstrap';
import CustomMessage from '../../../../Components/CustomMessage/index';
import { NOOP } from '../../configs/commonConsts';

const CustomList = props => {
	const {
		tabbedList,
		selectPlatform,
		platform,
		onClick,
		toMatch,
		toDisable,
		multiSelect,
		simpleList,
		disabled,
		options,
		message,
		leftSize,
		rightSize,
		subHeading,
		listHeaders,
		heading
	} = props;
	function renderTabbedHeaders() {
		return Object.keys(tabbedList.list)
			.map((item, key) => {
				const match = tabbedList.list[item].key;
				return tabbedList.allowed.indexOf(tabbedList.list[item].key) !== -1 ? (
					<li
						key={`${key}-${match}`}
						className={`simpleOption ${platform === match ? 'active' : ''}`}
						onClick={() => selectPlatform(match)}
					>
						{tabbedList.list[item].header}
					</li>
				) : (
					false
				);
			})
			.filter(ele => ele !== false);
	}

	function renderTabbedOptions() {
		return platform && tabbedList.list[platform].options ? (
			<ul className="options">
				{tabbedList.list[platform].options.map((option, key) => (
					<li
						key={`${key}-${option}`}
						className={`simpleOption ${toMatch === option ? 'active' : ''}`}
						onClick={() => onClick(option)}
					>
						{option}
					</li>
				))}
			</ul>
		) : null;
	}

	function renderIconList() {
		return options.map(option => (
			<li
				key={option.key}
				className={`option ${toMatch === option.key ? 'active' : ''}`}
				onClick={onClick.bind(null, option.key)}
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
		if (!options || !options.length) {
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
		return options.map((option, key) => {
			let activeClass = '';
			const isDisabled = toDisable && toDisable.includes(option);
			if (multiSelect) {
				activeClass = toMatch.includes(option) ? 'active' : activeClass;
			} else {
				activeClass = toMatch === option ? 'active' : activeClass;
			}
			if (disabled) {
				activeClass = isDisabled ? 'disabled' : activeClass;
			}
			return (
				<li
					key={key}
					className={`simpleOption ${activeClass}`}
					onClick={isDisabled ? NOOP : () => onClick(option)}
				>
					{option.replace(':', ' - ')}
				</li>
			);
		});
	}

	function renderList() {
		const toReturn = [];
		if (simpleList) {
			toReturn.push(
				<ul className="options" key={1}>
					{renderSimpleList()}
				</ul>
			);
		} else if (tabbedList) {
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

		if (disabled && toDisable.length === options.length) {
			toReturn.push(
				<CustomMessage message={message} className="error" header="Limit Reached" key={2} />
			);
		}

		return <div>{toReturn}</div>;
	}

	return (
		<div>
			<Col md={leftSize}>
				<h3>{heading}</h3>
				<h4>{subHeading}</h4>
			</Col>
			<Col md={rightSize}>
				{listHeaders ? (
					<div className="list-heading">
						<h3>{listHeaders.heading}</h3>
						{listHeaders.subHeading ? <h4>{listHeaders.subHeading}</h4> : null}
					</div>
				) : null}
				{renderList()}
			</Col>
			<div style={{ clear: 'both' }}>&nbsp;</div>
		</div>
	);
};

export default CustomList;
