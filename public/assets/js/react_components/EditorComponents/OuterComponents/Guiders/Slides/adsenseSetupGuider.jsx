var React = window.React,
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
                <p><b>We </b></p>

                <p>AdPushup uses Control Ads for multiple things, such as:
                    <ul>
                        <li><b>Performance Tracking</b> - We compare AdPushup's performance against site's manual (control) ad setup.</li>
                        <li><b>Fallback</b> - We're rock solid, but god forbid, if our Infrastructure ever goes down/slows, we trigger these Control Ads so that you don't lose a single pageview.</li>
                        <li><b>Limiting AdPushup optimization</b> - Just in case you don't want to test & optimize 100% of your traffic, you could easily configure AdPushup to run on only a certain percentage of traffic, and Control Ads run the rest of the times.</li>
                        <li><b>Ensuring Coverage</b> - If for any reason, we're not able to serve enough ads units on your page (due to CSS path failure etc.) we can trigger Control Ads so that you don't miss out on any ad impression.</li>
                    </ul>
                </p>

                <p>AdPushup cannot read them directly from your website, so we require you to transform your ad codes. Go ahead, and set them up!</p>


                </div>
        );
    }
})