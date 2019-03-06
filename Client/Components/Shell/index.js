import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import Header from './Header';
import Sidebar from './Sidebar';
import Loader from '../Loader/index';
import NotificationContainer from '../../Containers/NotificationContainer';
import { showNotification } from '../../actions/uiActions';
import { connect } from 'react-redux';
class Shell extends React.Component {
	state = { isSidebarOpen: true };

	componentDidMount() {
		const { fetched, fetchGlobalData, showNotification, user } = this.props;
		if (!fetched)
			fetchGlobalData().then(() => {
				const { user } = this.props;
				if (!user.isPaymentDetailsComplete)
					showNotification({
						mode: 'error',
						title: 'Payments Error',
						message:
							'Please complete your Payments Profile, which is required to transfer your ad revenue.',
						autoDismiss: 0
					});
			});
	}

	sidebarToggle = () => {
		this.setState(state => ({ isSidebarOpen: !state.isSidebarOpen }));
	};

	renderLoader = () => (
		<div style={{ position: 'relative', width: '100%', height: '100%' }}>
			<Loader />
		</div>
	);

	render() {
		const { isSidebarOpen } = this.state;
		const { children, fetched } = this.props;

		return (
			<Grid fluid>
				<Row>
					<Col>
						<Header sidebarToggle={this.sidebarToggle} />
					</Col>
				</Row>
				<Row className="sidebar-main-wrap">
					<Sidebar show={isSidebarOpen} />
					<main className="main-content">{fetched ? children : this.renderLoader()}</main>
				</Row>
				<NotificationContainer />
			</Grid>
		);
	}
}
export default connect(
	null,
	{ showNotification }
)(Shell);
