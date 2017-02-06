// Mini dropdown component

import React, { PropTypes } from 'react';
import './miniDropdown.scss';
import ClickOutside from 'react-click-outside';

class MiniDropdown extends React.Component {
	constructor(props) {
		super(props);
		this.hideDropdown = this.hideDropdown.bind(this);

		this.state = {
			showDropdown: this.props.showDropdown ? this.props.showDropdown : false
        }
    }

	hideDropdown() {
		this.setState({
			showDropdown: false
		});
	}

	render() {
		const context = this.props.context;
		return (
			this.state.showDropdown ? (
				<ClickOutside onClickOutside={this.hideDropdown}>
					<div className="mini-dropdown-wrapper">
						<ul className="mini-dropdown" style={(this.props.dropDownItems && this.props.dropDownItems.length > 3) ? { overflowY: 'scroll', overflowX: 'hidden' } : {}}>
							{
								this.props.dropDownItems.map((item, key) => (
									<li onClick={this.props.selectHandler.bind(context, item)} key={key}>
										{item}
									</li>
								))
							}
						</ul>
					</div>
				</ClickOutside>
			) : null
		);
    }
}

MiniDropdown.PropTypes = {
	showDropdown: PropTypes.bool,
	context: PropTypes.object.isRequired,
	dropDownItems: PropTypes.array.isRequired,
	selectHandler: PropTypes.func.isRequired
};

export default MiniDropdown;