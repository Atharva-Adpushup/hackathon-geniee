import React from 'react';
import { Table } from 'react-bootstrap';
import CustomToggleSwitch from '../../../../Components/CustomToggleSwitch/index';
import CustomButton from '../../../../Components/CustomButton/index';
import Loader from '../../../../Components/Loader/index';

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
					isHb: value
				}
			}
		}));
	};

	handleSave = () => {
		const { updateNetworkConfig } = this.props;
		const { networks } = this.state;

		this.setState({ loading: true });

		updateNetworkConfig(networks).then(() => this.setState({ loading: false }));
	};

	render() {
		const { networkConfig } = this.props;
		const { loading } = this.state;
		const networks = Object.keys(networkConfig);

		if (loading) return <Loader height="200px" />;

		return (
			<React.Fragment>
				<Table striped bordered hover>
					<thead>
						<tr>
							<th>Bidder</th>
							<th>Hb Status</th>
						</tr>
					</thead>
					<tbody>
						{networks.map(network => {
							const current = networkConfig[network];
							return (
								<tr key={`${current.name}`}>
									<td>{current.name.toUpperCase()}</td>
									<td>
										<CustomToggleSwitch
											layout="nolabel"
											className="u-margin-b4 negative-toggle"
											checked={current.isHb}
											onChange={this.handleToggle}
											size="m"
											on="Yes"
											off="No"
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
