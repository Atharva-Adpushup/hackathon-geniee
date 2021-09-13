import React from 'react';
import { Modal, Checkbox } from '@/Client/helpers/react-bootstrap-imports';
import CustomReactTable from '../../../../../../Components/CustomReactTable/index';

const DEFAULT_AD_UNITS_LIST = [];

const AdUnitsModal = props => {
	const {
		units: adUnitsList = DEFAULT_AD_UNITS_LIST,
		show = false,
		onHide,
		onActiveChange,
		onMultiFormatChange
	} = props;
	return (
		<Modal show={show} onHide={onHide} className="adUnit-modal">
			<Modal.Header closeButton>
				<Modal.Title id="modal-title">List of Ad Units</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				<CustomReactTable
					columns={[
						// { Header: 'Ad Unit', accessor: 'name' },
						{ Header: 'Ad Unit Code', accessor: 'code' },
						{ Header: 'Width', accessor: 'width' },
						{ Header: 'Height', accessor: 'height' },
						{ Header: 'Ap Tag ID', accessor: 'apTagId' },
						{ Header: 'Platform', accessor: 'platform' },
						{
							Header: 'Active',
							Cell: ({ original: { code, isActive, platform } }) => (
								<Checkbox
									onChange={e => onActiveChange(e.target.checked, code, platform)}
									checked={isActive}
								/>
							)
						},
						{
							Header: 'MultiFormat',
							Cell: ({ original: { formats = {}, code, platform } }) => (
								<div>
									<div
										style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
									>
										<Checkbox
											name="video"
											className="u-margin-l1"
											onChange={e => onMultiFormatChange(e.target.checked, code, platform, 'video')}
											checked={formats.video}
										/>
										<b>Outstream</b>
									</div>
									<div
										style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center' }}
									>
										<Checkbox
											name="native"
											className="u-margin-l1"
											onChange={e =>
												onMultiFormatChange(e.target.checked, code, platform, 'native')
											}
											checked={formats.native}
										/>
										<b>Native</b>
									</div>
								</div>
							)
						}
					]}
					data={adUnitsList}
					defaultPageSize={20}
					minRows={0}
				/>
			</Modal.Body>
		</Modal>
	);
};

export default React.memo(AdUnitsModal);
