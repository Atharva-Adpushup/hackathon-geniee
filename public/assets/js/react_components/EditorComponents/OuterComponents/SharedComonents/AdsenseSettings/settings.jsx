var React = window.React,
    utils = require("../../../../../libs/custom/utils"),
    Input = require("../../../../BootstrapComponents/Input.jsx"),
    Row = require("../../../../BootstrapComponents/Row.jsx"),
    Button = require("../../../../BootstrapComponents/Button.jsx"),
    Col = require("../../../../BootstrapComponents/Col.jsx");
    SelectBox = require("../../../../CustomComponents/Select/select");

module.exports = React.createClass({
    mixins: [React.addons.LinkedStateMixin, FluxMixin],


    getDefaultProps: function () {
        return {};
    },
    getInitialState: function () {
        return {
            noOfAds: this.props.noOfAds || 3,
            editAds: false
        }
    },

    openOauthWindow: function () {
        var x = screen.width / 2 - 700 / 2;
        var y = screen.height / 2 - 450 / 2;

        window.open("/user/requestOauth", 'Oauth Request', 'height=485,width=700,left=' + x + ',top=' + y);
    },
    toggleEditAds: function(){
        this.setState({editAds:!this.state.editAds});
    },
    save: function () {
        this.props.onSave({
            noOfAds:this.state.noOfAds,
            pubId:this.props.pubId,
            email:this.props.email
        });
        this.toggleEditAds();
    },
    renderInfo: function (editAds) {

        return (<div className="containerButtonBar">
            <Row>
                <Col xs={3} className="boldTxt pdR-3">Pub Id</Col>
                < Col xs={9} className="pdL-6">{this.props.pubId}</Col>
            </Row>
            <Row>
                <Col xs={3} className="boldTxt pdR-3">Email</Col>
                <Col xs={9} className="pdL-6">{this.props.email}</Col>
            </Row>
            <Row>
                <Col xs={3} className="boldTxt pdR-3">No Of Ads</Col>
                {editAds ?
                    <Col xs={9} className="mB-0 pdL-6"> <Input required={true} placeholder="No Of Ads" type="text" className="mB-0" valueLink={this.linkState('noOfAds')} ref="noOfAds"/> </Col>
                    :
                    <Col xs={9} className="mB-0 pdL-6">{this.props.noOfAds}</Col>
                }

            </Row>

            <Row className="butttonsRow">
                <Col xs={12}>
                    {editAds ?
                        <Button className="btn-lightBg btn-save btn-block" onClick={this.save}>Save</Button>
                        :
                        <Button className="btn-lightBg btn-edit btn-block" onClick={this.toggleEditAds}>Edit Ads To Display</Button>
                    }

                </Col>
            </Row>
        </div>);
    },
    changeAccount: function( account_no )
    {
        var account = this.props.accounts[ account_no ];
        this.getFlux().actions.saveAdsenseSettings({
            pubId: account.pubId,
            email: account.email,
            noOfAds: 3
        });

        this.setState({ account: account_no });
    },
    render: function () {
        var isStatechanged = utils.deepDiffMapper.test(this.state, this.getInitialState()).isChanged;
        return (
            <div>
                {this.state.editAds && this.props.pubId ? this.renderInfo(true) : null}
                {!this.state.editAds  && this.props.pubId ? this.renderInfo() : null}
                { ! this.props.pubId ? <div className="installBtnBg"><Row ><Col xs={12}><Button className="btn-lightBg btn-block" onClick={this.openOauthWindow}>Connect Google AdSense</Button></Col></Row></div> : null }
            </div>);
    }
})