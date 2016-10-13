var React = window.React;

module.exports = React.createClass({
    mixins: [],
    getDefaultProps: function () {
        return {};
    },
    getInitialState: function () {
        return {};
    },
    render: function () {
        var iconMainPanelCss = {"background-color":"#"+this.props.background,color: "#ff1f1f"};
        var titleCss = {"color":"#"+this.props.title};
        var urlCss = {"color":"#"+this.props.url};
        return (<div>

            <div class="iconMainPanel" style={iconMainPanelCss} >
                <div id="_ap_titlePanel" class="titlePanel" style={titleCss}>Ad Title</div>
                <div id="_ap_urlPanel" class="urlPanel" style={titleCss}></div>
                <div id="_ap_textPanel" class="textPanel" style={urlCss}>Ad text</div>
                <div class="adsByGooglePanel" style="background-color:#ff1f1f;">
                    <span class="adchoices" style="color:#000000;">AdChoices</span>
                </div>
            </div>

        </div>);
    }
})