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
        return (
            <div>
               <Video src="../assets/videos/oAuth-howto.mp4" type="video/mp4"></Video>
            </div>
        );
    }
})