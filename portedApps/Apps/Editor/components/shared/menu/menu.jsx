import React, { PropTypes } from 'react';
import $ from 'jquery';
import Glass from '../glass.jsx';
import Utils from '../../../libs/utils.js';
import Content from './content.jsx';

const style = {
	position: 'absolute',
	opacity: 1,
	width: 300,
	display: 'flex',
	top: 0,
	left: 0,
	zIndex: 10000,
	flex: 1
};

class Menu extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			activeItem: props.activeItem || 0
		};
	}

	componentDidMount() {
		this.fixCss();
	}

	componentWillReceiveProps(nextProps) {
		if (typeof nextProps.activeItem !== 'undefined') {
			this.setState({ activeItem: nextProps.activeItem });
		}
	}

	componentDidUpdate() {
		this.fixCss();
	}

	onMenuItemClick(itemNumber) {
		if (this.props.onMenuItemClick) {
			this.props.onMenuItemClick(itemNumber);
		} else {
			this.setState({
				activeItem: itemNumber
			});
		}
	}

	getMenuOrientationClass() {
		return `Top ${this.props.x > $(window).width() / 2 ? 'Right' : 'Left'}`;
	}

	getArrowClass() {
		switch (this.props.arrow) {
			case 'top':
				return 'arrowTop js-arrow js-arrow--top';
			case 'none':
				return '';
			default:
				return 'arrowBottom js-arrow js-arrow--bottom';
		}
	}

	fixCss() {
		const $menu = $(this.refs.main), css = Utils.ui.menuRenderPosition($menu, this.props.position);
		$menu.css(css);
	}

	render() {
		const contentElms = [];
		return (
			<div>
				<Glass clickHandler={this.props.onGlassClick} />
				<div id={this.props.id ? this.props.id : null} ref="main" style={style}>
					<div className={`MenuBarComponentWrap ${this.getMenuOrientationClass()} js-menuBar`}>
						<ul ref="toolBar" className={`MenuBarWrapper  + ${this.getArrowClass()} js-menuBar-wrapper`}>
							{this.props.children.map((el, index) => {
								const elm = React.cloneElement(el, {
									key: index,
									onClick: this.onMenuItemClick.bind(this, index),
									isActive: this.state.activeItem === index,
									onUpdate: this.fixCss.bind(this)
								});
								contentElms.push(elm);
								return elm;
							})}
						</ul>
						{contentElms.map((el, index) => {
							const props = el.props;
							return (
								<div
									key={`menuContent-${index}`}
									style={
										this.state.activeItem === index
											? { display: 'block', position: 'absolute', top: 0, zIndex: -1 }
											: { display: 'none' }
									}
								>
									<Content contentHeading={props.contentHeading}>
										{React.cloneElement(props.children, { onUpdate: props.onUpdate })}
									</Content>
								</div>
							);
						})}
					</div>
				</div>
			</div>
		);
	}
}

Menu.propTypes = {
	onGlassClick: PropTypes.func.isRequired,
	activeItem: PropTypes.number,
	onMenuItemClick: PropTypes.func,
	arrow: PropTypes.string,
	position: PropTypes.object.isRequired,
	children: React.PropTypes.arrayOf(React.PropTypes.element).isRequired
};

Menu.defaultProps = {
	arrow: 'top',
	position: { bottom: 0, height: 0, left: 0, right: 0, top: 0, width: 0 }
};

export default Menu;
