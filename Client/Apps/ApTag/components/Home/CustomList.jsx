/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import { Col, Form, FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';

const CustomList = props => {
	const {
		tabbedList,
		leftSize,
		rightSize,
		heading,
		subHeading,
		listHeaders,
		platform,
		selectPlatform,
		toMatch,
		options,
		simpleList,
		onClick,
		onCustomFieldValueChange
	} = props;
	function renderTabbedHeaders() {
		return Object.keys(tabbedList.list)
			.map((item, key) => {
				const matchIt = tabbedList.list[item].key;
				return tabbedList.allowed.indexOf(tabbedList.list[item].key) !== -1 ? (
					<li
						key={`${key}-${matchIt}`}
						className={`simpleOption ${platform === matchIt ? 'active' : ''}`}
						onClick={selectPlatform.bind(null, matchIt)}
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
		return platform && tabbedList.list[platform].options ? (
			<ul className="options">
				{tabbedList.list[platform].options.map((option, key) => (
					<li
						key={`${key}-${option}`}
						className={`simpleOption ${toMatch === option ? 'active' : ''}`}
						onClick={onClick.bind(null, option)}
					>
						{option}
					</li>
				))}
			</ul>
		) : null;
	}

	function renderTabbedCustomFields() {
		return platform && tabbedList.list[platform].customFields ? (
			<Form horizontal className="custom-fields">
				{tabbedList.list[platform].customFields.map(customField => {
					const {
						displayName,
						key,
						inputType,
						placeholder,
						attributes = {},
						value,
						isValid,
						validationMessage,
						isRequired
					} = customField;

					return (
						<FormGroup controlId="formBasicText" key={key}>
							<Col componentClass={ControlLabel} sm={3}>
								{`${displayName}${isRequired ? '*' : ''}`}
							</Col>
							<Col sm={9}>
								<FormControl
									type={inputType}
									name={key}
									placeholder={placeholder}
									value={value}
									required={!!isRequired}
									onChange={onCustomFieldValueChange}
									{...attributes}
								/>

								{typeof isValid === 'boolean' && !isValid && (
									<HelpBlock className="u-text-error">{validationMessage}</HelpBlock>
								)}
							</Col>
						</FormGroup>
					);
				})}
			</Form>
		) : null;
	}

	function renderIconList() {
		return options.map(option => (
			<li
				key={option.key}
				className={`option ${toMatch === option.key ? 'active' : ''}`}
				onClick={onClick.bind(null, option.key)}
			>
				<img src={option.image} alt={option.name} />
				<div className="information">
					<p className="header">{option.name}</p>
					{option.description ? <p className="description">{option.description}</p> : null}
				</div>
			</li>
		));
	}

	function renderSimpleList() {
		return options.map((option, key) => (
			<li
				key={key}
				className={`simpleOption ${toMatch === option ? 'active' : ''}`}
				onClick={onClick.bind(null, option)}
			>
				{option}
			</li>
		));
	}

	function renderList() {
		if (simpleList) {
			return <ul className="options">{renderSimpleList()}</ul>;
		}
		if (tabbedList) {
			return (
				<div>
					<ul className="options">{renderTabbedHeaders()}</ul>
					{renderTabbedOptions()}
					{renderTabbedCustomFields()}
				</div>
			);
		}
		return <ul className="options">{renderIconList()}</ul>;
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
