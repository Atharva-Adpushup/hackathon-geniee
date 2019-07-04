/* eslint-disable no-useless-escape */
/* eslint-disable no-alert */
/* eslint-disable no-console */
import React, { Component } from 'react';
import { Form, FormControl } from 'react-bootstrap';

import CustomButton from '../../CustomButton/index';

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
					placeholder="email"
				/>
				{users.length ? (
					<datalist id="users-list">
						{users.map(user => (
							<option key={user.email} value={user.email} />
						))}
					</datalist>
				) : (
					''
				)}

				<CustomButton
					type="submit"
					variant="secondary"
					className="u-margin-l3 u-margin-r3 pull-right"
				>
					Change User
				</CustomButton>
			</Form>
		);
	}
}

export default UserChange;
