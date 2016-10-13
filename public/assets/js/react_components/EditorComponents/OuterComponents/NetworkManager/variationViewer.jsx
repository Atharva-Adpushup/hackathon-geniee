var React = window.React;
    Row = require("../../../BootstrapComponents/Row.jsx"),
    Col = require("../../../BootstrapComponents/Col.jsx"),
    CommonConsts = require("../../../../editor/commonConsts"),

module.exports = React.createClass({
    getInitialState: function () {
        return {};
    },
    getDefaultProps: function () {
        return {};
    },
    render: function () {
        var variations = this.props
        return (
            <div>

                <Row>
                    <Col xs={6}>
                        Name
                    </Col>
                    <Col xs={this.state.err == "duplicateName" ? 3 : 6}>
                        <input type="text" ref="name" placeholder="Name" defaultValue={this.props.variation.name}/>
                    </Col>
                    {this.state.err == "duplicateName" ? (<Col xs={3}>Name Already Exists</Col>) : null}
                </Row>
                <Row>
                    <Col xs={6}>Layout</Col>
                    <Col xs={6}>
                        <SelectBox label="Layout" value={this.state.layout} onChange={this.onLayoutChange}>
                            {layOuts}
                        </SelectBox>
                    </Col>
                </Row><Row>
                <Col xs={6}>
                    Width
                </Col>
                <Col xs={6}>
                    <Combobox onSelect={this.handleSelect.bind(null,"width")} onInput={this.handleInput.bind(null,"width")} value={this.state.width}>
                        {widths}
                    </Combobox>
                </Col>
            </Row>
                <Row>
                    <Col xs={6}>
                        Height
                    </Col>
                    <Col xs={6}>
                        <Combobox onSelect={this.handleSelect.bind(null,"height")} onInput={this.handleInput.bind(null,"height")} value={this.state.height}>
                            {heights}
                        </Combobox>
                    </Col>
                </Row>
                <Row>
                    <Col xs={6}>
                        Ad Code
                    </Col>
                    <Col xs={6}>
                        <textarea ref="code" placeholder="Ad Code" defaultValue={this.props.variation.code ? atob(this.props.variation.code) : ""}/>
                    </Col>
                </Row>
                <Row>
                    <Col xs={6}>
                        Ad Type
                    </Col>
                    <Col xs={6}>
                        <SelectBox label="Ad Type" value={this.state.adType} onChange={this.onAdTypeChange}>
                            {adTypes}
                        </SelectBox>
                    </Col>
                </Row>
                <Row>
                    <Col xs={6}>
                        <input type="button" onClick={this.saveHandler} value="Save" />
                    </Col>
                    <Col xs={6}>
                        <input type="button" onClick={this.backHandler} value="back" />
                    </Col>
                </Row>
            </div>
        );
    }
});