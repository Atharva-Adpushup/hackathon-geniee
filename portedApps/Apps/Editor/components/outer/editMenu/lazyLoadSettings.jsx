import React, { Component } from 'react';
import CustomToggleSwitch from 'components/shared/customToggleSwitch.jsx';
import { Col } from 'react-bootstrap';
import { CustomButton } from 'shared/components.jsx';

class LazyLoadSettings extends Component {
	constructor(props) {
		super(props);
		this.state = {
			lazyLoad: this.props.section && this.props.section.enableLazyLoading
		};
	}

	render() {
		return (
			<div>
				<Col xs={12} className="u-padding-0px">
					<CustomToggleSwitch
						labelText="Enable LazyLoading"
						className="mB-10"
						checked={this.state.lazyLoad}
						onChange={val => {
							this.setState({ lazyLoad: !!val }, () => {
								this.props.onToggleLazyLoad(this.props.section.id, val);
							});
						}}
						layout="horizontal"
						size="m"
						on="Yes"
						off="No"
						defaultLayout={this.props.fromPanel ? false : true}
						name={
							this.props.section && this.props.section.id
								? `lazyLoadSwitch-${this.props.section.id}`
								: 'lazyLoadSwitch'
						}
						id={
							this.props.section && this.props.section.id
								? `js-lazyLoad-switch-${this.props.section.id}`
								: 'js-lazyLoad-switch'
						}
						customComponentClass={this.props.fromPanel ? 'u-padding-0px' : ''}
					/>
					<CustomButton label="Back" handler={this.props.onCancel} />
				</Col>
			</div>
		);
	}
}

export default LazyLoadSettings;
