var model = require('../../../helpers/model'),
	consts = require('../../../configs/commonConsts'),
	_ = require('lodash'),
	Ad = model.extend(function() {
		this.merging = true;
		this.mergingPriority = consts.enums.priorities.EXISTING_OBJECT;
		this.mergingKey = 'variationName';
		this.keys = ['network', 'variationName', 'custom', 'borderColor', 'backgroundColor', 'adType', 'tplName', 'titleColor', 'width', 'id', 'urlColor', 'textColor', 'height'];
		this.clientKeys = ['network', 'variationName', 'custom', 'borderColor', 'backgroundColor', 'adType', 'tplName', 'titleColor', 'width', 'id', 'urlColor', 'textColor', 'height', 'syncStatus'];
		this.defaults = {
			'impressions': 0,
			'clicks': 0,
			'custom': false,
			'ctr': 0,
			'syncStatus': false,
			'structuredSections': [],
			'incontentSections': []
		};

		this.constructor = function(data, force) {
			this.super(data, force);
		};

		this.getAdsenseFormatJson = function() {
			var self = this,
				adType;

			if (self.get('adType') === 'text') {
				adType = 'TEXT';
			} else if (self.get('adType') === 'text_image') {
				adType = 'TEXT_IMAGE';
			} else {
				adType = 'IMAGE';
			}

			return {
				'name': self.get('variationName'),
				'contentAdsSettings': {
					'size': 'SIZE_' + self.get('width') + '_' + self.get('height'),
					'type': adType,
					'backupOption': {
						'type': 'BLANK'
					}
				},
				'customStyle': {
					'colors': {
						'background': _.trimStart(self.get('backgroundColor'), '#'),
						'border': _.trimStart(self.get('borderColor'), '#'),
						'title': _.trimStart(self.get('titleColor'), '#'),
						'text': _.trimStart(self.get('textColor'), '#'),
						'url': _.trimStart(self.get('urlColor'), '#')
					},
					'corners': 'SQUARE',
					'font': {
						'family': 'VERDANA',
						'size': 'LARGE'
					},
					'kind': 'adsensehost#adStyle'
				},
				'kind': 'adsensehost#adUnit'
			};
		};
	});

module.exports = Ad;
