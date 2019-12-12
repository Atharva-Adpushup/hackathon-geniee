import React from 'react';
import { Row, Col } from 'react-bootstrap';

import Empty from '../../../../../Components/Empty/index';
import FieldGroup from '../../../../../Components/Layout/FieldGroup';
import CustomButton from '../../../../../Components/CustomButton/index';
import CustomIcon from '../../../../../Components/CustomIcon/index';
import { ICONS } from '../../../configs/commonConsts';

function getState(props) {
	const { apConfigs: { pageGroupPattern = {} } = {} } = props.site;
	const keys = Object.keys(pageGroupPattern);
	const pagegroups = {};

	keys.forEach(device => {
		const pgs = pageGroupPattern[device];

		return pgs.map(pagegroup => {
			const channel = `${pagegroup.pageGroup}:${device}`;
			pagegroups[channel] = {
				pattern: pagegroup.pattern,
				urls: {}
			};
			return true;
		});
	});

	return {
		pagegroups,
		siteDomain: props.site.siteDomain,
		showSpinner: false
	};
}
class Pagegroups extends React.Component {
	constructor(props) {
		super(props);
		const state = getState(props);
		this.state = state;
	}

	static getDerivedStateFromProps(props, state) {
		if (props.site.siteDomain !== state.siteDomain) {
			return getState(props);
		}
		return null;
	}

	crossPagegroupTest = (channel, url) => {
		const { pagegroups } = this.state;
		const channels = Object.keys(pagegroups);
		let response = false;

		channels.some(chnl => {
			if (chnl !== channel) {
				const current = pagegroups[chnl] || {};
				const { pattern = '' } = current;
				const re = new RegExp(pattern);

				if (pattern && pattern.trim().length && re.test(url)) {
					response = true;
					return true;
				}
			}
			return false;
		});
		return response;
	};

	handleChange = event => {
		const { value } = event.target;
		const values = event.target.getAttribute('name');

		const [identifier, pagegroup, index] = values.split('-');

		switch (identifier) {
			case 'pattern':
				this.setState(state => ({
					...state,
					pagegroups: {
						...state.pagegroups,
						[pagegroup]: {
							...state.pagegroups[pagegroup],
							pattern: value
						}
					}
				}));
				break;

			case 'url':
				this.setState(state => {
					const urls = state.pagegroups[pagegroup] ? state.pagegroups[pagegroup].urls : {};
					const currentUrl = urls[index] || {};

					if (!value) currentUrl.icon = ICONS[0];

					return {
						...state,
						pagegroups: {
							...state.pagegroups,
							[pagegroup]: {
								...state.pagegroups[pagegroup],
								urls: {
									...urls,
									[index]: {
										...currentUrl,
										url: value,
										icon: {
											icon: 'question',
											styles: { display: 'none' },
											title: 'Status Unknown',
											...currentUrl.icon
										}
									}
								}
							}
						}
					};
				});
				break;

			default:
				break;
		}
	};

	handleVerify = () => {
		this.setState({ showSpinner: true });

		const { pagegroups } = this.state;
		const channels = Object.keys(pagegroups);

		channels.forEach(channel => {
			const current = pagegroups[channel] || {};
			const { pattern = '', urls = {} } = current;
			const re = new RegExp(pattern);
			const urlIndexes = Object.keys(urls);

			urlIndexes.forEach(index => {
				/**
				 * Mode 0: Unknown
				 * Mode 1: Pagegroup pattern Not Found
				 * Mode 2: Current url matches pagegroup pattern
				 * Mode 3: Current url matched more than one pagegroup pattern
				 * Mode 4: Current url not matching anything
				 */
				const urlObject = urls[index];
				let mode = null;

				if (urlObject && urlObject.url && urlObject.url.trim().length) {
					if (!pattern || !pattern.trim().length) mode = 1;
					else if (re.test(urlObject.url)) mode = 2;

					const crossMatching = this.crossPagegroupTest(channel, urlObject.url);
					if (crossMatching) mode = 3;
					else if (mode === null) mode = 4;

					pagegroups[channel].urls[index].icon = ICONS[mode];
				}
			});
		});

		this.setState({ pagegroups, showSpinner: false });
	};

	render() {
		const { site } = this.props;
		const { pagegroups, showSpinner } = this.state;
		const { apConfigs: { pageGroupPattern = {} } = {} } = site;
		const keys = Object.keys(pageGroupPattern);

		if (!keys.length) return <Empty message="Seems like you haven't created any pagegroups yet" />;

		return (
			<div className="u-margin-t4">
				{keys.map(device => {
					const pgs = pageGroupPattern[device];

					return pgs.map(pagegroup => {
						const channel = `${pagegroup.pageGroup}:${device}`;
						const current = pagegroups[channel] || {};
						const { pattern = pagegroup.pattern, urls = {} } = current;
						return (
							<Row key={channel} className="u-margin-v5 pagegroup-row">
								<Col xs={3} className="u-padding-0">
									<FieldGroup
										name={`pattern-${channel}`}
										value={pattern}
										type="text"
										label={`${channel.replace(':', ' - ')}`}
										onChange={this.handleChange}
										size={6}
										id={`pagegroup-input-${channel}`}
										placeholder="Enter Pagegroup Pattern"
										className="u-padding-v4 u-padding-h4"
									/>
								</Col>
								<Col xs={9} className="u-padding-l4">
									{[1, 2, 3, 4].map(value => {
										const urlObject = urls[value] || {
											url: '',
											icon: ICONS[0]
										};
										return (
											<div className="regex-url-wrapper" key={value}>
												<FieldGroup
													name={`url-${channel}-${value}`}
													value={urlObject.url}
													type="text"
													onChange={this.handleChange}
													size={6}
													id={`url-${channel}-${value}`}
													placeholder="Enter Url"
													className="u-padding-v4 u-padding-h4"
													label=""
												/>
												<CustomIcon
													icon={urlObject.icon.icon}
													className={`u-text-red u-margin-l3 u-cursor-pointer ${
														urlObject.icon.className
													}`}
													style={urlObject.icon.styles}
													title={urlObject.icon.title}
												/>
											</div>
										);
									})}
								</Col>
							</Row>
						);
					});
				})}
				<CustomButton
					variant="primary"
					type="submit"
					className="pull-right u-margin-b2 u-margin-r4"
					onClick={this.handleVerify}
					showSpinner={showSpinner}
				>
					Verify
				</CustomButton>
			</div>
		);
	}
}

export default Pagegroups;
