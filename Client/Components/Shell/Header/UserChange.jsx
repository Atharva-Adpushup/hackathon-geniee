/* eslint-disable no-useless-escape */
/* eslint-disable no-alert */
/* eslint-disable no-console */
import React, { Component } from 'react';
import { Form, FormControl } from '@/Client/helpers/react-bootstrap-imports';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CustomButton from '../../CustomButton/index';
import { domanize } from '../../../helpers/commonFunctions';

class UserChange extends Component {
	state = {
		email: '',
		users: [],
		showFilteredList: false
	};

	componentDidMount() {
		const {
			findUsers,
			findUsersAction,
			user: { paymentReconciliation: forPaymentReconciliation }
		} = this.props;
		const { fetched, isFetching, data: users } = findUsers;
		const options = { forPaymentReconciliation };
		if (!(fetched || isFetching)) {
			findUsersAction(options)
				.then(response => {
					const { data } = response.data;
					this.setState({ users: data.users });
				})
				.catch(err => {
					console.log(err);
					return window.alert('User Switch Failed. Please contact Tech team.');
				});
		} else {
			this.setState({ users });
		}
	}

	static getDerivedStateFromProps(props, state) {
		const { findUsers } = props;
		const { fetched, data: users } = findUsers;

		if (fetched) {
			return {
				...state,
				users
			};
		}
		return state;
	}

	onValChange = e => {
		this.setState({
			[e.target.name]: e.target.value
		});
	};

	onFocus = () => {
		this.setState({ showFilteredList: true });
	};

	onBlur = () => {
		this.setState({ showFilteredList: false });
	};

	handleValidation = email => {
		const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

		if (!email || !emailRegex.test(email)) {
			return { isValid: false, error: 'Invalid Email' };
		}

		return {
			isValid: true
		};
	};

	getFormattedUserDomainsList = (domains = [], siteIds = []) =>
		// removed filter of 5 as this is affecting the filter on the basis of domain or siteId beyond 5
		domains
			.map((domain, i) => {
				const siteId = siteIds[i];
				const currentDomain = domanize(domain);
				return `${currentDomain}(${siteId})`;
			})
			.join(' | ');

	onFormSubmit = e => {
		e.preventDefault();

		const { email } = this.state;
		const { switchUser } = this.props;

		const formValidationCheck = this.handleValidation(email);
		if (formValidationCheck.isValid) {
			return switchUser(email);
		}
		return window.alert(formValidationCheck.error);
	};

	getFilteredUserDataList = users => (
		<datalist id="users-list">
			{users.map(user => (
				<option
					key={user.email}
					value={user.email}
					label={this.getFormattedUserDomainsList(user.domains, user.siteIds)}
				/>
			))}
		</datalist>
	);

	render() {
		const { email, users, showFilteredList } = this.state;
		const { associatedAccounts = [], findUsers } = this.props;
		const { fetched: findUserFetched } = findUsers;
		const { getFilteredUserDataList } = this;
		const filteredUserDataList = getFilteredUserDataList(
			associatedAccounts.length ? [...associatedAccounts] : [...users]
		);
		return (
			<Form onSubmit={this.onFormSubmit} className="change-user-form">
				<FormControl
					type="text"
					name="email"
					value={email}
					onChange={this.onValChange}
					onFocus={this.onFocus}
					list="users-list"
					placeholder="Email"
					style={{ borderRadius: '0', borderTopLeftRadius: 4, borderBottomLeftRadius: 4 }}
					onBlur={this.onBlur}
					// fetch findUser is pending - disable the widget untill it gets fetched
					disabled={!findUserFetched}
				/>
				{showFilteredList ? filteredUserDataList : ''}

				<CustomButton
					type="submit"
					variant="secondary"
					style={{
						borderRadius: '0',
						borderTopRightRadius: 4,
						borderBottomRightRadius: 4,
						height: '34'
					}}
					title="Change User"
					// fetch findUser is pending - disable the widget untill it gets fetched
					disabled={!findUserFetched}
				>
					<FontAwesomeIcon size="1x" icon="sign-in-alt" className="u-margin-r3" />
				</CustomButton>
			</Form>
		);
	}
}

export default UserChange;
