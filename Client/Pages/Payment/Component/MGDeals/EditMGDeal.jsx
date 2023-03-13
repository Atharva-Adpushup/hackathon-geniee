import React, { useEffect, useState, useRef } from "react";
import moment from "moment/moment";
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";
import {
  DropdownButton,
  MenuItem,
} from "@/Client/helpers/react-bootstrap-imports";
import './Deals.css'
import { DateRangePicker } from "react-dates";
import CustomButton from "../../../../Components/CustomButton";
import HELPER_FUNCTIONS from "../../Helper/helper";
import Loader from "../../../../Components/Loader";
import { Row, Col } from "react-bootstrap";
import MGEditForm from "./MGEditForm";
import { MG_DEAL_TYPES } from "../../configs/commonConsts";

const { getQuartersFromDate, findQuarterByValue, getDealEditObject }= HELPER_FUNCTIONS

const EditMGDeal = ({ selectedDeal, onEditSubmit, onEditCancel, onDeleteDeal}) => {
  const [mgType, setMgType] = useState(selectedDeal.mgType);
  const [menuOpen, setMenuOpen] = useState(false);
  const [startDate, setStartDate] = useState(moment(selectedDeal.startDate));
  const [endDate, setEndDate] = useState(moment(selectedDeal.endDate));
  const [selectedQuarters, setSelectedQuarters] = useState([]);
  const [focusedInput, setFocusedInput] = useState(false);
  const [isChange, setIsChange] = useState(false);

  const quarterToValue = useRef({});

  useEffect(() => {
    const selectedQuarters = getQuartersFromDate(startDate, endDate);

    !isChange ? (selectedDeal && selectedDeal.quarterWiseData && selectedDeal.quarterWiseData.map((deal) => {
      const { value: dealValue } = deal;
      const quarter = findQuarterByValue(deal, selectedQuarters);
      quarter
        ? quarterToValue.current[quarter.name] = dealValue
        : '';
    })) : quarterToValue.current = {};
    
    setSelectedQuarters(selectedQuarters);
  }, [startDate, endDate]);

  const handleDateChange = (startDate, endDate) => {
    if (startDate < endDate) {
      setStartDate(startDate);
      setEndDate(endDate);
    }
    setIsChange(true);
  };

  const dropdownToggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleEditSubmit = (e) => {
      e.preventDefault();
      const updatedDeal = getDealEditObject({ quarterToValue: quarterToValue.current, mgType, selectedDeal, startDate, endDate, selectedQuarters });
      onEditSubmit( selectedDeal, updatedDeal );
  };

    const handleDeleteSubmit = (e) => {
        e.preventDefault();
        onDeleteDeal(selectedDeal);
    };
  
    const handleCancelSubmit = (e) => {
        e.preventDefault();
        onEditCancel();
    };
  
  const onChangeHandler = (e, quarter) => {
    e.preventDefault();
    const { value } = e.target;
    quarterToValue.current[quarter.name] = value;
  };

  const onChangeHandle = (e, data) => {
    e.preventDefault();
    const { value } = e.target;
    const quarter = findQuarterByValue(data, selectedQuarters);
    quarter ? quarterToValue.current[quarter.name] = value : '';
  };
  
  return (
    selectedQuarters.length ?
      <>
        <Row className="py-2">
            <Col sm={6}>
                <label>Mg Type</label>
            </Col>
            <Col sm={6} className="dropdown">
                <DropdownButton
                open={menuOpen}
                onToggle={dropdownToggleMenu}
                title={mgType}
                > 
                    {
                      MG_DEAL_TYPES.map((dealType, index) => (
                      <MenuItem key={index} onClick={(e) => { e.preventDefault(); setMgType(dealType) }}>
                        {dealType}
                      </MenuItem>
                      ))
                    }
                </DropdownButton>
            </Col>
        </Row>
        <Row>
            <Col sm={6}>
                <label>Duration</label>
            </Col>
            <Col sm={6} className="react-datepicker-popper">
                <DateRangePicker
                startDate={startDate}
                startDateId="start_date_id"
                endDate={endDate}
                endDateId="end_date_id"
                onDatesChange={({ startDate, endDate }) =>
                  handleDateChange(startDate, endDate)
                }
                focusedInput={focusedInput}
                onFocusChange={(focusedInput) => setFocusedInput(focusedInput)}
                />
            </Col>
        </Row>
        <MGEditForm
          isChange={isChange}
          selectedDeal={selectedDeal}
          onChangeHandle={onChangeHandle}
          onChangeHandler={onChangeHandler}
          selectedQuarters={selectedQuarters}
        ></MGEditForm>
        <Row>
            <Col sm={3}>
                <CustomButton type="submit" variant="primary" onClick={handleEditSubmit}>
                    Edit
                </CustomButton>   
            </Col>
            <Col sm={3}>
            <CustomButton type="submit" variant="primary" onClick={handleDeleteSubmit}>
            Delete
        </CustomButton>
          </Col>
          <Col sm={3}>
          <CustomButton type="submit" variant="primary" onClick={handleCancelSubmit}>
            Cancel
        </CustomButton>
            </Col>
        </Row>
    </>:<Loader/>
  );
};

export default EditMGDeal;
