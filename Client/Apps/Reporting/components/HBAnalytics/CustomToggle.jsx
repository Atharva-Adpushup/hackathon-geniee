/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import React from 'react';

class CustomToggle extends React.Component {
	constructor(props) {
		super(props);

		const { selectedItem } = this.props;
		this.state = {
			selection: selectedItem
		};
	}

	static getDerivedStateFromProps(props, state) {
		const { selectedItem } = props;
		if (selectedItem !== state.selection) {
			return {
				selection: selectedItem
			};
		}

		// Return null if the state hasn't changed
		return null;
	}

	render() {
		const { selection } = this.state;
		const { label, options, handleToggle, css } = this.props;
		return (
			<div className={`customToggle ${css}`}>
				<span>{label}</span>
				<ul>
					{options.map((option, index) => {
						return (
							<li
								key={index}
								onClick={handleToggle}
								data-option={option}
								className={`${selection === option ? 'toggleSelection' : ''}`}
							>
								{option}
							</li>
						);
					})}
				</ul>
			</div>
		);
	}
}

export default CustomToggle;
