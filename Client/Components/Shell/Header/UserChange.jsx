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
		users: []
	};

	onValChange = e => {
		this.setState({
			[e.target.name]: e.target.value
		});
	};

	onFocus = () => {
		const { users: usersState } = this.state;
		const { findUsers } = this.props;

		if (usersState.length === 0)
			return findUsers()
				.then(response => {
					const { data } = response.data;
					this.setState({ users: data.users });
				})
				.catch(err => {
					console.log(err);
					return window.alert('User Switch Failed. Please contact Tech team.');
				});
		return null;
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

	render() {
		const { email, users } = this.state;

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
				/>
				{users.length ? (
					<datalist id="users-list">
						{users.map(user => (
							<option
								key={user.email}
								value={user.email}
								label={this.getFormattedUserDomainsList(user.domains, user.siteIds)}
							/>
						))}
					</datalist>
				) : (
					''
				)}

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
				>
					<FontAwesomeIcon size="1x" icon="sign-in-alt" className="u-margin-r3" />
				</CustomButton>
			</Form>
		);
	}
}

export default UserChange;
