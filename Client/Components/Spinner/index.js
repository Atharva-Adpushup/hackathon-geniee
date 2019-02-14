import React from 'react';
import PropTypes from 'prop-types';

const Spinner = ({ size, margin, color, className }) => {
	const spSize = parseInt(size, 10);
	const spMargin = parseInt(margin, 10);
	const spColor = color;
	const spThickness = spSize * 0.1;
	const spRingSize = spSize - spMargin;

	const sizePX = `${spSize}px`;
	const thicknessPX = `${spThickness}px`;
	const marginPX = `${spMargin}px`;
	const ringSizePX = `${spRingSize}px`;

	return (
		<div
			style={{ width: sizePX, height: sizePX }}
			className={`lds-ring${className ? ` ${className}` : ''}`}
		>
			{(() => {
				const arr = [];
				for (let i = 0; i < 4; i += 1) {
					arr.push(
						spColor !== 'primary' ? (
							<div
								key={i}
								style={{
									width: ringSizePX,
									height: ringSizePX,
									margin: marginPX,
									borderWidth: thicknessPX,
									borderStyle: 'solid',
									borderColor: `${spColor} transparent transparent transparent`
								}}
							/>
						) : (
							<div
								className="spinner-primary-color"
								key={i}
								style={{
									width: ringSizePX,
									height: ringSizePX,
									margin: marginPX,
									borderWidth: thicknessPX,
									borderStyle: 'solid'
								}}
							/>
						)
					);
				}

				return arr;
			})()}
		</div>
	);
};

Spinner.propTypes = {
	size: PropTypes.number,
	margin: PropTypes.number,
	color: PropTypes.string, // 'primary' or any Hex Color Code
	className: PropTypes.string
};

Spinner.defaultProps = {
	size: 30,
	margin: 0,
	color: '#fff',
	className: ''
};

export default Spinner;
