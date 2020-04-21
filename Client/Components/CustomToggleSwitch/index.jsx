/* eslint-disable jsx-a11y/label-has-for */
/* eslint-disable jsx-a11y/label-has-associated-control */
import React from 'react';
import { Row, Col } from '@/Client/helpers/react-bootstrap-imports';

class customToggleSwitch extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: props.checked || false
		};
		this.setValue = this.setValue.bind(this);
	}

	componentWillMount() {
		const { attachToForm } = this.props;
		if (attachToForm) {
			attachToForm(this); // Attaching the component to the form
		}
	}

	componentWillReceiveProps(nextProps) {
		const { checked } = this.props;

		this.setState(state => {
			if (checked !== nextProps.checked) {
				return {
					value: nextProps.checked
				};
			}
			if (!checked && !nextProps.checked && nextProps.labelText === 'AP Lite') {
				return { value: false };
			}
			if (checked && nextProps.checked && nextProps.labelText === 'AP Lite') {
				return { value: true };
			}
			return state;
		});
	}

	componentWillUnmount() {
		const { detachFromForm } = this.props;
		if (detachFromForm) {
			detachFromForm(this); // Detaching if unmounting
		}
	}

	setValue(e) {
		const { disabled, onChange } = this.props;
		const { value } = this.state;
		if (!disabled) {
			if (onChange) onChange(!value, e);
			this.setState({
				value: !value
			});
		}
	}

	renderToggleSwitch(options) {
		const { size, disabled, id, name, on, off } = this.props;
		const { value } = this.state;
		let rootClassName = size === 's' ? 'toggle toggleSizeSmall' : 'toggle';
		const isNoLabelLayout = !!(options && options.nolabel);
		const leftAlignedStyles = isNoLabelLayout
			? {
					justifyContent: 'flex-start'
			  }
			: null;

		rootClassName += disabled ? ' toggle--disabled' : '';

		return (
			<div className={rootClassName} key={`${id}-${name}`}>
				<input id={id} name={name} type="checkbox" checked={value} onChange={this.setValue} />
				<label style={leftAlignedStyles} htmlFor={id}>
					<div className="toggleSwitch" data-on={on} data-off={off} />
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
		const { labelText, subText, subComponent } = this.props;
		const labelClassNames = options.defaultLayout ? '' : 'u-padding-r10px';
		let componentClassNames = options.defaultLayout ? '' : 'u-padding-l10px';

		componentClassNames += ` ${options.customComponentClass}`;

		return (
			<div className={options.errorClassName}>
				<Col className={labelClassNames} xs={options.labelSize}>
					{options.labelBold ? <b>{labelText}</b> : labelText}
					{subText && <i>{subText}</i>}
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
		const { labelText, subText } = this.props;
		const labelClassNames = options.defaultLayout ? '' : 'u-padding-b5px';
		const componentClassNames = options.defaultLayout ? '' : 'u-padding-0px';

		return (
			<div className={options.errorClassName}>
				<Col className={labelClassNames} xs={12} md={12}>
					<b>{labelText}</b>
					{subText && <div>{subText}</div>}
					{subComponent}
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
		const {
			layout,
			defaultLayout,
			className,
			labelSize,
			componentSize,
			customComponentClass,
			labelBold,
			labelText,
			name,
			id
		} = this.props;

		const options = {
			errorClassName: 'clearfix',
			// layout property options: 'horizontal', 'vertical', 'nolabel'
			layout: layout.toLowerCase() ? layout.toLowerCase() : 'horizontal',
			layoutClassName: 'form-group',
			defaultLayout,
			classNamesProps: className && className.length > 0 ? className : '',
			labelSize,
			componentSize,
			customComponentClass,
			labelBold
		};

		const renderBlocks = [];
		const isLayoutProp = !!options.layout;
		const isLabelTextProp = !!labelText;
		const isLayoutVertical = !!(isLayoutProp && options.layout === 'vertical');
		const isLayoutHorizontal = !!(isLayoutProp && options.layout === 'horizontal');
		const isLayoutNoLabel = !!(isLayoutProp && options.layout === 'nolabel' && !isLabelTextProp);

		if (isLayoutVertical) {
			options.layoutClassName += ` form-group--vertical ${options.classNamesProps}`;
			renderBlocks.push(
				<Row key={id || name} className={options.layoutClassName}>
					{this.renderVerticalLayout(options)}
				</Row>
			);
		} else if (isLayoutHorizontal) {
			options.layoutClassName += ` form-group--horizontal ${options.classNamesProps}`;
			renderBlocks.push(
				<Row key={id || name} className={options.layoutClassName}>
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
