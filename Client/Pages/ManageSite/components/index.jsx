import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import ActionCard from '../../../Components/ActionCard/index';
import { APPS } from '../../../constants/others';
import Card from '../../../Components/Layout/Card';
import Loader from '../../../Components/Loader/index';

class ManageSite extends React.Component {
	componentDidMount() {
		// Fetch Site and Update Redux
		// Returns a promise
		// Set Statuses
		// Send to Error Page

		const { site, match, fetchAppStatuses } = this.props;
		const hasSiteData = !!(site && Object.keys(site).length);
		const statuses = hasSiteData && site.appStatuses ? site.appStatuses : false;
		const siteId = hasSiteData ? site.siteId : match.params.siteId;

		if (!statuses) fetchAppStatuses(siteId);
	}

	renderApps = () => {
		const { site } = this.props;
		const { appStatuses } = site;
		return (
			<div className="aligner aligner--row aligner--wrap aligner--hSpaceEvenly">
				{APPS.map((app, index) => {
					const isAppActive = !!appStatuses[app.key];
					const type = isAppActive ? 'success' : 'danger';
					const icon = isAppActive ? 'check-circle' : 'exclamation-triangle';

					return (
						<Card
							key={`card-${app.key}`}
							rootClassName="manage-site-card"
							type={type}
							headerClassName="card-header"
							bodyClassName="card-body"
							headerChildren={
								<div className="aligner aligner--row">
									<span className="aligner-item card-header-title">{app.name}</span>
									<FontAwesomeIcon
										icon={icon}
										className="aligner aligner-item aligner--hCenter card-header-icon"
									/>
								</div>
							}
							bodyChildren={
								<div style={{ textAlign: 'center' }}>
									<p className="u-margin-v4">
										<img
											src={app.icon}
											alt={app.name}
											style={{ maxWidth: '90%', height: '160px' }}
										/>
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
											Manage App
											<FontAwesomeIcon icon="cog" className="u-margin-l2" />
										</Button>
									</Link>
								</div>
							}
						/>
					);
				})}
			</div>
		);
	};

	renderLoader = () => (
		<div style={{ position: 'relative', width: '100%', height: '100%' }}>
			<Loader />
		</div>
	);

	render() {
		const { site } = this.props;
		const { appStatuses = false } = site;
		return (
			<ActionCard title="Manage Site">
				<div className="u-padding-v5">{appStatuses ? this.renderApps() : this.renderLoader()}</div>
			</ActionCard>
		);
	}
}

export default ManageSite;
