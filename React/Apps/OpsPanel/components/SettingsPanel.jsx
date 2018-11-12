import React from 'react';
import { Row, Col } from 'react-bootstrap';

import Select from 'react-select';

const options = [
  {
    value: "300 250",
    label: "300x250",
  },
  {
    value: "250 250",
    label: "250x250",
  },{
    value: "200 200",
    label: "200x200",
  },{
    value: "336 280",
    label: "336x280",
  },{
    value: "728 90",
    label: "728x90",
  },{
    value: "468 60",
    label: "468x60",
  },{
    value: "300 600",
    label: "300x600",
  },{
    value: "160 600",
    label: "160x600",
  },{
    value: "120 600",
    label: "120x600",
  },{
    value: "320 50",
    label: "320x50",
  },{
    value: "320 100",
    label: "320x100",
  },{
    value: "900 90",
    label: "900x90",
  },{
    value: "970 250",
    label: "970x250",
  },{
    value: "300 1050",
    label: "300x1050",
  },
];

function findSupportedSizes(name, data) {
  for(let i = 0; i < data.length; i++) {
    if(name === data[i].mediaQuery){
      return data[i].supportedSizes;
    }
  }
  return [];
}

export default class SettingsPanel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      device: '(min-width: 1200px)',
      supportedSizes: [],
    }

    this.onValChange = this.onValChange.bind(this);
    this.validationCheckWrapper = this.validationCheckWrapper.bind(this);
    this.onNewSelect = this.onNewSelect.bind(this);

  }

  validationCheckWrapper() {

    const { device, supportedSizes } = this.state;
    let label;

    switch(this.state.device) {
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

    const config = {
      mediaQuery: device,
      supportedSizes: supportedSizes.map(size => size.label.split('x')),
      labels: [label]
    }

    this.props.validationCheck(JSON.stringify(config), "deviceConfig");

  }

  onValChange(e) {

    const { fetchedData } = this.props;

    this.setState({
      [e.target.name]: e.target.value,
      supportedSizes: fetchedData.length > 0 ? findSupportedSizes(e.target.value, fetchedData).map(arr => ({
        value: arr.join(" "),
        label: arr.join("x"),
      })) : [],
    });

  }

  onNewSelect(supportedSizes) {
    this.setState({ supportedSizes });
  }

  componentWillReceiveProps(nextProps) {

    const { fetchedData } = nextProps;

    this.setState({
      device: fetchedData.length > 0 ? fetchedData[0].mediaQuery : "(min-width: 1200px)",
      supportedSizes: fetchedData.length > 0 ? fetchedData[0].supportedSizes.map(arr => ({
        value: arr.join(" "),
        label: arr.join("x"),
      })) : [],
    });

  }

  render() {

    const { device, supportedSizes } = this.state;

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
            name="supportedSizes"
            onChange={this.onNewSelect}
            options={options}
            isMulti={true}
            value={supportedSizes}
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
