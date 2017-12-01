const reportData = {
	metricComparison: {
		impressions: {
			lastWeek: '2.3M',
			lastWeekOriginal: 2254484,
			thisWeek: '2M',
			thisWeekOriginal: 2048611,
			percentage: 9,
			change: 'decreased'
		},
		revenue: {
			lastWeek: '1.7K',
			lastWeekOriginal: 1707.87,
			thisWeek: '1.7K',
			thisWeekOriginal: 1725.2,
			percentage: 1,
			change: 'increased'
		},
		pageViews: {
			lastWeek: '978.6K',
			lastWeekOriginal: 978573,
			thisWeek: '979.8K',
			thisWeekOriginal: 979838,
			percentage: 0.13,
			change: 'increased'
		},
		cpm: {
			lastWeek: '0.76',
			lastWeekOriginal: 0.76,
			thisWeek: '0.84',
			thisWeekOriginal: 0.84,
			percentage: 11,
			change: 'increased',
			contribution: {
				lastWeek: {
					'2017-11-15': 0.69,
					'2017-11-16': 0.76,
					'2017-11-17': 0.77,
					'2017-11-18': 0.84,
					'2017-11-19': 0.76,
					'2017-11-20': 0.78,
					'2017-11-21': 0.71
				},
				thisWeek: {
					'2017-11-22': 0.86,
					'2017-11-23': 0.79,
					'2017-11-24': 0.96,
					'2017-11-25': 0.88,
					'2017-11-26': 0.81,
					'2017-11-27': 0.81,
					'2017-11-28': 0.78
				}
			}
		},
		pageCPM: {
			lastWeek: '1.75',
			lastWeekOriginal: 1.75,
			thisWeek: '1.76',
			thisWeekOriginal: 1.76,
			percentage: 0.57,
			change: 'increased'
		},
		dates: {
			lastWeek: {
				start: { format: '2017-11-15', word: 'Wed, Nov 15' },
				end: { format: '2017-11-21', word: 'Tue, Nov 21' },
				representation: 'Wed, Nov 15 - Tue, Nov 21'
			},
			thisWeek: {
				start: { format: '2017-11-22', word: 'Wed, Nov 22' },
				end: { format: '2017-11-28', word: 'Tue, Nov 28' },
				representation: 'Wed, Nov 22 - Tue, Nov 28'
			}
		}
	},
	topUrls: [
		{ url: 'http://www.imei.info/', count: '860.6K' },
		{ url: 'http://www.imei.info/blacklist-free/355358080139200/', count: '27.2K' },
		{ url: 'http://www.imei.info/registration/', count: '24.4K' },
		{ url: 'http://www.imei.info/operator-codes/', count: '14.9K' },
		{ url: 'http://www.imei.info/phone-info-request/apple/history/', count: '7.4K' },
		{ url: 'http://www.imei.info/phonedatabase/94717-apple-iphone-7/', count: '5.2K' },
		{ url: 'http://www.imei.info/phonedatabase/87692-samsung-g935f-galaxy-s7-edge/', count: '4.4K' },
		{ url: 'http://www.imei.info/news/2013-09/54437-samsung-warranty-check/', count: '4.3K' },
		{ url: 'http://www.imei.info/phonedatabase/12987-apple-ipad-air/', count: '4K' },
		{ url: 'http://www.imei.info/phonedatabase/82654-apple-iphone-6s/', count: '3.9K' }
	],
	pageGroupRevenueContribution: {
		aggregated: {
			CALC: 13.25,
			FAQ: 26.84,
			HOME: 1391.28,
			LATESTPHONE: 13.81,
			PHONEDATABASE: 20.59,
			PHONEINFO: 259.4
		},
		dayWise: {
			CALC: {
				'2017-11-22': 1.26,
				'2017-11-23': 0.41,
				'2017-11-24': 2.4,
				'2017-11-25': 1.71,
				'2017-11-26': 1.93,
				'2017-11-27': 3.26,
				'2017-11-28': 2.28
			},
			FAQ: {
				'2017-11-22': 0.82,
				'2017-11-23': 2.43,
				'2017-11-24': 5.92,
				'2017-11-25': 3.12,
				'2017-11-26': 4.99,
				'2017-11-27': 4.66,
				'2017-11-28': 4.9
			},
			HOME: {
				'2017-11-22': 135.67,
				'2017-11-23': 108.74,
				'2017-11-24': 269.6,
				'2017-11-25': 229.77,
				'2017-11-26': 173.51,
				'2017-11-27': 249.85,
				'2017-11-28': 224.14
			},
			LATESTPHONE: {
				'2017-11-22': 0.32,
				'2017-11-23': 0.11,
				'2017-11-24': 1.89,
				'2017-11-25': 3.57,
				'2017-11-26': 1.89,
				'2017-11-27': 4.1,
				'2017-11-28': 1.93
			},
			PHONEDATABASE: {
				'2017-11-22': 3.67,
				'2017-11-23': 0.91,
				'2017-11-24': 3.79,
				'2017-11-25': 3.25,
				'2017-11-26': 3.36,
				'2017-11-27': 2.39,
				'2017-11-28': 3.22
			},
			PHONEINFO: {
				'2017-11-22': 22.79,
				'2017-11-23': 25.5,
				'2017-11-24': 44.84,
				'2017-11-25': 39.09,
				'2017-11-26': 33.47,
				'2017-11-27': 52.01,
				'2017-11-28': 41.7
			}
		},
		contribution: {
			CALC: 0.77,
			FAQ: 1.56,
			HOME: 80.65,
			LATESTPHONE: 0.8,
			PHONEDATABASE: 1.19,
			PHONEINFO: 15.04
		}
	},
	deviceRevenueContribution: {
		aggregated: { DESKTOP: 951.47, MOBILE: 773.73 },
		dayWise: {
			DESKTOP: {
				'2017-11-22': 96.06,
				'2017-11-23': 76.6,
				'2017-11-24': 171.71,
				'2017-11-25': 125.26,
				'2017-11-26': 119.03,
				'2017-11-27': 189.5,
				'2017-11-28': 173.31
			},
			MOBILE: {
				'2017-11-22': 68.48,
				'2017-11-23': 61.5,
				'2017-11-24': 156.72,
				'2017-11-25': 155.25,
				'2017-11-26': 100.15,
				'2017-11-27': 126.77,
				'2017-11-28': 104.86
			}
		},
		contribution: { DESKTOP: 55.15, MOBILE: 44.85 }
	},
	adNetworkDataContribution: {
		aggregated: {
			ADSENSE: { revenue: 740.45, impressions: 931805, requests: 1137296, cpm: 0.79 },
			ADX: { revenue: 318, impressions: 326691, requests: 1137296, cpm: 0.97 },
			DFP: { revenue: 666.75, impressions: 790115, requests: 1137296, cpm: 0.84 }
		},
		dayWise: {
			ADSENSE: {
				'2017-11-22': { revenue: 116.49, impressions: 138822, requests: 175565, cpm: 0.84 },
				'2017-11-23': { revenue: 98.28, impressions: 127819, requests: 159665, cpm: 0.77 },
				'2017-11-24': { revenue: 132.62, impressions: 145368, requests: 165855, cpm: 0.91 },
				'2017-11-25': { revenue: 101.65, impressions: 132220, requests: 157908, cpm: 0.77 },
				'2017-11-26': { revenue: 86.32, impressions: 112899, requests: 150877, cpm: 0.76 },
				'2017-11-27': { revenue: 116.32, impressions: 150352, requests: 154067, cpm: 0.77 },
				'2017-11-28': { revenue: 88.77, impressions: 124325, requests: 173359, cpm: 0.71 }
			},
			ADX: {
				'2017-11-22': { revenue: 47.55, impressions: 52804, requests: 175565, cpm: 0.9 },
				'2017-11-23': { revenue: 39.47, impressions: 45940, requests: 159665, cpm: 0.86 },
				'2017-11-24': { revenue: 50.35, impressions: 47346, requests: 165855, cpm: 1.06 },
				'2017-11-25': { revenue: 38.95, impressions: 38736, requests: 157908, cpm: 1.01 },
				'2017-11-26': { revenue: 34.52, impressions: 33227, requests: 150877, cpm: 1.04 },
				'2017-11-27': { revenue: 57.09, impressions: 58231, requests: 154067, cpm: 0.98 },
				'2017-11-28': { revenue: 50.07, impressions: 50407, requests: 173359, cpm: 0.99 }
			},
			DFP: {
				'2017-11-22': { revenue: 0.5, impressions: 753, requests: 175565, cpm: 0.66 },
				'2017-11-23': { revenue: 0.35, impressions: 421, requests: 159665, cpm: 0.83 },
				'2017-11-24': { revenue: 145.46, impressions: 150962, requests: 165855, cpm: 0.96 },
				'2017-11-25': { revenue: 139.91, impressions: 148500, requests: 157908, cpm: 0.94 },
				'2017-11-26': { revenue: 98.34, impressions: 125667, requests: 150877, cpm: 0.78 },
				'2017-11-27': { revenue: 142.86, impressions: 179783, requests: 154067, cpm: 0.79 },
				'2017-11-28': { revenue: 139.33, impressions: 184029, requests: 173359, cpm: 0.76 }
			}
		},
		contribution: { revenue: { ADSENSE: 42.92, ADX: 18.43, DFP: 38.65 } }
	}
};

module.exports = { reportData };
