import React from 'react';
import MultiSelect from 'react-multi-select-component';

const PeerPerformance = ({ options, selected = [], handlePeerSelect, isLoaded }) => {
	const customValueRenderer = selectedItems =>
		selectedItems.length === 0 || !isLoaded
			? 'None Selected'
			: selectedItems.map(item => item.label).join(' , ');
	return (
		<div className="peer-performance-select">
			<h1>Selected Peers</h1>
			<MultiSelect
				options={options}
				value={selected}
				onChange={handlePeerSelect}
				labelledBy="Select"
				valueRenderer={customValueRenderer}
				hasSelectAll={false}
				isLoading={!isLoaded}
			/>
		</div>
	);
};

export default PeerPerformance;
