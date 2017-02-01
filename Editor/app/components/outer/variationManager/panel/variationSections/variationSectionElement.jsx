import React, { Component } from 'react';
import { Row, Col, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import InlineEdit from 'shared/inlineEdit/index.jsx';

const errorBorder = {
    border: '1px solid #eb575c'
}

class variationSingleSection extends Component {
    constructor(props) {
        super(props);
    }
    componentWillMount() {
        this.props.onSectionXPathValidate(this.props.section.id, this.props.section.xpath);
    }
    render() {
        return (
            <li className="section-list-item" key={this.props.section.id} style={this.props.section.error ? errorBorder : { ...errorBorder, border: '1px solid #d9d9d9' }}>
                <OverlayTrigger placement="bottom" overlay={<Tooltip id="delete-section-tooltip">Delete Section</Tooltip>}>
                    {/*`section.ads[0].id` is temporarily added as 3rd argument to accomodate
                        * one section and one ad creation/deletion
                        * TODO: Remove `section.ads[0].id` hard-coded check and remove all ads inside
                        * a section using its `ads` array
                    */}
                    <Button className="btn-close" onClick={this.props.onDeleteSection.bind(null, this.props.section.id, this.props.variation.id, this.props.section.ads[0].id)} type="submit">x</Button>
                </OverlayTrigger>
                <Row>
                    {this.props.section.isIncontent ? (
                        <label className="section-label section-incontent">
                            <i className="fa fa-object-group" /><span>In-Content</span>
                        </label>
                    ) : <label className="section-label section-structural">
                            <i className="fa fa-object-ungroup" /><span>Structural {this.props.section.error}</span>
                        </label>
                    }
                    <Col className="u-padding-r10px section-name-ie" xs={12}>
                        <InlineEdit value={this.props.section.name}
                            submitHandler={this.props.onRenameSection.bind(null, this.props.section, this.props.variation.id)} text="Section Name" errorMessage="Section Name cannot be blank"
                            />
                    </Col>
                    <Col className="u-padding-r10px" xs={12}>
                        <Row>
                            <Col className="u-padding-r10px" xs={4}>Size</Col>
                            <Col xs={8}><strong>{this.props.section.ads[0].width} x {this.props.section.ads[0].height}</strong></Col>
                        </Row>
                    </Col>
                </Row>
                {this.props.section.isIncontent ? (
                    <div>
                        <Row>
                            <Col className="u-padding-r10px" xs={4}>Ad Code</Col>
                            <Col className="u-padding-l10px" xs={8}>
                                <InlineEdit compact adCode value={this.props.section.ads[0].adCode}
                                    submitHandler={this.props.onUpdateAdCode.bind(null, this.props.section.ads[0].id)} text="Ad Code" errorMessage="Ad Code cannot be blank"
                                    />
                            </Col>
                        </Row>
                        <Row>
                            <Col className="u-padding-r10px" xs={4}>Section No.</Col>
                            <Col className="u-padding-l10px" xs={8}><strong>{this.props.section.sectionNo}</strong></Col>
                        </Row>
                        <Row>
                            <Col className="u-padding-r10px" xs={4}>Float</Col>
                            <Col className="u-padding-l10px" xs={8}><strong>{this.props.section.float}</strong></Col>
                        </Row>
                    </div>
                ) : (<div>
                    <Row>
                        <Col className="u-padding-r10px" xs={4}>Operation</Col>
                        <Col className="u-padding-l10px" xs={8}><strong>{this.props.section.operation}</strong></Col>
                    </Row>
                    <Row>
                        <Col className="u-padding-r10px" xs={4}>XPath</Col>
                        <Col className="u-padding-l10px" xs={8}>
                            <InlineEdit
                                compact 
                                cancelEditHandler={this.props.onResetErrors.bind(null, this.props.section.id)} 
                                customError={this.props.ui.errors.xpath ? this.props.ui.errors.xpath.error : false} 
                                dropdownList={this.props.section.allXpaths} 
                                value={this.props.section.xpath}
                                keyUpHandler={this.props.onValidateXPath.bind(null, this.props.section.id)}
                                submitHandler={this.props.onUpdateXPath.bind(null, this.props.section.id)} 
                                editClickHandler={this.props.onSectionAllXPaths.bind(null, this.props.section.id, this.props.section.xpath)} 
                                text="XPath" 
                                errorMessage={(this.props.ui.errors.xpath && this.props.ui.errors.xpath.error) ? this.props.ui.errors.xpath.message : 'XPath cannot be blank'}
                                />
                            { /*
                                <span className="error-message">{this.props.section.error ? 'XPath invalid' : ''}</span>
                            */ }
                        </Col>
                    </Row>
                </div>
                    )
                }
            </li>
        );
    }
}

export default variationSingleSection;