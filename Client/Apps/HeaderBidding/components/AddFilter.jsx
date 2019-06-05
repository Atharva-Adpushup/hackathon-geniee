/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';

class AddFilter extends React.Component {
	state = {
		showFilterBox: false,
		showTitlesView: false,
		selectedTitle: null,
		// eslint-disable-next-line react/no-unused-state
		filters: []
	};

	filterBoxRef = React.createRef();

	showFilterBox = () => {
		this.setState(
			() => ({ showFilterBox: true, showTitlesView: true }),
			() => document.addEventListener('mousedown', this.hideFilterBox)
		);
	};

	hideFilterBox = e => {
		if (this.filterBoxRef && !this.filterBoxRef.current.contains(e.target)) {
			this.setState(
				() => ({ showFilterBox: false, showTitlesView: false, selectedTitle: null }),
				() => document.removeEventListener('mousedown', this.hideFilterBox)
			);
		}
	};

	showValuesView = titleObj => this.setState({ showTitlesView: false, selectedTitle: titleObj });

	hideValuesView = () => this.setState({ showTitlesView: true, selectedTitle: null });

	renderTitlesView = titles => (
		<div className="list-view titles-view">
			<ul className="titles">
				{[...titles].map(titleObj => (
					<li key={titleObj.associatedProp} onClick={() => this.showValuesView(titleObj)}>
						{titleObj.title}
					</li>
				))}
			</ul>
		</div>
	);

	renderValuesView = values => {
		const {
			selectedTitle: { associatedProp }
		} = this.state;

		return (
			<div className="list-view values-view">
				<span onClick={this.hideValuesView}>back to filters</span>
				<ul className="values">
					{[...values].map(({ [associatedProp]: value }, index) => (
						// eslint-disable-next-line react/no-array-index-key
						<li key={associatedProp + index}>{value}</li>
					))}
				</ul>
			</div>
		);
	};

	render() {
		const { titles, values } = this.props;
		const { showFilterBox, selectedTitle, showTitlesView } = this.state;

		return (
			<div>
				<div ref={this.filterBoxRef} className="filterbox-wrap">
					<ul className="applied-filters">
						<li className="filter" onClick={this.showFilterBox}>
							+ add
						</li>
					</ul>
					{showFilterBox && (
						<div className="filterbox">
							{showTitlesView && this.renderTitlesView(titles)}
							{selectedTitle && this.renderValuesView(values)}
						</div>
					)}
				</div>
			</div>
		);
	}
}

export default AddFilter;
