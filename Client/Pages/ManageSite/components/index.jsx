import React from 'react';
import { Button, Row } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import ActionCard from '../../../Components/ActionCard/index';
import OverlayTooltip from '../../../Components/OverlayTooltip/index';
import { APPS, STATUSES, LINK_TYPE, TYPE, DEFAULT_ITEM } from '../../../constants/others';
import Card from '../../../Components/Layout/Card';
import Loader from '../../../Components/Loader/index';
import CustomButton from '../../../Components/CustomButton/index';
import CustomMessage from '../../../Components/CustomMessage/index';

class ManageSite extends React.Component {
	componentDidMount() {
		const { site, match, fetchAppStatuses } = this.props;
		const hasSiteData = !!(site && Object.keys(site).length);
		const statuses = hasSiteData && site.appStatuses ? site.appStatuses : false;
		const siteId = hasSiteData ? site.siteId : match.params.siteId;

		if (!statuses) fetchAppStatuses(siteId);
	}

	renderButton = (text, icon) => (
		<Button className="aligner-item aligner aligner--hEnd aligner--vCenter">
			{text}
			{icon ? <FontAwesomeIcon icon={icon} className="u-margin-l2" /> : null}
		</Button>
	);

	renderItem = (data, active, key, siteId, goFull = false) => {
		const { type, text, link, destination = '', icon } = data;
		const to = destination.replace('__SITE_ID__', siteId);

		if (type === TYPE.LINK) {
			if (link === LINK_TYPE.INAPP) {
				return (
					<Link
						to={to}
						className={`u-link-reset aligner aligner-item ${goFull ? 'go-full' : ''}`}
						key={key}
					>
						{this.renderButton(text, icon)}
					</Link>
				);
			}
			if (link === LINK_TYPE.OUTWARD) {
				return (
					<a
						href={to}
						className="u-link-reset aligner aligner-item"
						rel="noopener noreferrer"
						target="_blank"
						key={key}
					>
						{this.renderButton(text, icon)}
					</a>
				);
			}
		} else if (type === TYPE.TEXT) {
			return (
				<div
					className={`aligner aligner-item u-text-bold status-text ${
						active ? 'u-text-success' : 'u-text-error'
					}`}
					key={key}
				>
					{text.replace('__STATUS__', active ? 'Active' : 'Inactive')}
				</div>
			);
		}
	};

	renderFooter = (active, left, right, full, key, siteId) => {
		const response = [];
		const goFull = !!right;
		if (right) {
			const leftRender = active ? left : DEFAULT_ITEM;
			response.push(this.renderItem(leftRender, active, ++key, siteId));
			response.push(this.renderItem(right, active, ++key, siteId));
		} else if (full) {
			response.push(this.renderItem(full, active, ++key, siteId, goFull));
		}
		return response;
	};

	renderApps = () => {
		const { site } = this.props;
		const { appStatuses } = site;
		return (
			<div className="aligner aligner--row aligner--wrap aligner--hSpaceEvenly">
				{APPS.map(app => {
					const { name, image, description, key, left, right, full = false } = app;
					const isAppActive = !!appStatuses[key];
					const statuses = isAppActive ? STATUSES.ACTIVE : STATUSES.INACTIVE;
					const { type, icon, tooltip } = statuses;

					return (
						<Card
							key={`card-${key}`}
							rootClassName="manage-site-card"
							type={type}
							headerClassName="card-header"
							bodyClassName="card-body"
							headerChildren={
								<div className="aligner aligner--row">
									<div className="aligner-item card-header-title" style={{ position: 'relative' }}>
										<OverlayTooltip
											id={`tooltip-app-info-${name}-${key}`}
											placement="top"
											tooltip={description}
										>
											<span>
												{name}{' '}
												<FontAwesomeIcon
													icon="info-circle"
													className="aligner aligner-item aligner--hCenter card-header-icon custom-tooltip"
												/>
											</span>
										</OverlayTooltip>
									</div>
									<OverlayTooltip
										id={`tooltip-app-status-info-${name}-${key}`}
										placement="top"
										tooltip={tooltip}
									>
										<FontAwesomeIcon
											icon={icon}
											className="aligner aligner-item aligner--hCenter card-header-icon"
										/>
									</OverlayTooltip>
								</div>
							}
							bodyChildren={
								<div style={{ textAlign: 'center' }}>
									<p className="u-margin-v4">
										<img src={image} alt={name} className="app-image" />
									</p>
									{/* <p className="u-margin-b3">{description}</p> */}
								</div>
							}
							footerClassName="card-footer u-padding-0"
							footerChildren={
								<div className="aligner aligner--row">
									{this.renderFooter(isAppActive, left, right, full, key, site.siteId)}
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
				<div className="u-padding-v5">
					<Row className="u-margin-b4 u-padding-h5">
						<CustomMessage
							header="Information"
							type="info"
							message={
								'<p style="font-size: 16px">To enable/disable any app please contact your respective Account Manager.</p>'
							}
							rootClassNames="u-margin-b4"
							dismissible
						/>
						<Link to={`/sites/${site.siteId}/settings`}>
							<CustomButton variant="secondary" className="pull-right">
								<React.Fragment>
									Settings
									<FontAwesomeIcon icon="cog" className="u-margin-l2" />
								</React.Fragment>
							</CustomButton>
						</Link>
					</Row>
					{appStatuses ? this.renderApps() : this.renderLoader()}
				</div>
			</ActionCard>
		);
	}
}

export default ManageSite;
