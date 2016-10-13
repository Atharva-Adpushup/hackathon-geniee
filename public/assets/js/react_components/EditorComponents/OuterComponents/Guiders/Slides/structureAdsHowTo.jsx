var React = window.React,
    Video = require("../../../../CustomComponents/video.jsx");
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
        return (<div>
            <Video src="../assets/videos/structureads-howto.mp4" height={356} width={586} type="video/mp4"></Video>
        </div>);
    }
})