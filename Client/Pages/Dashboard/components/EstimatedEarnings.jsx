import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import moment from 'moment';
import reportService from '../../../services/reportService';
import Loader from '../../../Components/Loader/index';

class EstimatedEarnings extends React.Component {
	state = {
		isLoading: true
	};

	componentDidMount() {
		const params = {
			fromDate: moment()
				.subtract(7, 'days')
				.startOf('day')
				.format('YYYY-MM-DD'),
			toDate: moment()
				.startOf('day')
				.subtract(1, 'day')
				.format('YYYY-MM-DD')
		};
		const { path, reportType, siteId, site } = this.props;
		if (reportType === 'site') params.siteid = siteId;
		else {
			const siteIds = Object.keys(site);
			params.siteid = siteIds.toString();
		}
		this.setState({ isLoading: true });
		reportService.getWidgetData({ path, params }).then(response => {
			if (
				response.status == 200 &&
				response.data &&
				response.data.result &&
				response.data.result.length > 0
			) {
				this.setState({ ...response.data.result[0], isLoading: false });
			}
		});
	}

	renderLoader = () => (
		<div style={{ position: 'relative', width: '100%', height: '30%' }}>
			<Loader />
		</div>
	);

	render() {
		const {
			yesterday,
			sameDayLastWeek,
			lastSevenDays,
			previousSevenDays,
			lastThirtyDays,
			previousThirtyDays,
			isLoading
		} = this.state;
		const dayProgress =
			yesterday > 0
				? Math.round(((yesterday - sameDayLastWeek) / yesterday) * 10000) / 100
				: sameDayLastWeek > 0
				? -100
				: 0;
		const weekProgress =
			lastSevenDays > 0
				? Math.round(((lastSevenDays - previousSevenDays) / lastSevenDays) * 10000) / 100
				: previousSevenDays > 0
				? -100
				: 0;
		const monthProgress =
			lastThirtyDays > 0
				? Math.round(((lastThirtyDays - previousThirtyDays) / lastThirtyDays) * 10000) / 100
				: previousThirtyDays > 0
				? -100
				: 0;
		return isLoading ? (
			this.renderLoader()
		) : (
			<div className="aligner u-margin-t4 u-margin-b4">
				<div className="aligner-item text-center">
					<div className="font-small">
						<span>Yestarday</span>
						<span> VS </span>
						<span>Same Day Last Week</span>
					</div>
					<div className="estimatedEarning">
						<span>${Math.round(yesterday * 100) / 100}</span>
						<span> / </span>
						<span>${Math.round(sameDayLastWeek * 100) / 100}</span>
					</div>
					<div>
						(<span>{dayProgress}% </span>
						<FontAwesomeIcon icon={dayProgress > 0 ? 'arrow-up' : 'arrow-down'} /> )
					</div>
				</div>
				<div className="aligner-item text-center">
					<div className="font-small">
						<span>Last 7 days</span>
						<span> VS </span>
						<span>Previous 7 days</span>
					</div>
					<div className="estimatedEarning">
						<span>${Math.round(lastSevenDays * 100) / 100}</span>
						<span> / </span>
						<span>${Math.round(previousSevenDays * 100) / 100}</span>
					</div>
					<div>
						(<span>{weekProgress}% </span>
						<FontAwesomeIcon icon={weekProgress > 0 ? 'arrow-up' : 'arrow-down'} /> )
					</div>
				</div>
				<div className="aligner-item text-center">
					<div className="font-small">
						<span>Last 30 days</span>
						<span> VS </span>
						<span>Previous 30 days</span>
					</div>

					<div className="estimatedEarning">
						<span>${Math.round(lastThirtyDays * 100) / 100}</span>
						<span> / </span>
						<span>${Math.round(previousThirtyDays * 100) / 100}</span>
					</div>
					<div>
						(<span>{monthProgress}% </span>
						<FontAwesomeIcon icon={monthProgress > 0 ? 'arrow-up' : 'arrow-down'} /> )
					</div>
				</div>
			</div>
		);
	}
}

export default EstimatedEarnings;
