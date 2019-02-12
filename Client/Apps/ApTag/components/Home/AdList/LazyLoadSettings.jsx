import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { CustomButton } from '../../shared/index';
import CustomToggleSwitch from '../../../../../Components/CustomToggleSwitch/index';

const LazyLoadSettings = props => {
	const { checked, id, changeHandler, cancelHandler } = props;
	return (
		<Row>
			<Col xs={12}>
				<CustomToggleSwitch
					labelText="Lazyload Enabled"
					className="mB-10"
					checked={checked}
					onChange={val => changeHandler({ enableLazyLoading: val })}
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
				<CustomButton label="Back" handler={() => cancelHandler('showLazyload')} />
			</Col>
		</Row>
	);
};

export default LazyLoadSettings;
