var React = window.React,
    Wizard = require("../../../CustomComponents/Wizard/wizard.jsx")
    WizardItem = require("../../../CustomComponents/Wizard/wizardItem.jsx")
    PageGroup = require("./Slides/pageGroup.jsx"),
    PageGroupHowTo = require("./Slides/pageGroupHowTo.jsx"),
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
                <PageGroup next="How to create PageGroup" title={"Page Group"}/>
                <PageGroupHowTo prev="What is PageGroup" next="Ok, Got it!" title={"Page Group How To"}/>
            </Wizard>
        );
    }
})