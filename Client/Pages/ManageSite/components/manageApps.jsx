import React from 'react';
import { Button, Row } from '@/Client/helpers/react-bootstrap-imports';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import OverlayTooltip from '../../../Components/OverlayTooltip/index';
import {
	APPS,
	STATUSES,
	LINK_TYPE,
	TYPE,
	DEFAULT_ITEM,
	DISABLED_APP_KEYS_IF_APLITE
} from '../constants/index';
import Card from '../../../Components/Layout/Card';
import Loader from '../../../Components/Loader/index';
import CustomMessage from '../../../Components/CustomMessage/index';

class ManageApps extends React.Component {
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
		const { apps = {} } = site;
		const { appStatuses = {} } = site;
		const disableAppStyles = { pointerEvents: 'none', opacity: 0.5 };

		const activeAppsArr = [];
		for (let key in apps) {
			if (apps[key]) activeAppsArr.push(key);
		}

		if (appStatuses[7]) {
			activeAppsArr.push('adRecover');
		}
		if (appStatuses[8]) {
			activeAppsArr.push('manageAdsTxt');
		}

		return (
			<div className="aligner aligner--row aligner--wrap">
				{APPS.map(app => {
					const { name, alias, image, description, key, left, right, full = false } = app;

					const isAppActive = activeAppsArr.includes(alias);
					const statuses = isAppActive ? STATUSES.ACTIVE : STATUSES.INACTIVE;
					const { type, icon, tooltip } = statuses;

					return (
						<Card
							style={
								apps.apLite && DISABLED_APP_KEYS_IF_APLITE.includes(key) ? disableAppStyles : null
							}
							rootClassName="manage-site-card u-margin-r4 u-margin-b4"
							key={`card-${key}`}
							type={type}
							headerClassName="card-header"
							bodyClassName="card-body"
							headerChildren={
								<div className="aligner aligner--row">
									<div className="aligner-item card-header-title" style={{ position: 'relative' }}>
										{key !== 2 && (
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
										)}
										{key === 2 && <span>{name}</span>}
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

	render() {
		const { site } = this.props;

		const { appStatuses = false } = site;
		return (
			<React.Fragment>
				{appStatuses ? (
					<div>
						{this.renderApps()}
						<Row className="u-padding-h4 u-padding-b4">
							<CustomMessage
								header="Information"
								type="info"
								message={
									'<p style="font-size: 16px">To enable/disable any app please contact your respective Account Manager.</p>'
								}
								rootClassNames=""
								dismissible
							/>
						</Row>
					</div>
				) : (
					<Loader />
				)}
			</React.Fragment>
		);
	}
}

export default ManageApps;
