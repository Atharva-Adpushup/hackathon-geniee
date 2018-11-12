import React from 'react';
import { Row, Col } from 'react-bootstrap';
import Select from 'react-select';

import { sizeConfigOptions as options } from '../configs/commonConsts';

function findSizesSupported(name, data) {
  for(let i = 0; i < data.length; i++) {
    if(name === data[i].mediaQuery){
      return data[i].sizesSupported;
    }
  }
  return [];
}

export default class SettingsPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      device: '(min-width: 1200px)',
      sizesSupported: [],
    }

    this.onValChange = this.onValChange.bind(this);
    this.validationCheckWrapper = this.validationCheckWrapper.bind(this);
    this.onNewSelect = this.onNewSelect.bind(this);

  }

  validationCheckWrapper() {

    const { device, sizesSupported } = this.state;
    let label;

    switch(device) {
      case "(min-width: 1200px)":
        label = "display";
        break;
      case "(min-width: 768px) and (max-width: 1199px)":
        label = "tablet";
        break;
      case "(min-width: 0px) and (max-width: 767px)":
        label = "phone";
        break;
    }

    this.props.validationCheck(JSON.stringify({
      mediaQuery: device,
      sizesSupported: sizesSupported.map(size => size.label.split('x').map(str => +str)),
      labels: [label]
    }), "deviceConfig");

  }

  onValChange(e) {

    const { fetchedData } = this.props;

    this.setState({
      [e.target.name]: e.target.value,
      sizesSupported: fetchedData.length > 0 ? findSizesSupported(e.target.value, fetchedData).map(arr => ({
        value: arr.join(" "),
        label: arr.join("x"),
      })) : [],
    });

  }

  onNewSelect(sizesSupported) {
    this.setState({ sizesSupported });
  }

  componentWillReceiveProps(nextProps) {

    const { fetchedData } = nextProps;

    this.setState({
      device: fetchedData.length > 0 ? fetchedData[0].mediaQuery : "(min-width: 1200px)",
      sizesSupported: fetchedData.length > 0 ? fetchedData[0].sizesSupported.map(arr => ({
        value: arr.join(" "),
        label: arr.join("x"),
      })) : [],
    });

  }

  render() {

    const { device, sizesSupported } = this.state;

    return (
      <div>
        <Row>
          <select name="device" value={device} onChange={this.onValChange} >
            <option value={"(min-width: 1200px)"} >PC</option>
            <option value={"(min-width: 768px) and (max-width: 1199px)"} >Tablet</option>
            <option value={"(min-width: 0px) and (max-width: 767px)"} >Phone</option>
          </select>
        </Row>
        <Row>
          <Select
            name="sizesSupported"
            onChange={this.onNewSelect}
            options={options}
            isMulti={true}
            value={sizesSupported}
          />
        </Row>
        <Row>
          <Col sm={4}>
         <button className="btn btn-lightBg btn-default" onClick={this.validationCheckWrapper}>
          Validate Device config
         </button>
          </Col>
        </Row>
      </div>
    );

  }

}
