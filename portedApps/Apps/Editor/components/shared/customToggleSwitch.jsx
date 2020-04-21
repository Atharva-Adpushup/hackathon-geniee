import React from 'react';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';

class customToggleSwitch extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: props.checked || false
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
		if (!this.props.disabled) {
			this.props.onChange ? this.props.onChange(!this.state.value) : null;
			this.setState({
				value: !this.state.value
			});
		}
	}

	renderToggleSwitch(options) {
		let rootClassName = this.props.size === 's' ? 'toggle toggleSizeSmall' : 'toggle',
			isNoLabelLayout = !!(options && options.nolabel),
			leftAlignedStyles = isNoLabelLayout
				? {
					justifyContent: 'flex-start'
				}
				: null;

		rootClassName += this.props.disabled ? ' toggle--disabled' : '';

		return (
			<div className={rootClassName}>
				<input
					id={this.props.id}
					name={this.props.name}
					type="checkbox"
					checked={this.state.value}
					onChange={this.setValue.bind(this)}
				/>
				<label style={leftAlignedStyles} htmlFor={this.props.id}>
					<div className="toggleSwitch" data-on={this.props.on} data-off={this.props.off} />
				</label>
			</div>
		);
	}

	/**
	 * Render horizontal layout of component
	 * @param options
	 * @returns {XML}
	 */
	renderHorizontalLayout(options) {
		const { labelText, subText, subComponent } = this.props || {};
		let labelClassNames = options.defaultLayout ? '' : 'u-padding-r10px',
			componentClassNames = options.defaultLayout ? '' : 'u-padding-l10px';

		componentClassNames += ` ${options.customComponentClass}`;
		return (
			<div className={options.errorClassName}>
				<Col className={labelClassNames} xs={options.labelSize}>
					{options.labelBold ? <b>{labelText}</b> : labelText}
					{subText && <div>{subText}</div>}
					{subComponent}
				</Col>
				<Col className={componentClassNames} xs={options.componentSize}>
					{this.renderToggleSwitch()}
				</Col>
			</div>
		);
	}

	/**
	 * Render vertical layout of component
	 * @param options
	 * @returns {XML}
	 */
	renderVerticalLayout(options) {
		const labelClassNames = options.defaultLayout ? '' : 'u-padding-b5px',
			componentClassNames = options.defaultLayout ? '' : 'u-padding-0px';

		return (
			<div className={options.errorClassName}>
				<Col className={labelClassNames} xs={12} md={12}>
					<b>{this.props.labelText}</b>
				</Col>
				<Col className={componentClassNames} xs={12} md={12}>
					{this.renderToggleSwitch()}
				</Col>
			</div>
		);
	}

	render() {
		// We create variables that states how the input should be marked.
		// Should it be marked as valid? Should it be marked as required?
		const props = this.props,
			options = {
				errorClassName: 'clearfix',
				// layout property options: 'horizontal', 'vertical', 'nolabel'
				layout: props.layout.toLowerCase() ? props.layout.toLowerCase() : 'horizontal',
				layoutClassName: 'form-group',
				defaultLayout: props.defaultLayout,
				classNamesProps: props.className && props.className.length > 0 ? props.className : '',
				labelSize: props.labelSize,
				componentSize: props.componentSize,
				customComponentClass: props.customComponentClass,
				labelBold: props.labelBold
			},
			renderBlocks = [],
			isLayoutProp = !!options.layout,
			isLabelTextProp = !!props.labelText,
			isLayoutVertical = !!(isLayoutProp && options.layout === 'vertical'),
			isLayoutHorizontal = !!(isLayoutProp && options.layout === 'horizontal'),
			isLayoutNoLabel = !!(isLayoutProp && options.layout === 'nolabel' && !isLabelTextProp);

		if (isLayoutVertical) {
			options.layoutClassName += ` form-group--vertical ${options.classNamesProps}`;
			renderBlocks.push(
				<Row key={props.name} className={options.layoutClassName}>
					{this.renderVerticalLayout(options)}
				</Row>
			);
		} else if (isLayoutHorizontal) {
			options.layoutClassName += ` form-group--horizontal ${options.classNamesProps}`;
			renderBlocks.push(
				<Row key={props.name} className={options.layoutClassName}>
					{this.renderHorizontalLayout(options)}
				</Row>
			);
		} else if (isLayoutNoLabel) {
			renderBlocks.push(this.renderToggleSwitch({ nolabel: true }));
		}

		return <div>{renderBlocks}</div>;
	}
}

customToggleSwitch.defaultProps = {
	on: 'Enable',
	off: 'Disable',
	defaultLayout: false,
	labelSize: 8,
	componentSize: 4,
	customComponentClass: '',
	labelBold: true
};

export default customToggleSwitch;
