/* eslint-disable no-param-reassign */
import React, { useState } from 'react';
import { Row, Col } from '@/Client/helpers/react-bootstrap-imports';
import CustomButton from '../../../../../Components/CustomButton/index';
import FieldGroup from '../../../../../Components/Layout/FieldGroup';

function AdUnitSettings(props) {
	const {
		modalData: { sizeFilters: initialSizeFilters } = {},
		modalToggle,
		onAdSizeSettingsSave,

		modalData
	} = props;
	const giveParseSizeValues = sizeFilters => {
		const keys = Object.keys(sizeFilters);
		for (let index = 0; index < keys.length; index += 1) {
			const key = keys[index];
			if (sizeFilters[key] !== '') sizeFilters[key] = parseInt(sizeFilters[key], 10);
		}
		return sizeFilters;
	};
	const [sizeFilters, setSizeFilters] = useState(giveParseSizeValues(initialSizeFilters));
	const handleSizeFilterChange = event => {
		const { name, value } = event.target;
		const inputField = name.split('-')[1];
		setSizeFilters({ ...sizeFilters, [inputField]: +value });
	};

	const closeModal = () => {
		modalToggle(false);
	};

	const handleSave = () => {
		onAdSizeSettingsSave({ ...modalData, sizeFilters });
	};

	return (
		<div>
			<Row>
				<Col md={6}>
					<FieldGroup
						name="sizeFilters-maxHeight"
						type="number"
						label="Set max height"
						id="sizeFilters-maxHeight"
						placeholder="Max height"
						className="u-padding-h4"
						value={sizeFilters && sizeFilters.maxHeight}
						onChange={handleSizeFilterChange}
						required
					/>
				</Col>
				<Col md={6}>
					<FieldGroup
						name="sizeFilters-maxWidth"
						type="number"
						label="Set max width"
						id="sizeFilters-maxWidth"
						placeholder="Max width"
						className="u-padding-h4"
						value={sizeFilters && sizeFilters.maxWidth}
						onChange={handleSizeFilterChange}
						required
					/>
				</Col>

				<Col md={6}>
					<FieldGroup
						name="sizeFilters-minHeight"
						type="number"
						label="Set min height"
						id="sizeFilters-minHeight"
						placeholder="Min height"
						className="u-padding-h4"
						value={sizeFilters && sizeFilters.minHeight}
						onChange={handleSizeFilterChange}
						required
					/>
				</Col>
				<Col md={6}>
					<FieldGroup
						name="sizeFilters-minWidth"
						type="number"
						label="Set min width"
						id="sizeFilters-minWidth"
						placeholder="Min width"
						className="u-padding-h4"
						value={sizeFilters && sizeFilters.minWidth}
						onChange={handleSizeFilterChange}
						required
					/>
				</Col>
			</Row>

			<Row>
				<Col md={12}>
					<CustomButton variant="primary" className="pull-right u-margin" onClick={closeModal}>
						Cancel
					</CustomButton>
					<CustomButton variant="primary" className="pull-right u-margin-r2" onClick={handleSave}>
						Save Settings
					</CustomButton>
				</Col>
			</Row>
		</div>
	);
}

export default AdUnitSettings;
