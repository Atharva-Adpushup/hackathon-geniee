import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

// main app
class App extends Component {
	state = {
		domain: '',
		userId: '',
		securityKey: '',
		adsTxt: '',
		successMsg: '',
		errorMsg: ''
	};

	handleInputChange = event => {
		this.setState({
			[event.target.name]: event.target.value
		});
	};

	handleAdsTxtInputChange = event => {
		this.setState({
			[event.target.name]: event.target.value || ' '
		});
	};

	getAdsTxt = event => {
		event.preventDefault();
		const { userId, domain } = this.state;
		if (domain && userId) {
			axios
				.get(`/getAdsTxt?userId=${userId}&domain=${domain}`)
				.then(res => {
					this.setState({
						adsTxt: res.data.adsTxt
					});
				})
				.catch(error => {
					this.setState({
						errorMsg: error.response.data.error
					});
				});
		} else {
			this.setState({
				errorMsg: 'user email and site domain are required to get ads.txt'
			});
		}
	};

	closeMessage = msgType => {
		this.setState({
			[msgType]: null
		});
	};

	setAdsTxt = event => {
		event.preventDefault();
		const { userId, domain, adsTxt, securityKey } = this.state;
		if (domain && userId && securityKey) {
			axios
				.post(`/setAdsTxt`, { userId, domain, adsTxt, securityKey })
				.then(res => {
					this.setState({
						successMsg: `ads.txt updated for ${userId}'s site ${domain}`
					});
				})
				.catch(error => {
					this.setState({
						errorMsg: error.response.data.error
					});
				});
		} else {
			this.setState({
				errorMsg: 'user email and domain are required to update ads.txt'
			});
		}
	};

	render() {
		const { userId, domain, adsTxt, securityKey, successMsg, errorMsg } = this.state;
		return (
			<React.Fragment>
				<h1> ads.txt Manager</h1>
				<div className="formContainer">
					<h2>Get ads.txt</h2>
					<form onSubmit={this.getAdsTxt}>
						<input
							type="text"
							name="userId"
							required
							placeholder="enter publisher email"
							value={userId}
							onChange={this.handleInputChange}
						/>
						<input
							type="text"
							name="domain"
							required
							placeholder="enter site domain"
							value={domain}
							onChange={this.handleInputChange}
						/>
						<input type="submit" value="Get ads.txt" />
					</form>
				</div>
				<div className="formContainer">
					<h2>Set ads.txt</h2>
					<form onSubmit={this.setAdsTxt} style={{ visibility: adsTxt ? 'visible' : 'hidden' }}>
						<textarea
							type="text"
							name="adsTxt"
							required
							placeholder="enter publisher email"
							value={adsTxt}
							onChange={this.handleAdsTxtInputChange}
						/>
						<input
							type="text"
							name="securityKey"
							required
							placeholder="enter secutity key"
							value={securityKey}
							onChange={this.handleInputChange}
						/>
						<input type="submit" value="Update ads.txt" />
					</form>
				</div>

				{successMsg && (
					<div className="success message">
						{successMsg}
						<span className="close" onClick={this.closeMessage.bind(this, 'successMsg')}>
							x
						</span>
					</div>
				)}
				{errorMsg && (
					<div className="error message">
						{errorMsg}
						<span className="close" onClick={this.closeMessage.bind(this, 'errorMsg')}>
							x
						</span>
					</div>
				)}
			</React.Fragment>
		);
	}
}

ReactDOM.render(<App />, document.getElementById('app'));
