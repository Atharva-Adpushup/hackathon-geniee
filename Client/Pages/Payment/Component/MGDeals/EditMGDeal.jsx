import React, { useEffect, useState, useRef } from 'react';
import moment from 'moment/moment';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import { DropdownButton, MenuItem } from '@/Client/helpers/react-bootstrap-imports';
import './Deals.css';
import { DateRangePicker } from 'react-dates';
import CustomButton from '../../../../Components/CustomButton';
import HELPER_FUNCTIONS from '../../Helper/helper';
import Loader from '../../../../Components/Loader';
import { Row, Col } from 'react-bootstrap';
import MGEditForm from './MGEditForm';
import {
	MG_DEAL_ALERT_MESSAGES,
	MG_DEAL_ERROR_MESSAGES,
	MG_DEAL_TYPES
} from '../../configs/commonConsts';
import { domanize } from '../../../../helpers/commonFunctions';

const { getMonthsInBetween, findMonthByValue, getDealEditObject } = HELPER_FUNCTIONS;

const { PAGE_RPM, UNIQUE_ECPM, eCPM } = MG_DEAL_TYPES;

const EditMGDeal = ({ selectedDeal, onEditSubmit, onEditCancel, onDeleteDeal, sites }) => {
	const [mgType, setMgType] = useState(selectedDeal.mgType);
	const [site, setSite] = useState('Set Site');
	const [selectedsiteId, setSelectedSiteId] = useState();
	const [menuOpen, setMenuOpen] = useState(false);
	const [siteMenu, setSiteMenu] = useState(false);
	const [startDate, setStartDate] = useState(moment(selectedDeal.startDate));
	const [endDate, setEndDate] = useState(moment(selectedDeal.endDate));
	const [selectedMonths, setSelectedMonths] = useState([]);
	const [focusedInput, setFocusedInput] = useState(false);
	const [isChange, setIsChange] = useState(false);
	const [error, setError] = useState([]);

	const monthToValue = useRef({});
	const [mgInput, setMgInput] = useState({});
	const handleMgInputChange = e => {
		e.persist();
		setMgInput(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
	};

	useEffect(() => {
		const selectedMonths = getMonthsInBetween(startDate, endDate);

		!isChange
			? selectedDeal &&
			  selectedDeal.dealValues &&
			  selectedDeal.dealValues.forEach(deal => {
					const { mgValue: dealValue } = deal;
					const month = findMonthByValue(deal, selectedMonths);
					if (month) {
						monthToValue.current[month] = dealValue;
					}
			  })
			: (monthToValue.current = {});
		setSelectedMonths(selectedMonths);
	}, [startDate, endDate]);

	const handleDateChange = (startDate, endDate) => {
		if (startDate < endDate) {
			setStartDate(startDate);
			setEndDate(endDate);
		}
		setIsChange(true);
	};

	useEffect(() => {
		Object.keys(sites).forEach(siteId => {
			if (siteId == selectedDeal.siteId) {
				setSite(domanize(sites[siteId].domain));
			}
		});
	}, []);

	useEffect(() => {
		const siteList = Object.keys(sites);
		siteList.forEach(siteId => {
			const siteObj = sites[siteId] || {};
			const { domain } = siteObj;
			if (domain && domain.includes(site)) {
				setSelectedSiteId(siteId);
			}
		});
	}, [site]);

	const dropdownToggleMenu = () => {
		setMenuOpen(!menuOpen);
	};
	const siteSelectDropdownToggleMenu = e => {
		setSiteMenu(!siteMenu);
	};

	const handleEditSubmit = e => {
		e.preventDefault();
		if (window.confirm(MG_DEAL_ALERT_MESSAGES.updateAlertMessage)) {
			const errorMonths = [];
			Object.keys(mgInput).forEach(key => {
				if (Number(mgInput[key]) >= 1000) {
					errorMonths.push(key);
				}
				setError(errorMonths);
			});
			if (
				errorMonths.length > 0 &&
				(mgType === PAGE_RPM.displayName || mgType === eCPM.displayName)
			) {
				window.alert(MG_DEAL_ERROR_MESSAGES.invalidAmountError);
				return;
			}
			const updatedDeal = getDealEditObject({
				site,
				mgInput,
				mgType,
				selectedDeal,
				startDate,
				endDate,
				siteId: selectedsiteId
			});
			onEditSubmit(selectedDeal, updatedDeal);
		}
	};

	const handleDeleteSubmit = e => {
		e.preventDefault();
		if (window.confirm(MG_DEAL_ALERT_MESSAGES.deleteAlertMessage)) {
			onDeleteDeal(selectedDeal);
		}
	};

	const handleCancelSubmit = e => {
		e.preventDefault();
		onEditCancel();
	};

	const onChangeHandler = (e, month) => {
		e.preventDefault();
		const { value } = e.target;
		monthToValue.current[month] = value;
	};

	const onChangeHandle = (e, data) => {
		e.preventDefault();
		const { value } = e.target;
		const month = findMonthByValue(data, selectedMonths);
		setMgInput(prevState => ({ ...prevState, [month]: value }));
	};

	const siteToSet = (e, siteDomain) => {
		e.preventDefault();
		setSite(domanize(siteDomain));
	};

	return selectedMonths.length ? (
		<>
			<>
				<Row className="py-2 mb-10">
					<Col sm={6}>
						<label>Mg Type</label>
					</Col>
					<Col sm={6} className="dropdown">
						<DropdownButton open={menuOpen} onToggle={dropdownToggleMenu} title={mgType}>
							{Object.keys(MG_DEAL_TYPES).map((dealType, index) => {
								const dealTypeName = MG_DEAL_TYPES[dealType].displayName;
								return (
									<MenuItem
										key={index}
										onClick={e => {
											e.preventDefault();
											setMgType(dealTypeName);
										}}
										disabled={dealTypeName == UNIQUE_ECPM.displayName ? true : false}
									>
										{dealTypeName}
									</MenuItem>
								)
							})}
						</DropdownButton>
					</Col>
				</Row>
			</>
			<>
				<Row className="py-2 mb-10">
					<Col sm={6}>
						<label>Select Site</label>
					</Col>
					{!menuOpen && (
						<Col sm={6} className="dropdown">
							<DropdownButton open={siteMenu} onToggle={siteSelectDropdownToggleMenu} title={site}>
								{Object.keys(sites).map(siteId => (
									<MenuItem key={siteId} onClick={e => siteToSet(e, sites[siteId].domain)}>
										{domanize(sites[siteId].domain)}
									</MenuItem>
								))}
							</DropdownButton>
						</Col>
					)}
				</Row>
			</>
			<>
				<Row className="mb-10">
					<Col sm={6}>
						<label>Duration</label>
					</Col>
					<Col sm={6} className="react-datepicker-popper">
						<DateRangePicker
							startDate={startDate}
							startDateId="start_date_id"
							endDate={endDate}
							endDateId="end_date_id"
							onDatesChange={({ startDate, endDate }) => handleDateChange(startDate, endDate)}
							focusedInput={focusedInput}
							onFocusChange={focusedInput => setFocusedInput(focusedInput)}
						/>
					</Col>
				</Row>
			</>
			<MGEditForm
				isChange={isChange}
				selectedDeal={selectedDeal}
				onChangeHandle={onChangeHandle}
				onChangeHandler={onChangeHandler}
				mgInput={mgInput}
				handleMgInputChange={handleMgInputChange}
				selectedMonths={selectedMonths}
			/>
			<Row>
				<Col sm={3}>
					<CustomButton type="submit" variant="primary" onClick={handleEditSubmit}>
						Save
					</CustomButton>
				</Col>
				<Col sm={3}>
					<CustomButton type="submit" variant="primary" onClick={handleDeleteSubmit}>
						Delete
					</CustomButton>
				</Col>
				<Col sm={3}>
					<CustomButton type="submit" variant="primary" onClick={handleCancelSubmit}>
						Close
					</CustomButton>
				</Col>
			</Row>
		</>
	) : (
		<Loader />
	);
};

export default EditMGDeal;
