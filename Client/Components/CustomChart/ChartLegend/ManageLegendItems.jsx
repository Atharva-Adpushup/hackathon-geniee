import React from 'react';
import { Checkbox } from 'react-bootstrap';
import CustomButton from '../../CustomButton';
import CustomIcon from '../../CustomIcon';

class ManageLegendItems extends React.Component {
	state = {
		showManageLegendsBox: false,
		selectedLegendKeys: []
	};

	manageLegendsBoxRef = React.createRef();

	componentDidMount() {}

	showManageLegendsBox = () => {
		const { activeLegends } = this.props;
		const { selectedLegendKeys } = this.state;

		const computedState = { showManageLegendsBox: true };

		if (!selectedLegendKeys.length) {
			computedState.selectedLegendKeys = activeLegends.map(({ name, value, valueType }) => ({
				name,
				value,
				valueType
			}));
		}

		this.setState(
			() => computedState,
			() => document.addEventListener('mousedown', this.hideManageLegendsBox)
		);
	};

	hideManageLegendsBox = (e, forced = false) => {
		if (
			forced ||
			(e && this.manageLegendsBoxRef && !this.manageLegendsBoxRef.current.contains(e.target))
		) {
			this.setState(
				() => ({ showManageLegendsBox: false }),
				() => {
					document.removeEventListener('mousedown', this.hideManageLegendsBox);
				}
			);
		}
	};

	hideManageLegendsBoxManually = () => {
		this.hideManageLegendsBox(null, true);
	};

	handleLegends = () => {
		const { selectedLegendKeys } = this.state;
		const { updateMetrics } = this.props;

		updateMetrics(selectedLegendKeys);
		this.hideManageLegendsBoxManually();
	};

	handleLegendSelect = ({
		target: {
			checked,
			dataset: { legend }
		}
	}) => {
		const { availableLegends } = this.props;
		const { selectedLegendKeys } = this.state;

		const selectedLegendKeysCopy = [...selectedLegendKeys];
		const legendObj = availableLegends[legend];
		const index = selectedLegendKeys.findIndex(selectedLegend => selectedLegend.value === legend);
		const alreadySelected = index !== -1;

		let computedState;

		if (checked && !alreadySelected) {
			selectedLegendKeysCopy.push({
				name: legendObj.display_name,
				value: legend,
				valueType: legendObj.valueType
			});
			computedState = { selectedLegendKeys: selectedLegendKeysCopy };
		}

		if (!checked && alreadySelected) {
			selectedLegendKeysCopy.splice(index, 1);
			computedState = { selectedLegendKeys: selectedLegendKeysCopy };
		}

		this.setState(computedState);
	};

	renderLegends = () => {
		const { availableLegends } = this.props;
		const { selectedLegendKeys } = this.state;

		const availableLegendKeys = Object.keys(availableLegends);

		const availableLegendsJSX = availableLegendKeys.map(availableLegendKey => {
			const { display_name: name } = availableLegends[availableLegendKey];
			return (
				<li key={availableLegendKey}>
					<Checkbox
						checked={
							selectedLegendKeys.findIndex(
								selectedLegend => selectedLegend.value === availableLegendKey
							) !== -1
						}
						data-legend={availableLegendKey}
						onChange={this.handleLegendSelect}
					>
						{name}
					</Checkbox>
				</li>
			);
		});

		return <ul>{availableLegendsJSX}</ul>;
	};

	render() {
		const { showManageLegendsBox } = this.state;

		return (
			<div ref={this.manageLegendsBoxRef} className="legend-item manage-legends-wrap">
				<CustomIcon
					classNames="action-icon u-cursor-pointer"
					icon="edit"
					onClick={this.showManageLegendsBox}
				/>

				{showManageLegendsBox && (
					<div className="manage-legends-box">
						{this.renderLegends()}
						<footer>
							<CustomButton onClick={this.handleLegends} className="u-margin-r4">
								Add
							</CustomButton>
							<CustomButton variant="secondary" onClick={this.hideManageLegendsBoxManually}>
								Cancel
							</CustomButton>
						</footer>
					</div>
				)}
			</div>
		);
	}
}

export default ManageLegendItems;
