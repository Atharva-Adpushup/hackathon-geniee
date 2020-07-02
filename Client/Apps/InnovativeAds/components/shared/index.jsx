import React from 'react';
import { Col } from '@/Client/helpers/react-bootstrap-imports';
import FieldGroup from '../../../../Components/Layout/FieldGroup';

const CustomInput = ({ size, id, label, type, name, handler, value }) => (
	<Col md={size}>
		<FieldGroup
			id={id}
			label={label}
			type={type}
			name={name}
			placeholder={label}
			className="u-padding-v4 u-padding-h4"
			onChange={handler}
			value={value}
		/>
	</Col>
);

export default CustomInput;
