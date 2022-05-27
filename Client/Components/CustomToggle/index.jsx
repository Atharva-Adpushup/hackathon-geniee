/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
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
		const [enabledOption, disabledOption] = options;
		return (
			<div className={`customToggle ${css}`}>
				<span>{label}</span>
				<ul>
					<li
						onClick={handleToggle}
						data-option={enabledOption}
						className={`${selection === true ? 'enabledPrimary' : 'disbledPrimary'}`}
					>
						{enabledOption}
					</li>
					<li
						onClick={handleToggle}
						data-option={disabledOption}
						className={`${selection === true ? 'enabledSecondary' : 'disbledSecondary'}`}
					>
						{disabledOption}
					</li>
				</ul>
			</div>
		);
	}
}

export default CustomToggle;
