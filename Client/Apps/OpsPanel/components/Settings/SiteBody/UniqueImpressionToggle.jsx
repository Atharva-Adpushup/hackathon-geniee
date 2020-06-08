/* eslint-disable no-alert */
/* eslint-disable no-else-return */
/* eslint-disable prefer-destructuring */
import React, { Component } from 'react';

import CustomToggleSwitch from '../../../../../Components/CustomToggleSwitch/index';
import CustomButton from '../../../../../Components/CustomButton/index';

class UniqueImpressionToggle extends Component {
	constructor(props) {
		super(props);
		const { user } = this.props;
		const { isShowUniqueImpressionsReporting = false } = user;

		this.state = {
			isShowUniqueImpressionsReporting,
			loading: false
		};
	}

	handleToggle = (val, e) => {
		const { target } = e;
		const key = target.getAttribute('name').split('-')[0];
		this.setState({
			[key]: !!val
		});
	};

	handleSave = () => {
		const { isShowUniqueImpressionsReporting } = this.state;
		const { updateUser } = this.props;
		this.setState({ loading: true });

		return updateUser([
			{
				key: 'isShowUniqueImpressionsReporting',
				value: isShowUniqueImpressionsReporting
			}
		]).then(() =>
			this.setState({
				loading: false
			})
		);
	};

	render() {
		const { loading, isShowUniqueImpressionsReporting } = this.state;

		return (
			<div className="isShowUniqueImpressionsReporting">
				<CustomToggleSwitch
					labelText="Show Unique Impressions Reporting"
					className="u-margin-t4 u-margin-b4 u-margin-t4 negative-toggle u-cursor-pointer"
					checked={isShowUniqueImpressionsReporting}
					onChange={this.handleToggle}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name="isShowUniqueImpressionsReporting"
					id="js-isShowUniqueImpressionsReporting"
				/>
				<CustomButton
					variant="primary"
					className="pull-right u-margin-r3"
					onClick={this.handleSave}
					showSpinner={loading}
				>
					Save
				</CustomButton>
			</div>
		);
	}
}

export default UniqueImpressionToggle;
