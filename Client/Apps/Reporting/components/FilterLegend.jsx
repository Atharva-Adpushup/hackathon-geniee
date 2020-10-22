import React, { useState } from 'react';
import { Badge, Table } from '@/Client/helpers/react-bootstrap-imports';

const FilterLegend = ({ selectedFilters = {}, filtersList = [] }) => {
	const [shouldShowMore, setShouldShowMore] = useState({});

	const toggleShowMore = key => {
		setShouldShowMore({
			...shouldShowMore,
			[key]: !shouldShowMore[key]
		});
	};

	const showFiltersLegend = (filterValue, filterMeta) => {
		if (!filterValue || !filterValue.length) return null;
		const shouldShowAll = !!shouldShowMore[filterMeta.value];

		const allItems = Object.values(filterValue);

		const filterItemsToShow = shouldShowAll ? allItems : allItems.slice(0, 5);

		const filterItemsList = filterItemsToShow.map(val => (
			<Badge className="filter-pill" key={val.id}>
				{val.value}
			</Badge>
		));

		const hasMore = !shouldShowAll && allItems.length > 5;
		return (
			<tr key={filterMeta.position} className="selected-filter">
				<td className="filter-badge-key">
					<span>{filterMeta.display_name} : </span>
				</td>
				<td>
					<span>{filterItemsList}</span>
					{hasMore && (
						<span className="badge-toggle" onClick={() => toggleShowMore(filterMeta.value)}>
							{'more >>>'}
						</span>
					)}
					{!hasMore && shouldShowAll && (
						<span className="badge-toggle" onClick={() => toggleShowMore(filterMeta.value)}>
							{'<<< less'}
						</span>
					)}
				</td>
			</tr>
		);
	};

	const isFiltersEmpty =
		Object.keys(selectedFilters).length === 0 ||
		Object.keys(selectedFilters).reduce(
			(result, filterKey) => [...result, ...selectedFilters[filterKey]],
			[]
		).length === 0;

	return (
		<div className="filter-legend">
			{!isFiltersEmpty ? <h4 className="filter-list-title">Selected Filters</h4> : null}
			<div>
				<Table className="filter-list-table" borderless>
					<tbody>
						{filtersList.map(filter => showFiltersLegend(selectedFilters[filter.value], filter))}
					</tbody>
				</Table>
			</div>
		</div>
	);
};

export default FilterLegend;
