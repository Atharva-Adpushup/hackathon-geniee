var React = window.React,
    Wizard = require("../../../CustomComponents/Wizard/wizard.jsx")
    StructureVsIncontent = require("./Slides/structureVsIncontent.jsx"),
    StructureAdsHowTo = require("./Slides/structureAdsHowTo.jsx"),
    IncontentAdsHowTo = require("./Slides/inContentHowTo.jsx"),
    $ = window.jQuery;

module.exports = React.createClass({
    mixins: [],
    getDefaultProps: function () {
        return {};
    },
    getInitialState: function () {
        return {};
    },
    render: function () {
        return (
            <Wizard infinite={false}>
                <StructureVsIncontent next="How to create Structural Ads" title={"Structure & Incontent Ads"}/>
                <StructureAdsHowTo prev="Structure Vs Incontent Ads" next="How to create Incontent Ads" title={"How to create Structural Ads"}/>
                <IncontentAdsHowTo prev="How to create Structural Ads" next="Ok, Got it!" title={"How to create Incontent Ads"}/>
            </Wizard>
        );
    }
})