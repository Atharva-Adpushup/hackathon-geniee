var React = window.React,
    CommonConsts = require("editor/commonConsts"),
    CM = CommonConsts.enums.components,
    NewChannelMenu = require("../NewChannel/newChannelMenu.jsx"),
    OverlayMixin = require("BootstrapComponents/OverlayMixin"),
    DomUtils = require("BootstrapComponents/utils/domUtils.js"),
    Tooltip = require("BootstrapComponents/Tooltip.jsx"),
    Button = require("BootstrapComponents/Button.jsx"),
    OverlayTrigger = require("BootstrapComponents/OverlayTrigger.jsx");

var Fluxxor = require("libs/third-party/fluxxor")
TabSiteOptions = require("./tabSiteOptions.jsx"),
    FluxMixin = Fluxxor.FluxMixin(React);

module.exports = React.createClass({
    mixins: [FluxMixin],

    getDefaultProps: function () {
        return {
            handleClick: function (key) {
                console.log(key)
            }
        };
    },
    getInitialState: function () {
        return {showAddNewOptions: false, activeChannelOptions: null};
    },
    componentDidMount: function () {
        var el = this.getDOMNode();
        el.addEventListener("click", function (e) {
            this.setState(this.getInitialState());
        }.bind(this), true);
    },
    toggleAddNewOptions: function () {
        this.setState({showAddNewOptions: !this.state.showAddNewOptions})
    },
    showMenu: function (menu, ev) {
        var position = DomUtils.menuRenderPosition(ev.target);
        this.getFlux().actions.showComponent(menu, position.left, position.top);
    },
    renderEmptyScreen: function () {
        return (<div className="tabContentbg">
            
        </div>)
    },
    handleClick: function (tabPane, ev) {
        if (this.props.activeKey == tabPane.key) {
            var position = DomUtils.menuRenderPosition(document.getElementById("tab_" + tabPane.key));
            this.getFlux().actions.showComponent(CM.CHANNEL_MENU, position.left, position.top);
        } else {
            tabPane.props.handleClick(tabPane.key);
        }

    },
    render: function () {
        var content = [], tabs = [], options = null, me = this;

        this.props.children.forEach(function (tabPane) {
            tabs.push((
                <OverlayTrigger placement='bottom' overlay={<Tooltip>Click for Page Group options</Tooltip>}>
                    <li onClick={me.handleClick.bind(null, tabPane)} id={"tab_" + tabPane.key}>
                        <a className={this.props.activeKey == tabPane.key ? "active" : "null"} href="#">{tabPane.props.title}
                            <i className="fa fa-angle-down"></i>
                        </a>
                {1 ? null : <ul className={(me.state.activeChannelOptions == tabPane.key) ? "tabs-submenu active" : "tabs-submenu"}>{tabPane.props.tabOptions}</ul>}
                    </li>
                </OverlayTrigger>
            ))

            content.push(React.addons.cloneWithProps(tabPane, {
                ref: "tab_content_" + tabPane.key,
                id: "tab_content_" + tabPane.key,
                selected: (this.props.activeKey == tabPane.key)
            }))
        }.bind(this))

        return (
            <div className="tabAreaWrap">
                <div className="tabArea">
                    <div className="borderBot"></div>
                    <div className="tabBar">

                    <OverlayTrigger placement='right' overlay={<Tooltip>Goto Dashboard</Tooltip>}>
                    <Button className="btn btn-sm btn-flat" href="/user/dashboard"><i className="fa fa-arrow-left"></i></Button>
                    </OverlayTrigger>
                        <ul>
                            <OverlayTrigger placement='right' overlay={<Tooltip>Create/Load PageGroup</Tooltip>}>
                                <li className={content.length == 0 ? "pulseAnimate" : null} onClick={this.toggleAddNewOptions}>
                                    <a id="adNewChannel" href="#" onClick={this.showMenu.bind(null, CM.NEW_CHANNEL_MENU)} className="addnew">+</a>
                                </li>
                            </OverlayTrigger>
                        {tabs}
                        </ul>
                        <TabSiteOptions {...this.props}></TabSiteOptions>
                    </div>
                </div>
                <div className="tabContent">
                  {content.length == 0
                      ? this.renderEmptyScreen()
                      : content}
                </div>
            </div>
        );
    }
})