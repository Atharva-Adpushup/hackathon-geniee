import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import ActionCard from '../../../Components/ActionCard/index';
import { APPS } from '../../../constants/others';
import Card from '../../../Components/Layout/Card';

class ManageSite extends React.Component {
	constructor(props) {
		super(props);
		const { site, match } = this.props;
		const hasSiteData = !!(site && Object.keys(site).length);
		const statuses = hasSiteData && site.appStatuses ? site.appStatuses : false;
		const siteId = hasSiteData ? site.siteId : match.params.siteId;

		this.state = {
			statuses,
			siteId
		};
	}

	componentDidMount() {
		// Fetch Site and Update Redux
		// Returns a promise
		// Set Statuses
		// Send to Error Page

		const { statuses, siteId } = this.state;
		const { fetchAppStatuses } = this.props;
		if (!statuses) fetchAppStatuses(siteId);
	}

	renderApps = () => (
		<div className="aligner aligner--row aligner--wrap aligner--hSpaceEvenly">
			{APPS.map((app, index) => (
				<Card
					key={`card-${index}`}
					rootClassName="manage-site-card"
					type="danger"
					headerClassName="card-header"
					bodyClassName="card-body"
					headerChildren={
						<div className="aligner aligner--row">
							<span className="aligner-item card-header-title">{app.name}</span>
							<FontAwesomeIcon
								icon="exclamation-triangle"
								className="aligner aligner-item aligner--hCenter card-header-icon"
							/>
						</div>
					}
					bodyChildren={
						<div style={{ textAlign: 'center' }}>
							<p className="u-margin-v4">
								<img src={app.icon} alt={app.name} style={{ maxWidth: '90%', height: '160px' }} />
							</p>
							<p className="u-margin-b3">{app.description}</p>
						</div>
					}
					footerClassName="card-footer u-padding-0"
					footerChildren={
						<div className="aligner aligner--row">
							<Link to="/" className="u-link-reset aligner aligner-item">
								<Button className="aligner-item aligner aligner--hStart aligner--vCenter">
									View Reports
									<FontAwesomeIcon icon="chart-area" className="u-margin-l2" />
								</Button>
							</Link>
							<Link to="/" className="u-link-reset aligner aligner-item">
								<Button className="aligner-item aligner aligner--hEnd aligner--vCenter">
									Manage Site
									<FontAwesomeIcon icon="cog" className="u-margin-l2" />
								</Button>
							</Link>
						</div>
					}
				/>
			))}
		</div>
	);

	render() {
		return (
			<ActionCard title="Manage Site">
				<div className="u-padding-v5">{this.renderApps()}</div>
			</ActionCard>
		);
	}
}

export default ManageSite;
