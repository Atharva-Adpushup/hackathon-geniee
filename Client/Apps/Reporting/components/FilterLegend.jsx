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

	const showFiltersLegend = (title, filterValues, key) => {
		if (!filterValues || !filterValues.length) return null;
		const shouldShowAll = !!shouldShowMore[key];

		const filterItemsToShow = shouldShowAll ? filterValues : filterValues.slice(0, 5);

		const filterItemsList = filterItemsToShow.map(val => (
			<Badge className="filter-pill" key={val.id}>
				{val.value}
			</Badge>
		));

		const hasMore = !shouldShowAll && filterValues.length > 5;
		return (
			<tr key={key} className="selected-filter">
				<td className="filter-badge-key">{title} :</td>
				<td>
					<span>{filterItemsList}</span>
					{hasMore && (
						<span className="badge-toggle" onClick={() => toggleShowMore(key)}>
							{'more >>>'}
						</span>
					)}
					{!hasMore && shouldShowAll && (
						<span className="badge-toggle" onClick={() => toggleShowMore(key)}>
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

	const filterTitleMapping = Object.values(filtersList).reduce(
		(result, filter) => ({ ...result, [filter.value]: filter.name }),
		{}
	);

	return (
		<div className="filter-legend">
			{!isFiltersEmpty ? <h4 className="filter-list-title">Selected Filters</h4> : null}
			<div>
				<Table className="filter-list-table" borderless>
					<tbody>
						{Object.keys(selectedFilters).map(key => {
							const filterTitle = filterTitleMapping[key];
							const selectedFilterValues = selectedFilters[key];
							return showFiltersLegend(filterTitle, selectedFilterValues, key);
						})}
					</tbody>
				</Table>
			</div>
		</div>
	);
};

export default FilterLegend;
