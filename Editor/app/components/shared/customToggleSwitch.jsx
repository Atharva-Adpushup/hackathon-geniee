import React from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

class customToggleSwitch extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: (props.checked || false)
		};
	}

	componentWillMount() {
		if (this.props.attachToForm) {
			this.props.attachToForm(this); // Attaching the component to the form
		}
	}

	componentWillReceiveProps(nextProps) {
		if (this.props.checked !== nextProps.checked) {
			this.setState({ value: nextProps.checked });
		}
	}

	componentWillUnmount() {
		if (this.props.detachFromForm) {
			this.props.detachFromForm(this); // Detaching if unmounting
		}
	}

	setValue() {
		this.props.onChange ? this.props.onChange(!this.state.value) : null;
		this.setState({
			value: !this.state.value
		});
	}

	renderToggleSwitch() {
		return (
			<div className={this.props.size === 's' ? 'toggle toggleSizeSmall' : 'toggle'}>
				<input id={this.props.id} name={this.props.name} type="checkbox" checked={this.state.value} onChange={this.setValue.bind(this)} />
				<label htmlFor={this.props.id}>
					<div className="toggleSwitch" data-on={this.props.on} data-off={this.props.off}>
					</div>
				</label>
			</div>
		)
	}

	/**
	 * Render horizontal layout of component
	 * @param options
	 * @returns {XML}
	 */
	renderHorizontalLayout(options) {
		const labelClassNames = (options.defaultLayout) ? '' : 'u-padding-r10px',
			componentClassNames = (options.defaultLayout) ? '' : 'u-padding-l10px';

		return (
			<div className={options.errorClassName}>
				<Col className={labelClassNames} xs={8}>
					<b>{this.props.labelText}</b>
				</Col>
				<Col className={componentClassNames} xs={4}>
					{this.renderToggleSwitch()}
				</Col>
			</div>
		)
	}

	/**
	 * Render vertical layout of component
	 * @param options
	 * @returns {XML}
	 */
	renderVerticalLayout(options) {
		const labelClassNames = (options.defaultLayout) ? '' : 'u-padding-b5px',
			componentClassNames = (options.defaultLayout) ? '' : 'u-padding-0px';

		return (
			<div className={options.errorClassName}>
				<Col className={labelClassNames} xs={12} md={12}>
					<b>{this.props.labelText}</b>
				</Col>
				<Col className={componentClassNames} xs={12} md={12}>
					{this.renderToggleSwitch()}
				</Col>
			</div>
		)
	}

	render() {

		// We create variables that states how the input should be marked.
		// Should it be marked as valid? Should it be marked as required?
		const options = {
			errorClassName: 'clearfix',
			layout: (this.props.layout.toLowerCase()) ? this.props.layout.toLowerCase() : 'horizontal',
			layoutClassName: 'form-group',
			defaultLayout: this.props.defaultLayout,
			classNamesProps: (this.props.className && this.props.className.length > 0) ? this.props.className : ''
		};

		if (options.layout === 'vertical') {
			options.layoutClassName += ' form-group--vertical';
		} else if (options.layout === 'horizontal') {
			options.layoutClassName += ' form-group--horizontal';
		}

		// Concatenate props class names
		options.layoutClassName += ' ' + options.classNamesProps;

		return (
			<Row key={this.props.name} className={options.layoutClassName}>
				{(options.layout === 'vertical') ? this.renderVerticalLayout(options): this.renderHorizontalLayout(options)}
			</Row>
		);
	}
}

customToggleSwitch.defaultProps = {
	on: 'Enable',
	off: 'Disable',
	defaultLayout: false
};

export default customToggleSwitch;
