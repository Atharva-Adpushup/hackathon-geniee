import React, { Component } from "react";
import PropTypes from "prop-types";
import SelectBox from "../../../Components/SelectBox/index.jsx";
import CustomToggleSwitch from "../../../Components/CustomToggleSwitch.jsx";
import { Row, Col } from "react-bootstrap";
import commonConsts from "../lib/commonConsts";
import "react-dates/initialize";
import { DateRangePicker, isInclusivelyBeforeDay } from "react-dates";
import "react-dates/lib/css/_datepicker.css";
import moment from "moment";

let groupByArray = commonConsts.GROUP_BY;

class ReportControls extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pageGroup: null,
      platform: null,
      variation: props.variation ? props.variation : null,
      startDate: props.startDate,
      endDate: props.endDate,
      groupBy: null,
      tagManager: false,
      groupByArray
    };
    this.pageGroupUpdated = this.pageGroupUpdated.bind(this);
    this.platformUpdated = this.platformUpdated.bind(this);
    this.datesUpdated = this.datesUpdated.bind(this);
    this.focusUpdated = this.focusUpdated.bind(this);
    this.variationUpdated = this.variationUpdated.bind(this);
    this.getPageGroupName = this.getPageGroupName.bind(this);
    this.getPlatformName = this.getPlatformName.bind(this);
    this.groupByUpdated = this.groupByUpdated.bind(this);
    this.tagManagerToggle = this.tagManagerToggle.bind(this);
  }

  getPageGroupName(pageGroup) {
    return pageGroup !== null ? commonConsts.PAGEGROUPS[pageGroup] : null;
  }

  getPlatformName(platform) {
    return platform !== null ? commonConsts.PLATFORMS[platform] : null;
  }

  pageGroupUpdated(pageGroup) {
    const {
      platform,
      startDate,
      endDate,
      variation,
      groupBy,
      tagManager
    } = this.state;
    let groupByParam = groupBy;

    if (pageGroup !== null && platform !== null) {
      groupByParam = null;
      this.setState({ groupByArray: ["variation"], groupBy: groupByParam });
    } else {
      groupByParam = null;
      this.setState({
        groupByArray: commonConsts.GROUP_BY,
        groupBy: groupByParam
      });
    }

    this.setState({ pageGroup });
    this.props.reportParamsUpdateHandler({
      pageGroup: this.getPageGroupName(pageGroup),
      platform: this.getPlatformName(platform),
      startDate,
      endDate,
      variation: null,
      groupBy: groupByParam,
      tagManager
    });
  }

  platformUpdated(platform) {
    const {
      pageGroup,
      startDate,
      endDate,
      variation,
      groupBy,
      tagManager
    } = this.state;
    let groupByParam = groupBy;
    if (tagManager) {
      if (platform !== null) {
        groupByParam = null;
        this.setState({ groupByArray: [], groupBy: groupByParam });
      } else {
        groupByParam = null;
        this.setState({ groupByArray: ["device_type"], groupBy: groupByParam });
      }
    } else {
      if (pageGroup !== null && platform !== null) {
        groupByParam = null;
        this.setState({ groupByArray: ["variation"], groupBy: groupByParam });
      } else {
        groupByParam = null;
        this.setState({
          groupByArray: commonConsts.GROUP_BY,
          groupBy: groupByParam
        });
      }
    }

    this.setState({ platform });
    this.props.reportParamsUpdateHandler({
      platform: this.getPlatformName(platform),
      pageGroup: this.getPageGroupName(pageGroup),
      startDate,
      endDate,
      variation: null,
      groupBy: groupByParam,
      tagManager
    });
  }

  variationUpdated(variation) {
    const {
      platform,
      pageGroup,
      startDate,
      endDate,
      groupBy,
      tagManager
    } = this.state;

    this.setState({ variation });
    this.props.reportParamsUpdateHandler({
      variation: variation,
      platform: this.getPlatformName(platform),
      pageGroup: this.getPageGroupName(pageGroup),
      startDate,
      endDate,
      groupBy,
      tagManager
    });
  }

  datesUpdated({ startDate, endDate }) {
    const { pageGroup, platform, variation, groupBy, tagManager } = this.state;

    this.setState({ startDate, endDate });
    this.props.reportParamsUpdateHandler({
      startDate,
      endDate,
      variation,
      groupBy,
      pageGroup: this.getPageGroupName(pageGroup),
      platform: this.getPlatformName(platform),
      tagManager
    });
  }

  groupByUpdated(groupBy) {
    const {
      pageGroup,
      platform,
      variation,
      startDate,
      endDate,
      tagManager
    } = this.state;

    this.setState({ groupBy: groupBy });
    this.props.reportParamsUpdateHandler({
      startDate,
      endDate,
      variation,
      groupBy,
      pageGroup: this.getPageGroupName(pageGroup),
      platform: this.getPlatformName(platform),
      tagManager
    });
  }

  focusUpdated(focusedInput) {
    this.setState({ focusedInput });
  }

  tagManagerToggle(tagManager) {
    const { platform, startDate, endDate, groupBy, pageGroup } = this.state;
    let groupByParam = groupBy;
    if (tagManager) {
      if (platform !== null) {
        groupByParam = null;
        this.setState({ groupByArray: [], groupBy: groupByParam });
      } else {
        groupByParam = null;
        this.setState({ groupByArray: ["device_type"], groupBy: groupByParam });
      }
    } else {
      if (pageGroup !== null && platform !== null) {
        groupByParam = null;
        this.setState({ groupByArray: ["variation"], groupBy: groupByParam });
      } else {
        groupByParam = null;
        this.setState({
          groupByArray: commonConsts.GROUP_BY,
          groupBy: groupByParam
        });
      }
    }
    this.setState({ tagManager, pageGroup: null, variation: null });
    this.props.reportParamsUpdateHandler({
      startDate,
      endDate,
      tagManager,
      groupBy,
      platform: this.getPlatformName(platform)
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ ...nextProps });
  }

  render() {
    const { state, props } = this,
      {
        PLATFORMS,
        PAGEGROUPS,
        REPORT_DOWNLOAD_ENDPOINT,
        IS_MANUAL
      } = commonConsts,
      downloadLink = `${REPORT_DOWNLOAD_ENDPOINT}?data=${props.csvData}`;

    return (
      <div className='report-controls-wrapper'>
        <div className='container-fluid'>
          <Row className={!IS_MANUAL ? "hidden" : ""}>
            <Col sm={2}>
              <CustomToggleSwitch
                labelText='AP Tag'
                className='mB-0'
                defaultLayout
                checked={this.state.tagManager}
                onChange={this.tagManagerToggle}
                name='tagManager'
                layout='vertical'
                size='m'
                id='js-force-sample-url'
                on='On'
                off='Off'
              />
            </Col>
          </Row>
          <Row className='mT-10'>
            <Col sm={2}>
              <label className='control-label'>PageGroup</label>
              <SelectBox
                value={state.pageGroup}
                label='Select PageGroup'
                onChange={this.pageGroupUpdated}
                disabled={this.state.tagManager}
              >
                {PAGEGROUPS.map((pageGroup, index) => (
                  <option key={index} value={index}>
                    {pageGroup}
                  </option>
                ))}
              </SelectBox>
            </Col>
            <Col sm={2}>
              <label className='control-label'>Platform</label>
              <SelectBox
                value={state.platform}
                label='Select Platform'
                onChange={this.platformUpdated}
              >
                {PLATFORMS.map((platform, index) => (
                  <option key={index} value={index}>
                    {platform}
                  </option>
                ))}
              </SelectBox>
            </Col>
            <Col sm={2}>
              <label className='control-label'>Variation</label>
              <SelectBox
                value={state.variation}
                label='Select Variation'
                onChange={this.variationUpdated}
                disabled={
                  !props.variations ||
                  !props.variations.length ||
                  this.state.tagManager
                }
              >
                {props.variations.map((variation, index) => (
                  <option key={index} value={variation.id}>
                    {variation.name}
                  </option>
                ))}
              </SelectBox>
            </Col>
            <Col sm={2}>
              <label className='control-label'>Group By</label>
              <SelectBox
                value={state.groupBy}
                label='Group By'
                onChange={this.groupByUpdated}
              >
                {state.groupByArray.map((groupBy, index) => (
                  <option key={index} value={groupBy}>
                    {groupBy === commonConsts.DEVICE_TYPE
                      ? commonConsts.DATA_LABELS.platform
                      : groupBy}
                  </option>
                ))}
              </SelectBox>
            </Col>
            <Col sm={3}>
              <label className='control-label'>Date Range</label>
              <DateRangePicker
                onDatesChange={this.datesUpdated}
                onFocusChange={this.focusUpdated}
                focusedInput={state.focusedInput}
                startDate={state.startDate}
                endDate={state.endDate}
                showDefaultInputIcon={true}
                hideKeyboardShortcutsPanel={true}
                showClearDates={true}
                minimumNights={0}
                displayFormat={"DD-MM-YYYY"}
                isOutsideRange={day =>
                  !isInclusivelyBeforeDay(
                    day,
                    moment()
                      .startOf("month")
                      .set({ year: 2019, month: 10 })
                  )
                }
              />
            </Col>
          </Row>
          <Row className='mT-10'>
            <Col sm={3} smOffset={6}>
              <a
                href={downloadLink}
                style={{
                  display: "block",
                  height: 33,
                  paddingTop: 8
                }}
                className='btn btn-lightBg btn-default btn-blue-line'
              >
                <i className='fa fa-download mR-5' />
                Download Report
              </a>
            </Col>
            <Col sm={3}>
              <button
                className='btn btn-lightBg btn-default btn-blue'
                onClick={props.generateButtonHandler}
                disabled={props.disableGenerateButton}
              >
                <i className='fa fa-cog mR-5' />
                Generate Report
              </button>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

ReportControls.propTypes = {
  startDate: PropTypes.object.isRequired,
  endDate: PropTypes.object.isRequired,
  disableGenerateButton: PropTypes.bool.isRequired,
  generateButtonHandler: PropTypes.func.isRequired,
  reportParamsUpdateHandler: PropTypes.func.isRequired,
  variations: PropTypes.array.isRequired,
  emptyData: PropTypes.bool.isRequired,
  csvData: PropTypes.string.isRequired
};

export default ReportControls;
