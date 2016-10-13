var React = window.React,
    $ = window.jQuery,

    Button = require("../../BootstrapComponents/Button.jsx"),
    Modal = require("../../BootstrapComponents/Modal.jsx"),

    Row = require("../../BootstrapComponents/Row.jsx"),
    Col = require("../../BootstrapComponents/Col.jsx");

FluxMixin = Fluxxor.FluxMixin(React);

module.exports = React.createClass({
    mixins: [FluxMixin],

    getInitialState: function() {
        return {
            loading: true,
            slide: "wpChecker"
        };
    },

    finishSlide: function() {
        this.setState({
            loading: false,
            slide: "finished"
        });
    },

    LwpChecker: function() {

        this.loadingText = "Please wait while we inspect your website. <br> <small>(no changes would be made to your website)</small>";
        this.loadingTitle = "Get Started with AdPushup";

        if (this.$loadingActionCallback)
            return;

        this.$loadingActionCallback = $.Deferred().done(function(response) {
            if (response.ap) {
                this.getFlux().actions.loadCmsInfo(response.ap);
                this.finishSlide();
            } else if (response.wordpress) {

                this.setState({
                    loading: false,
                    slide: "installPlugin"
                });

            } else {
                this.setState({
                    loading: false,
                    slide: "platformSelect"
                });
            }
        }.bind(this));

        $.getJSON('/proxy/detect_wp?site=' + this.props.site).done(function(response) {
            this.$loadingActionCallback.resolve(response);
        }.bind(this));
    },

    LapDetector: function() {
        this.detectionTries = this.detectionTries || 0;
        this.loadingText = this.loadingText || "Please wait while we detect AdPushup's plugin on your WordPress site..";

        if (this.$loadingActionCallback && !(this.$loadingActionCallback.state() === "resolved"))
            return;

        this.$loadingActionCallback = $.Deferred().done(function(response) {
            if (response.ap) {
                this.getFlux().actions.loadCmsInfo(response.ap);
                this.finishSlide();
            }
            else {
                if (this.detectionTries++ > 10) {
                    this.loadingTitle = "Bummer!"
                    this.loadingText = "<p>This is taking longer then expected. Have you: <ul><li>- Activated the plugin?</li><li>- Cleared your WP cache?</li></ul></p> <p>If you were not able to install plugin in the last step, please do it <a href=\"http://wordpress.org/plugins/adpushup\" target=\"_blank\">manually</a>, or contact support@adpushup.com.</p> <p><small>(we're continuously checking for successful plugin installation in the background)</small></p>";
                    this.forceUpdate();
                }
                this.LapDetector();
            }
        }.bind(this));

        $.getJSON('/proxy/detect_ap?url=' + this.props.site).done(function(response) {
            this.$loadingActionCallback.resolve(response);
        }.bind(this));

    },

    LcustomApDetector: function() {

        this.detectionTries = this.detectionTries || 0;
        this.loadingText = this.loadingText || "Please wait while we detect AdPushup's JavaScript code on your website..";

        if (this.$loadingActionCallback && !(this.$loadingActionCallback.state() === "resolved"))
            return;

        this.$loadingActionCallback = $.Deferred().done(function(response) {
            if (response.ap)
                this.finishSlide();
            else {
                if (this.detectionTries++ > 10) {
                    this.loadingTitle = "Bummer!"
                    this.loadingText = "<p>This is taking longer then expected. Have you: <ul><li>- Cleared your cache?</li><li>- Purged your CDNs?</li></ul></p>Please contact support@adpushup.com if the issue persists.</p> <p><small>(we're continuously checking for successful plugin installation in the background)</small></p>";
                    this.forceUpdate();
                }

                this.LcustomApDetector();
            }
        }.bind(this));

        $.getJSON('/proxy/detect_custom_ap?url=' + this.props.site).done(function(response) {
            this.$loadingActionCallback.resolve(response);
        }.bind(this));

    },

    render: function() {

        if( ! this.props.active )
            return null;

        if (this.state.slide === null)
            return null;

        if (this.state.loading) {
            this['L' + this.state.slide](); // Execute loading action
            return this.renderLoader(this.loadingText,this.loadingTitle); //show loading animation
        } else
            return this['S' + this.state.slide]();
    },

    SplatformSelect: function() {
        return (<Modal onRequestHide={new Function} title="Select platform" className="_ap_modal_logo" keyboard={true} animation={true}>
                    <div className="spin"></div>
                   <div className="modal-body">
                        <h4>This seems like a non-WordPress site..</h4>
                        <Row className="platformrow">
                            <Col xs={12}>
                                 <Button style={{fontSize: 22}}  className="btn-lightBg"  onClick={this.switchTo.bind(this, "finished", true)}>Yep, let's optimize ads!</Button>
                            </Col>
                        </Row>
                        <Row className="platformrow">
                            <Col className="col-xs-12">
                                <Button style={{fontSize: 10}} className="btn-lightBg" onClick={this.switchTo.bind(this, "installPlugin", false)}>You got it wrong, it's a WordPress site.</Button>
                            </Col>
                        
                        </Row>
                    </div>
                </Modal>);
    },

    hideWizard: function() {
        this.setState({
            slide: null,
            loading: false
        });
    },

    Sfinished: function() {

        this.state.slide = null;

        setTimeout(function() {
            this.hideWizard();

            if( this.props.slideFinishCallback )
                this.props.slideFinishCallback();

        }.bind(this), 3000);

        return (<Modal onRequestHide={new Function} title="Finished" className="_ap_modal_logo" keyboard={true} animation={true}>
                    <div className="spin"></div>
                    <div className="modal-body">
                        <h4>Congrats <i className="fa fa-smile-o mL-10"></i></h4>
                        <p>Its done.</p>
                    </div>
                </Modal>);
    },

    ScustomSite: function() {
        return (<Modal onRequestHide={new Function} title="Custom Site?" className="_ap_modal_logo" keyboard={true} animation={true}>
                    <div className="spin"></div>
                    <div className="modal-body">
                        <p>If you use a custom site. Please follow instruction and place the code and then click the following.</p>
                        <div className="btnrow">
                            <Button className="btn-lightBg pull-right" onClick={this.switchTo.bind(this, "customApDetector", true)}>
                                Detect
                            </Button>
                        </div>
                    </div>
                </Modal>);
    },


    pluginPopup: function() {

        this.switchTo("apDetector", true);
        var w = 800;
        var h = 550;    
        var left = (screen.width / 2) - (w / 2);
        var top = (screen.height / 2) - (h / 2);
        return window.open(this.props.site + "/wp-admin/plugin-install.php?tab=plugin-information&plugin=adpushup", "Plugin Install", 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left);
    },


    switchTo: function(slideName, slideTypeLoading) {
        this.detectionTries = 0;
        this.loadingText = false;
        this.loadingTitle = false;

        if (slideTypeLoading)
            this.setState({
                loading: true,
                slide: slideName
            });
        else
            this.setState({
                loading: false,
                slide: slideName
            });

    },

    SmanualInstall: function() {
        var code = this.returnSmartCode(window.ADP_SITE_ID);
        return (<Modal onRequestHide={new Function} title="Manual Install" className="_ap_modal_logo" keyboard={true} animation={true}>
                    <div className="spin"></div>
                    <div className="modal-body">
                        <p>Please paste the following JavaScript code just after the &lt;head&gt; tag on all pages of your website.</p>
                        <textarea style={{width:380,height:250}}  value={code}></textarea>
                         <Row className="platformrow">
                            <Col className="col-xs-12">
                                <Button style={{fontSize:  15}}  className="btn-lightBg" onClick={ this.switchTo.bind(this, "customApDetector", true )}>I've installed the code.</Button>
                            </Col>
                        
                         </Row>
                    </div>
                </Modal>);
    },
    returnSmartCode: function(siteID){
                return '<script type="text/javascript">\n'+
                            '(function () {\n'+
                               '\tvar c = (window.adpushup = window.adpushup || {}).config = (window.adpushup.config || {});\n'+
                               '\tc.pluginVer= 1.1;\n'+
                               '\tc.siteId = "'+ siteID +'";        \n'+
                               '\t\n'+
                               '\tvar s = document.createElement("script");\n'+
                               '\ts.type = "text/javascript";\n'+
                               '\ts.async = true;\n'+
                               '\ts.src = "//optimize.adpushup.com/ap.js";\n'+
                               '\t(document.getElementsByTagName("head")[0]||document.getElementsByTagName("body")[0]).appendChild(s);\n'+
                            '})();\n'+
                        '</script>';
    },
    SinstallPlugin: function() {
        return (<Modal onRequestHide={new Function} title="Install Plugin" className="_ap_modal_logo" keyboard={true} animation={true}>
                    <div className="spin"></div>
                    <div className="modal-body">
                        <h4>Hey there, WordPress user!</h4>
                        <p>AdPushup enables you to <b>increase your website's ad revenues</b> by testing your ad layout, types, colors etc.</p>
                        <p>To do this, we need you to install our JavaScript snippet on your website.</p>
                        <p>Since you're using WordPress, why don't you do this by installing our plugin?</p>
                        <Row className="platformrow">
                            <Col xs={12}>
                                <Button style={{fontSize: 22}} className="btn-lightBg" onClick={this.pluginPopup}> <i className="fa fa-wordpress"></i> Install WordPress Plugin</Button>
                            </Col>
                        </Row>
                        <Row className="platformrow">
                            <Col className="col-xs-12">
                                <Button style={{fontSize:  10}}  className="btn-lightBg" onClick={this.switchTo.bind(this, "manualInstall", false)}>Or do a manual install</Button>
                            </Col>
                        
                        </Row>
                    </div>
                </Modal>);
    },


    renderLoader: function(text,title) {
        return (<Modal onRequestHide={new Function} title="loading" className="_ap_modal_logo" keyboard={true} animation={true}>
                    <div className="spin"></div>
                    <div className="modal-body">
                        <h4>{title}</h4>
                        <p dangerouslySetInnerHTML={{ __html: text }} />
                    </div>
                </Modal>);
    }
}); 