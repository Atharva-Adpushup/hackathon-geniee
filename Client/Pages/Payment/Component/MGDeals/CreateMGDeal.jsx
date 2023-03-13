import React, { useEffect, useState, useRef } from "react";
import './Deals.css';
import {
  DropdownButton,
    MenuItem,
} from "@/Client/helpers/react-bootstrap-imports";
import { Row, Col } from "react-bootstrap";
import "react-dates/initialize";
import "react-dates/lib/css/_datepicker.css";
import { DateRangePicker } from "react-dates";
import CustomButton from "../../../../Components/CustomButton";
import FormInput from "../../../../Components/FormInput";
import HELPER_FUNCTIONS from "../../Helper/helper";
import { MG_DEAL_TYPES } from "../../configs/commonConsts";

const { getQuartersFromDate, createDealObject } = HELPER_FUNCTIONS

const CreateMGDeal = ({allDeals, onSubmitCreate, onCancelSubmit}) => {
    const [mgType, setMgType] = useState("Set MG Type");
    const [menuOpen, setMenuOpen] = useState(false);
    const [startDate, setStartDate] = useState(false);
    const [endDate, setEndDate] = useState(false);
    const [selectedQuarters, setSelectedQuarters] = useState([]);
    const [focusedInput, setFocusedState] = useState(false);
    const quarterToValue = useRef({});

    useEffect(() => {
        const quarters = getQuartersFromDate(startDate, endDate);
        setSelectedQuarters(quarters);
    }, [startDate, endDate]);
    
    const dropdownToggleMenu = (e) => {
        setMenuOpen(!menuOpen);
    };
    const handleDateChange = (startDate, endDate) => {
        setStartDate(startDate);
        setEndDate(endDate);
    };
    
    const handleSaveSubmit = (e) => {
        e.preventDefault();
        const newDeal = createDealObject({ quarterToValue: quarterToValue.current, mgType, allDeals, startDate, endDate, selectedQuarters });
        onSubmitCreate(newDeal);
    };
    const handleCancelSubmit = (e) => {
        e.preventDefault();
        onCancelSubmit();
    };
    const onChangeHandler = (e,quarter) => {
        e.preventDefault();
        const { value } = e.target;
        quarterToValue.current[quarter.name] = value;
    }
    
  return (
      <>
        <Row>
            <Col sm={6}>
                      <label>Mg Type</label>
            </Col>
            <Col sm={6} className="dropdown">
                <DropdownButton
                    open={menuOpen}
                    onToggle={(e)=>dropdownToggleMenu(e)}
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
                    onFocusChange={(focusedInput) => setFocusedState(focusedInput)}
                    isOutsideRange={() => false}
                    
                />
            </Col>
          </Row>
          {selectedQuarters.map((quarter) => (
              <Row className="form-inline">
                  <Col sm={6}>
                        <label>{quarter.name}</label>
                  </Col>
                  <Col sm={6}>
                        <FormInput
                            icon="dollar-sign"
                            type="number"
                            className="w-25"
                            min="0"
                            onChange={(e) => onChangeHandler(e,quarter)}
                        />
                    </Col>
                </Row>
          ))}
          <Row>
              <Col sm={6}>
                    <CustomButton type="submit" variant="primary"  onClick={handleSaveSubmit}>
                        Save
                    </CustomButton>
              </Col>
              <Col sm={6}>
                    <CustomButton type="submit" variant="primary"  onClick={handleCancelSubmit}>
                        Cancel
                    </CustomButton>
              </Col>
              </Row>
    </>
  );
};

export default CreateMGDeal;