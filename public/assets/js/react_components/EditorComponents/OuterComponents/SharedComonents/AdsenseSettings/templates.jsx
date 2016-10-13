var React = window.React,
    _ = require("../../../../../libs/third-party/underscore"),
    CommonConsts = require("../../../../../editor/commonConsts"),
    utils = require("../../../../../libs/custom/utils"),
    AM = CommonConsts.enums.actionManager,
    Row = require("../../../../BootstrapComponents/Row.jsx"),
    Button = require("../../../../BootstrapComponents/Button.jsx"),
    OverlayTrigger = require("../../../../BootstrapComponents/OverlayTrigger.jsx"),
    Popover = require("../../../../BootstrapComponents/Popover.jsx"),
    Col = require("../../../../BootstrapComponents/Col.jsx"),
    EnableDisableSwitch = require("../../../../CustomComponents/EnableDisableSwitch.jsx"),
    ColorSwatch = require("../../colorSwatch.jsx"),
    AdPreview = require("./adpreview.jsx"),
    TplCreater = require("./tplCreater.jsx"),
    // Template name prefix used to create unique name
    TplNamePrefix = window.ADP_SITE_ID;


module.exports = React.createClass({
    mixins: [],
    getDefaultProps: function () {
        return {};
    },
    getInitialState: function () {
        var tpls = _(this.props.action.value).map(function (props) {
                return {status:props.status,tpl:props.data}
            })

        return {
            showTplAdder: false,
            tpls : tpls,
            errorMsg:""
        };
    },
    toggleTplAdder: function () {
        this.setState({showTplAdder: !this.state.showTplAdder,errorMsg:""});
    },
    componentDidUpdate:function(){
      this.props.onUpdate();
    },
    onTplStatusChange: function(tpl,status){
        var state = _(this.state.tpls).findWhere({tpl:tpl})
        state.status = (status == true) ? AM.status.APPEND : AM.status.DISABLED;
        this.setState({tpls:this.state.tpls});
    },
    isChecked: function(tpl){
        var state = _(this.state.tpls).findWhere({tpl:tpl})
        return (AM.status.APPEND == state.status)
    },
    onSaveSettings: function(){
        this.props.onSaveStatus(this.state.tpls);
    },
    onCancelSettings: function(){
        this.setState({tpls: this.getInitialState().tpls});
    },
    onSave:function(tpl){
        var temp = tpl.name.split("_"),
        nameWithoutSiteId =  (parseInt(temp[0].trim()) == ADP_SITE_ID) ? (temp.splice(0,1) && temp.join("_")) : tpl.name;
        if(this.props.flux.store(CommonConsts.enums.stores.TPL_STORE).getAdsenseTplByName(tpl.name) || this.props.flux.store(CommonConsts.enums.stores.TPL_STORE).getAdsenseTplByName(nameWithoutSiteId)){
            this.setState({errorMsg:"Color template name alreday exists."});
            return false;
        }
        this.setState({errorMsg:""});
        this.props.onNewTemplate(tpl);
        this.toggleTplAdder();
    },
    tpls: function () {
        var tpls = _(this.props.action.value).pluck("data"),
            self=this,
            isTplStatechanged = utils.deepDiffMapper.test(this.state.tpls, this.getInitialState().tpls).isChanged,
            items = tpls.map(function (tpl) {
                return (
                    <div className="adsDescriptor">
                        <Row>
                            <Col xs={4} className="u-padding-r10px wrapfeature">{tpl.name + " ("+ self.props.action.getValue(tpl).meta.owner+")"}</Col>
                            <Col xs={4} className="u-padding-r10px">
                                <OverlayTrigger trigger='hover' placement='bottom'  overlay={<Popover title='Preview'><AdPreview tpl={tpl} /></Popover>}>
                                    <ColorSwatch tpl={tpl} />
                                </OverlayTrigger>
                            </Col>
                            <Col xs={4} className="pd-10">
                                <EnableDisableSwitch size="s" onChange={self.onTplStatusChange.bind(null,tpl)} id={tpl.name} checked={self.isChecked(tpl)} on="On" off="Off"/>
                            </Col>
                        </Row>
                    </div>
                )
            });
        if(isTplStatechanged){
            items.push((<Row className="butttonsRow">
                <Col xs={6}>
                    <Button className="btn-lightBg btn-save btn-block" onClick={this.onSaveSettings}>Save</Button>
                </Col>
                <Col xs={6}>
                    <Button className="btn-lightBg btn-cancel btn-block" onClick={this.onCancelSettings}>Cancel</Button>
                </Col>
            </Row>))
        }else{
            items.push((<Row className="butttonsRow">
                <Col xs={12}>
                    <Button className="btn-lightBg btn-add btn-block" onClick={this.toggleTplAdder}>Add new Tpl</Button>
                </Col>
            </Row>))
        }

        return items;
    },
    createTpl: function () {
        return <TplCreater templatePrefix={TplNamePrefix} onCancel={this.toggleTplAdder} onSave={this.onSave}/>
    },
    render: function () {
      return (
        <div className="containerButtonBar">
          {this.state.errorMsg ? (<Row>
              <Col md={12} style={{color:"red"}} className="error"><b>{this.state.errorMsg}</b></Col>
          </Row>) : null}
          {this.state.showTplAdder ? (this.createTpl()) : this.tpls()}
        </div>
      );
    }
})