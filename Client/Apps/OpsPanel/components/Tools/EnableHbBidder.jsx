/* eslint-disable no-alert */
import React from 'react';
import { Table } from '@/Client/helpers/react-bootstrap-imports';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CustomToggleSwitch from '../../../../Components/CustomToggleSwitch/index';
import CustomButton from '../../../../Components/CustomButton/index';
import Loader from '../../../../Components/Loader/index';
import { HB_BIDDERS_KEYS_NULL_SHOULD_NOT_BE_NULL } from '../../configs/commonConsts';

class EnableHbBidder extends React.Component {
	state = {
		loading: false,
		networks: {}
	};

	handleToggle = (value, event) => {
		const network = event.target.getAttribute('name');

		this.setState(state => ({
			...state,
			networks: {
				...state.networks,
				[network]: {
					isActive: value
				}
			}
		}));
	};

	handleSave = () => {
		const { updateNetworkConfig } = this.props;
		const { networks } = this.state;

		if (window.confirm('Are you want to save settings?')) {
			this.setState({ loading: true });
			updateNetworkConfig(networks).then(() => this.setState({ loading: false }));
		}
	};

	render() {
		const { networkConfig } = this.props;
		const { loading } = this.state;
		const hbNetworks = Object.keys(networkConfig).filter(
			network => typeof networkConfig[network].isHb === 'boolean' && networkConfig[network].isHb
		);

		if (loading) return <Loader height="200px" />;

		return (
			<React.Fragment>
				<Table striped bordered hover>
					<thead>
						<tr>
							<th>Bidder</th>
							<th>Active Status</th>
						</tr>
					</thead>
					<tbody>
						{hbNetworks.map(network => {
							const current = networkConfig[network];
							const isBidderConfigValid = !HB_BIDDERS_KEYS_NULL_SHOULD_NOT_BE_NULL.some(
								key => current[key] === null
							);

							return (
								<tr key={`${current.name}`}>
									<td>
										{current.name.toUpperCase()}
										{!isBidderConfigValid && (
											<React.Fragment>
												{' '}
												<FontAwesomeIcon
													icon="info-circle"
													title="Please contact engineering team with required bidder details to activate this bidder."
												/>
											</React.Fragment>
										)}
									</td>
									<td>
										<CustomToggleSwitch
											layout="nolabel"
											className="u-margin-b4 negative-toggle"
											checked={current.isActive}
											onChange={this.handleToggle}
											size="m"
											on="Yes"
											off="No"
											disabled={!isBidderConfigValid}
											defaultLayout
											name={network}
											id={`js-hb-${current.name}`}
										/>
									</td>
								</tr>
							);
						})}
					</tbody>
				</Table>
				<CustomButton variant="primary" className="pull-right" onClick={this.handleSave}>
					Save
				</CustomButton>
			</React.Fragment>
		);
	}
}

export default EnableHbBidder;
