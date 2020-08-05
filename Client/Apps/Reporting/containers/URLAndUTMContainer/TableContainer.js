import { connect } from 'react-redux';
import Table from '../../components/Table';

const mapStateToProps = (state, ownProps) => {
	const {
		data: { metrics, dimension, site }
	} = {
		fetched: true,
		data: {
			filter: {
				day_type: {
					path: '/url/list?list_name=GET_ALL_DAY_TYPES',
					position: 1,
					display_name: 'Day Of the week',
					default_enabled: true
				},
				country: {
					path: '/site/list?list_name=GET_ALL_COUNTRIES',
					position: 4,
					display_name: 'Country',
					default_enabled: true
				},
				ad_type: {
					path: '/url/list?list_name=GET_AD_TYPE_OPTIONS',
					position: 9,
					display_name: 'Ad Type',
					default_enabled: true
				},
				bid_response_time: {
					path: '/url/list?list_name=GET_BID_RESPONSE_BUCKETS',
					position: 11,
					display_name: 'Bid Response Time',
					default_enabled: true
				},
				time_of_auction: {
					path: '/url/list?list_name=GET_TIME_OF_AUCTION_BUCKETS',
					position: 2,
					display_name: 'Time of the ad auction',
					default_enabled: true
				},
				siteid: {
					path: '/site/list?list_name=GET_ALL_SITES',
					position: 5,
					display_name: 'Site',
					default_enabled: true
				},
				device_type: {
					path: '/site/list?list_name=GET_ALL_DEVICES',
					position: 3,
					display_name: 'Device',
					default_enabled: true
				},
				section: {
					path: '/site/list?list_name=GET_ALL_SECTIONS',
					position: 6,
					display_name: 'Ad Unit',
					default_enabled: false
				},
				ad_placement: {
					path: '/url/list?list_name=GET_UNIT_VISIBILITY_OPTIONS',
					position: 10,
					display_name: 'Unit Visibility',
					default_enabled: true
				},
				refresh_count: {
					path: '/url/list?list_name=GET_REFRESH_COUNT_BUCKETS',
					position: 8,
					display_name: 'Refresh count',
					default_enabled: true
				},
				network: {
					path: '/site/list?list_name=GET_ALL_NETWORKS&revenue_channel=2',
					position: 7,
					display_name: 'Bidder',
					default_enabled: true
				}
			},
			product: {
				'hb-analytics': {
					name: 'Hb Analytics',
					reports: {
						default: {
							path: '/url/report?report_name=get_stats_by_custom',
							isDefault: true,
							position: 1,
							display_name: 'Custom'
						}
					},
					isDefault: true,
					position: 1,
					display_name: 'Hb Analytics'
				}
			},
			site: {
				'31454': {
					dataAvailableOutOfLast30Days: 30,
					adpushup_page_cpm: 4.110431273818351,
					siteName: 'www.hardreset.info',
					product: { IA: 1, HB: 1, Tag: 0, Layout: 1 },
					isTopPerforming: true
				},
				'39699': {
					dataAvailableOutOfLast30Days: 30,
					adpushup_page_cpm: 0.5422311348781937,
					siteName: 'https://fossbytes.com/',
					product: { IA: 1, HB: 1, Tag: 0, Layout: 1 }
				}
			},
			widget: {},
			total_metrics: {},
			interval: {
				monthly: { display_name: 'Monthly', position: 2 },
				cumulative: { display_name: 'Cumulative', position: 3 },
				daily: { display_name: 'Daily', isDefault: true, position: 1 }
			},
			metrics: {
				utm_param: {
					display_name: 'UTM Parameter',
					table_position: 2,
					valueType: 'url',
					selectable: true
				},
				utm_value: {
					display_name: 'UTM Value',
					table_position: 3,
					valueType: 'string',
					selectable: true
				},
				utm_impression: {
					display_name: 'Impressions',
					table_position: 4,
					valueType: 'number',
					selectable: true
				},
				utm_ad_ecpm: {
					display_name: 'Ad eCPM',
					table_position: 5,
					valueType: 'money',
					selectable: true
				},
				utm_net_revenue: {
					display_name: 'Net Revenue',
					table_position: 6,
					valueType: 'money',
					selectable: true
				},
				_url: { display_name: 'URL', table_position: 7, valueType: 'url', selectable: true },
				network_gross_revenue: {
					display_name: 'Gross Revenue',
					table_position: 7,
					valueType: 'number',
					selectable: true
				},
				network_impressions: {
					display_name: 'Impressions',
					table_position: 8,
					valueType: 'string',
					selectable: true
				},
				network_ad_ecpm: {
					display_name: 'Ad eCPM',
					table_position: 9,
					valueType: 'money',
					selectable: true
				},
				network_net_revenue: {
					display_name: 'Net Revenue',
					table_position: 10,
					valueType: 'money',
					selectable: true
				}
			},
			dimension: { url: { display_name: 'URL', default_enabled: true, position: 1 } },
			group: ['user']
		}
	};
	return {
		metrics,
		dimension,
		site,
		...ownProps,
		isURLReport: true
	};
};

export default connect(mapStateToProps)(Table);
