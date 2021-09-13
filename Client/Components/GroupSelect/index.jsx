import React from 'react';
import {
	Glyphicon,
	DropdownButton,
	Label,
	InputGroup,
	OverlayTrigger,
	Tooltip,
	MenuItem
} from '@/Client/helpers/react-bootstrap-imports';

const GroupSelect = ({ title, itemsList = [], onItemSelect, selectedItems = [], onRemoveItem }) => {
	const handleItemSelected = item => {
		if (onItemSelect) onItemSelect(item);
	};

	const getSelectedLabels = (items = []) => {
		if (!items.length) return 'Add+';

		const onRemoveClick = item => e => {
			e.stopPropagation();
			onRemoveItem(item);
		};

		return items.map(item => (
			<Label bsStyle="info" className="u-margin-r2" style={{ height: '19px' }} key={item.key}>
				{item.name}
				{onRemoveItem && !item.isMandatory && (
					<Glyphicon glyph="remove" className="u-margin-l1" onClick={onRemoveClick(item)} />
				)}
			</Label>
		));
	};

	const selectBoxLabels = getSelectedLabels(selectedItems);
	const selectBoxTitle = (
		<div className="aligner aligner--hStart  aligner--wrap">{selectBoxLabels}</div>
	);

	return (
		<InputGroup className="u-margin-t2">
			<InputGroup.Addon>{title}</InputGroup.Addon>
			<div className="custom-select-box-wrapper">
				<DropdownButton
					id="group-select-dropdown"
					className="custom-select-box u-padding-l2"
					aria-hidden="true"
					title={selectBoxTitle}
				>
					{itemsList.map(item => {
						if (item.isDisabled && item.disabledMessage) {
							const disabledTooltipMessage = (
								<Tooltip id="disabled-tooltip">{item.disabledMessage}</Tooltip>
							);
							return (
								<OverlayTrigger overlay={disabledTooltipMessage} key={`overlay-${item.key}`}>
									<MenuItem
										key={item.value}
										data-value={item.value}
										data-name={item.name}
										disabled={item.isDisabled}
									>
										{item.name}
									</MenuItem>
								</OverlayTrigger>
							);
						}
						return (
							<MenuItem
								key={item.value}
								data-value={item.value}
								data-name={item.name}
								onClick={() => handleItemSelected(item)}
							>
								{item.name}
							</MenuItem>
						);
					})}
				</DropdownButton>
			</div>
		</InputGroup>
	);
};

export default GroupSelect;
