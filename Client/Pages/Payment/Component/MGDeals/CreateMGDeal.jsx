import React, { useEffect, useState, useRef } from 'react';
import './Deals.css';
import { DropdownButton, MenuItem } from '@/Client/helpers/react-bootstrap-imports';
import { Row, Col } from 'react-bootstrap';
import 'react-dates/initialize';
import 'react-dates/lib/css/_datepicker.css';
import { DateRangePicker } from 'react-dates';
import CustomButton from '../../../../Components/CustomButton';
import FormInput from '../../../../Components/FormInput';
import HELPER_FUNCTIONS from '../../Helper/helper';
import {
	MG_DEAL_DROPDOWN_HEADING,
	MG_DEAL_ERROR_MESSAGES,
	MG_DEAL_TYPES,
	MG_DEAL_ALERT_MESSAGES
} from '../../configs/commonConsts';
import { domanize } from '../../../../helpers/commonFunctions';

const { PAGE_RPM, UNIQUE_ECPM, eCPM } = MG_DEAL_TYPES;

const { getMonthsInBetween, createDealObject } = HELPER_FUNCTIONS;

const CreateMGDeal = ({ allDeals, onSubmitCreate, onCancelSubmit, sites }) => {
	const [mgType, setMgType] = useState('Set MG Type');
	const [site, setSite] = useState('Set Site');
	const [selectedSiteId, setSelectedSiteId] = useState();
	const [menuOpen, setMenuOpen] = useState(false);
	const [siteMenu, setSiteMenu] = useState(false);
	const [startDate, setStartDate] = useState(false);
	const [endDate, setEndDate] = useState(false);
	const [selectedMonths, setSelectedMonths] = useState([]);
	const [focusedInput, setFocusedState] = useState(false);
	const [disableSiteAndDateInput, setDisableSiteAndDateInput] = useState(true);
	const [error, setError] = useState([]);
	const [displayDateError, setDisplayDateError] = useState(false);
	const monthsToValue = useRef({});

	useEffect(() => {
		if (mgType !== MG_DEAL_DROPDOWN_HEADING) {
			setDisableSiteAndDateInput(false);
		}
	}, [mgType]);

	useEffect(() => {
		const months = getMonthsInBetween(startDate, endDate);
		setSelectedMonths(months);
	}, [startDate, endDate]);

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

	const mgValueValidationError = month =>
		error.length > 0 &&
		error.includes(month) &&
		(mgType === PAGE_RPM.displayName || mgType === eCPM.displayName);

	const mgDealDateValidationError = (startDate, endDate) => {
		if (startDate === false || endDate === false) {
			setDisplayDateError(true);
			return true;
		}
		setDisplayDateError(false);
		return false;
	};

	const dropdownToggleMenu = e => {
		setMenuOpen(!menuOpen);
	};
	const siteSelectDropdownToggleMenu = e => {
		setSiteMenu(!siteMenu);
	};
	const handleDateChange = (startDate, endDate) => {
		setStartDate(startDate);
		setEndDate(endDate);
		mgDealDateValidationError(startDate, endDate);
	};

	const handleSaveSubmit = e => {
		e.preventDefault();
		const errorMonths = [];
		const currentMonthValue = monthsToValue.current;
		const monthsName = Object.keys(currentMonthValue);
		monthsName.forEach(month => {
			const value = currentMonthValue[month];
			if (Number(value) >= 1000) {
				errorMonths.push(month);
			}
			setError(errorMonths);
		});
		if (
			(errorMonths.length > 0 && (mgType == PAGE_RPM.displayName || mgType == eCPM.displayName)) ||
			mgDealDateValidationError(startDate, endDate)
		) {
			return;
		}
		const newDeal = createDealObject({
			site,
			monthToValue: monthsToValue.current,
			mgType,
			allDeals,
			startDate,
			endDate,
			siteId: selectedSiteId
		});
		if (window.confirm(MG_DEAL_ALERT_MESSAGES.createAlertMessage)) {
			onSubmitCreate(newDeal);
		}
	};
	const handleCancelSubmit = e => {
		e.preventDefault();
		onCancelSubmit();
	};
	const onChangeHandler = (e, month) => {
		e.preventDefault();
		const { value } = e.target;
		monthsToValue.current[month] = value;
	};

	const siteToSet = (e, siteDomain) => {
		e.preventDefault();
		setSite(domanize(siteDomain));
	};

	return (
		<>
			<Row className="mb-10">
				<Col sm={6}>
					<label>Mg Type</label>
				</Col>
				<Col sm={6} className="dropdown">
					<DropdownButton open={menuOpen} onToggle={e => dropdownToggleMenu(e)} title={mgType}>
						{Object.keys(MG_DEAL_TYPES).map((dealType, index) =>{
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
			<Row className="mb-10">
				<Col sm={6} className="dropdown">
					<label>Select Site</label>
				</Col>
				{!menuOpen && (
					<Col sm={6} className="dropdown">
						<DropdownButton
							open={siteMenu}
							onToggle={e => siteSelectDropdownToggleMenu(e)}
							title={site}
							disabled={disableSiteAndDateInput}
						>
							{Object.keys(sites).map(siteId => (
								<MenuItem key={siteId} onClick={e => siteToSet(e, sites[siteId].domain)}>
									{domanize(sites[siteId].domain)}
								</MenuItem>
							))}
						</DropdownButton>
					</Col>
				)}
			</Row>
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
							onFocusChange={focusedInput => setFocusedState(focusedInput)}
							isOutsideRange={() => false}
							disabled={disableSiteAndDateInput}
						/>
						{displayDateError && <span className="error-red">Please select a valid date</span>}
					</Col>
				</Row>
			</>
			{selectedMonths.map(month => (
				<>
					<Row className="form-inline mb-10">
						<Col sm={6}>
							<label>{month}</label>
						</Col>
						<Col sm={6}>
							<FormInput
								icon="dollar-sign"
								type="number"
								className="w-25"
								min="0"
								onChange={e => onChangeHandler(e, month)}
							/>
							{mgValueValidationError(month) && (
								<span className="error-red">{MG_DEAL_ERROR_MESSAGES.invalidAmountError}</span>
							)}
						</Col>
					</Row>
				</>
			))}
			<Row>
				<Col sm={6}>
					<CustomButton type="submit" variant="primary" onClick={handleSaveSubmit}>
						Save
					</CustomButton>
				</Col>
				<Col sm={6}>
					<CustomButton type="submit" variant="primary" onClick={handleCancelSubmit}>
						Cancel
					</CustomButton>
				</Col>
			</Row>
		</>
	);
};

export default CreateMGDeal;
