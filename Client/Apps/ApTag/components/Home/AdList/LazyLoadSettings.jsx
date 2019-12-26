import React from 'react';
import { Row, Col } from '@/Client/helpers/react-bootstrap-imports';
import CustomButton from '../../../../../Components/CustomButton/index';
import CustomToggleSwitch from '../../../../../Components/CustomToggleSwitch/index';

const LazyLoadSettings = props => {
	const { checked, id, onChange, onCancel } = props;
	return (
		<Row bsClass="lazyload-wrapper">
			<Col xs={12} className="toggle-container">
				<CustomToggleSwitch
					labelText="Lazyload Enabled"
					className="mB-10"
					checked={checked}
					onChange={val => onChange({ enableLazyLoading: val })}
					layout="horizontal"
					size="m"
					on="Yes"
					off="No"
					defaultLayout
					name={`lazyLoadSwitch-${id}`}
					id={`js-lazy-load-switch-${id}`}
				/>
			</Col>
			<Col xs={6} xsPush={6}>
				<CustomButton
					variant="secondary"
					className="u-margin-l3 u-margin-t3 pull-right"
					onClick={() => onCancel('showLazyload')}
				>
					Back
				</CustomButton>
			</Col>
		</Row>
	);
};

export default LazyLoadSettings;
