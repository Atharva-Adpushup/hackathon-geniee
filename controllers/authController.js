// AdPushup auth controller

var express = require('express'),
	userModel = require('../models/userModel'),
    siteModel = require('../models/siteModel'),
	router = express.Router({ mergeParams: true });

router
	.get('/', function (req, res) {
	    if (req.session.user) {
			req.session.destroy();
		}

        // Generate session for authenticated user
		userModel.setSitePageGroups(req.params.email)
            .then(function(user) { return siteModel.getSiteById(req.query.siteId) })
            .then(function(site) { return userModel.verifySiteOwner(req.params.email, req.query.siteId) })
            .then(function(data) {
                req.session.user = data.user;
                req.session.site = data.site;
                return res.redirect('/user/site/'+data.site.siteId+'/dashboard');
            })
            .catch(function(err) {
                if (err.name !== 'AdPushupError') {
                    if(err.code === 13) {
                        return res.send('User does not exist!');
                    }
					return res.send('Authentication failed!');
				}
                else {
				    var error = err.message[0];
				    return res.send(error.message);
                }
            });
	});
	
module.exports = router;


