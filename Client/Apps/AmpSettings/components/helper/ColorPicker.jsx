import React, { PropTypes } from 'react';
import { Row, Col, Button } from '@/Client/helpers/react-bootstrap-imports';
import reactCSS from 'reactcss';
import { SketchPicker } from 'react-color';

class ColorEditor extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			displayColorPicker: false,
			color: {
				hex: props.value
			}
		};
	}
	handleClick = () => {
		this.setState({ displayColorPicker: !this.state.displayColorPicker });
	};

	handleClose = () => {
		this.setState({ displayColorPicker: false });
	};
	render = () => {
		const styles = reactCSS({
			default: {
				color: {
					height: '16px',
					borderRadius: '2px',
					background: `${this.state.color.hex}`
				},
				swatch: {
					width: '100px',
					padding: '5px',
					background: '#fff',
					borderRadius: '3px',
					boxShadow: '0 0 0 1px rgba(0,0,0,.1)',
					display: 'inline-block',
					cursor: 'pointer'
				},
				popover: {
					position: 'absolute',
					zIndex: '2'
				},
				cover: {
					position: 'fixed',
					top: '0px',
					right: '0px',
					bottom: '0px',
					left: '0px'
				}
			}
		});
		return (
			<div>
				<div style={styles.swatch} onClick={this.handleClick}>
					<div style={styles.color} />
				</div>
				{this.state.displayColorPicker
					? <div style={styles.popover}>
							<div style={styles.cover} onClick={this.handleClose} />
							<SketchPicker
								color={this.state.color}
								onChange={color => {
									this.setState({
										color
									});
									this.props.handleChange(color);
								}}
							/>
						</div>
					: null}
			</div>
		);
	};
}

export default ColorEditor;
