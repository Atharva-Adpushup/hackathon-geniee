import React from 'react';
import { Row, Col } from 'react-bootstrap';

import { stat } from 'fs';
import Empty from '../../../../../Components/Empty/index';
import FieldGroup from '../../../../../Components/Layout/FieldGroup';

class Pagegroups extends React.Component {
	state = {
		pagegroups: {}
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
										url: value
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

	render() {
		const { site } = this.props;
		const { pagegroups } = this.state;
		const { apConfigs: { pageGroupPattern = {} } = {} } = site;
		const keys = Object.keys(pageGroupPattern);

		if (!keys.length) return <Empty message="Seems like you haven't created any pagegroups yet" />;

		return (
			<div className="u-margin-v4">
				{keys.map(device => {
					const pgs = pageGroupPattern[device];

					return pgs.map(pagegroup => {
						const channel = `${pagegroup.pageGroup}:${device}`;
						const current = pagegroups[channel] || {};
						const { pattern = pagegroup.pattern, urls = {} } = current;
						return (
							<Row key={channel} className="u-margin-v5">
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
									<FieldGroup
										name={`url-${channel}-1`}
										value={urls[1] ? urls[1].url : ''}
										type="text"
										onChange={this.handleChange}
										size={6}
										id={`url-${channel}-1`}
										placeholder="Enter Url"
										className="u-padding-v4 u-padding-h4"
										label=""
									/>
									<FieldGroup
										name={`url-${channel}-2`}
										value={urls[2] ? urls[2].url : ''}
										type="text"
										onChange={this.handleChange}
										size={6}
										id={`url-${channel}-2`}
										placeholder="Enter Url"
										className="u-padding-v4 u-padding-h4"
										label=""
									/>
									<FieldGroup
										name={`url-${channel}-3`}
										value={urls[3] ? urls[3].url : ''}
										type="text"
										onChange={this.handleChange}
										size={6}
										id={`url-${channel}-3`}
										placeholder="Enter Url"
										className="u-padding-v4 u-padding-h4"
										label=""
									/>
									<FieldGroup
										name={`url-${channel}-4`}
										value={urls[4] ? urls[4].url : ''}
										type="text"
										onChange={this.handleChange}
										size={6}
										id={`url-${channel}-4`}
										placeholder="Enter Url"
										className="u-padding-v4 u-padding-h4"
										label=""
									/>
								</Col>
							</Row>
						);
					});
				})}
			</div>
		);
	}
}

export default Pagegroups;
