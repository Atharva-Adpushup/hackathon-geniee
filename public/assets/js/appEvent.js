(function( $ ){
	var user_email, user_data;

	function createRequest( param_dict )
	{
		var script_el = document.createElement('script');
		script_el.src = "/data/recordEvent?" + $.param( param_dict );

		document.head.appendChild( script_el );
	}
	

	window.overrideTrackers = function(){
		var _oldAnalyticsTrack = window.analytics.track;
		var _oldAnalyticsIdentify = window.analytics.identify;

		window.analytics.track = function( analytics_event, event_data ) {
			_oldAnalyticsTrack.apply(this, [].slice.call(arguments) );
		};


		window.analytics.identify = function( email, data ) {
			var event_level = "APP";
			user_email = email; user_data = data;

			_oldAnalyticsIdentify.apply(this, [].slice.call(arguments) );
		};
	};

})( window.jQuery );