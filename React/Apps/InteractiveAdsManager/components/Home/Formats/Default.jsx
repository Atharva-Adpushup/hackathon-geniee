import React, { Component } from 'react';

class Default extends Component {
	constructor(props) {
		super(props);
		this.state = {
			css: ''
		};
		this.saveHandler = this.saveHandler.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	saveHandler() {
		this.props.save.saveHandler({
			event: 'scriptLoaded',
			eventData: {
				value: this.state.css
			}
		});
		console.log('Here');
	}

	handleChange(e) {
		this.setState({
			[e.target.name]: e.target.value
		});
	}

	render() {
		return (
			<div>
				<label htmlFor="css">Custom CSS</label>
				<textarea style={{ width: '100%', minHeight: '200px' }} onChange={this.handleChange}>
					{this.state.css}
				</textarea>
				{this.props.save.renderFn(this.props.save.label, this.saveHandler)}
			</div>
		);
	}
}

export default Default;
