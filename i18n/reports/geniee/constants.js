const mapping = {
	en: {
		NOTIFICATION_ALERT: {
			DATA_DISCREPANCY: {
				PAGEVIEWS: 'Please note that due to infrastructure upgrade, reports data such as page views, page RPM and page CTR might not reflect accurately for now. This message will disappear once data services are stable.'
			}
		},
		HEADER: {
			TITLE: 'Reporting and Analytics',
			BUTTON_FILTER: 'Filters',
			CHANGE_LANGUAGE_DROPDOWN: 'Select Language'
		},
		BREADCRUMB: {
			MEDIA: {
				NAME: 'Media',
				TOOLTIP_TEXT: 'Click to see Media level reports'
			},
			PAGE_GROUPS: 'Page Group',
			REPORT_DATE: 'Report Date'
		},
		METRIC_THUMBNAILS: {
			TITLE: 'Performance',
			REVENUE: {
				NAME: 'REVENUE',
				TOOLTIP_TEXT: 'This is an estimate of the net revenue earned by the ads served via Adpushup.'
			},
			PAGE_VIEWS: {
				NAME: 'PAGE VIEWS',
				TOOLTIP_TEXT: 'This is the number of times pages containing ads are loaded via Adpushup. A page view is counted irrespective of how few or how many ads are served on a page.'
			},
			CLICKS: {
				NAME: 'CLICKS',
				TOOLTIP_TEXT: 'This is the number of times ads served via Adpushup are clicked.'
			},
			PAGE_RPM: {
				NAME: 'PAGE RPM',
				TOOLTIP_TEXT: 'Page RPM is the average earnings per thousand page views.'
			},
			PAGE_CTR: {
				NAME: 'PAGE CTR',
				TOOLTIP_TEXT: 'Page click through rate (CTR) is the percentage of the number of ad clicks to the number of page views.'
			}
		},
		HIGHCHARTS: {
			AXIS: {
				Y: 'Values'
			}
		},
		DATA_TABLE: {
			TITLE: 'Page Groups',
			PAGE_GROUPS: {
				NAME: 'Page Groups',
				TOOLTIP_TEXT: 'Click to see Page group level reports',
				HEADER: {
					PLATFORM: 'PLATFORM',
					VARIATION_COUNT: 'NUMBER OF VARIATIONS'
				}
			},
			VARIATIONS: {
				NAME: 'Variations',
				HEADER: {
					TRAFFIC_DISTRIBUTION: 'TRAFFIC DISTRIBUTION',
					REVENUE_CONTRIBUTION: 'REVENUE CONTRIBUTION (%)'
				}
			},
			COMMON: {
				NAME: 'NAME',
				REVENUE: 'REVENUE (¥)',
				IMPRESSIONS: 'IMPRESSIONS',
				PAGE_VIEWS: 'PAGE VIEWS',
				CLICKS: 'CLICKS',
				PAGE_RPM: 'PAGE RPM',
				PAGE_CTR: 'PAGE CTR',
				TOTAL: 'TOTAL'
			},
			TABLE: {
				"decimal":        "",
				"emptyTable":     "No data available in table",
				"info":           "Showing _START_ to _END_ of _TOTAL_ entries",
				"infoEmpty":      "Showing 0 to 0 of 0 entries",
				"infoFiltered":   "(filtered from _MAX_ total entries)",
				"infoPostFix":    "",
				"thousands":      ",",
				"lengthMenu":     "Show _MENU_ entries",
				"loadingRecords": "Loading...",
				"processing":     "Processing...",
				"search":         "Search:",
				"zeroRecords":    "No matching records found",
				"paginate": {
					"first":      "First",
					"last":       "Last",
					"next":       "Next",
					"previous":   "Previous"
				},
				"aria": {
					"sortAscending":  ": activate to sort column ascending",
					"sortDescending": ": activate to sort column descending"
				}
			}
		},
		PAGE_LOADER: {
			TITLE: 'Fetching reports...',
			BUTTON_FILTER: 'Change Filters',
			BUTTON_RESET_FILTER: 'Reset Filters'
		},
		SLIDEOUT_MENU: {
			COMPONENTS: {
				SELECTED: {
					NAME: 'Selected',
					UI_PLACEHOLDER_TEXT: 'No filters to show.'
				},
				FILTERS: {
					DATE: {
						NAME: 'Date',
						RELATIVE: {
							NAME: 'Quick',
							OPTIONS: {
								WEEK_THIS: 'This Week',
								MONTH_THIS: 'This month',
								YEAR_THIS: 'This year',
								LAST_7_DAYS: 'Last 7 days',
								LAST_30_DAYS: 'Last 30 days',
								LAST_60_DAYS: 'Last 60 days',
								LAST_90_DAYS: 'Last 90 days',
								LAST_6_MONTHS: 'Last 6 months'
							}
						},
						ABSOLUTE: {
							NAME: 'Absolute',
							INPUT_FROM: {
								NAME: 'From',
								PLACEHOLDER_TEXT: 'For example, 01/01/2017'
							},
							INPUT_TO: {
								NAME: 'To',
								PLACEHOLDER_TEXT: 'For example, 31/01/2017'
							}
						}
					}
				},
				BUTTON_ACTION: {
					APPLY: {
						NAME: 'Apply',
						LOADING_TEXT: 'Applying...'
					},
					RESET: {
						NAME: 'Reset',
						LOADING_TEXT: 'Resetting...'
					}
				}
			}
		},
		ERROR: {
			REPORT_EXCEPTION: 'Unable to fetch reports right now!<br> Please try again later',
			REPORT_DATA_NOT_AVAILABLE: 'We are analysing/mining your data right now.<br> Reports will be available shortly'
		}
	},
	ja: {
		NOTIFICATION_ALERT: {
			DATA_DISCREPANCY: {
				PAGEVIEWS: 'メンテナンスにより、現在レポートが正常に反映されない可能性がございます。'
			}
		},
		HEADER: {
			TITLE: 'レポート',
			BUTTON_FILTER: '絞り込み',
			CHANGE_LANGUAGE_DROPDOWN: '言語を選択する'
		},
		BREADCRUMB: {
			MEDIA: {
				NAME: 'メディア',
				TOOLTIP_TEXT: 'メディアごとのレポートを見る'
			},
			PAGE_GROUPS: 'ページグループ',
			REPORT_DATE: '期間'
		},
		METRIC_THUMBNAILS: {
			TITLE: 'パフォーマンス',
			REVENUE: {
				NAME: '売上',
				TOOLTIP_TEXT: 'Adpushupにより配信された分の推定広告収益です。'
			},
			PAGE_VIEWS: {
				NAME: 'PV',
				TOOLTIP_TEXT: 'Adpushupタグが設置されたページが読み込まれた回数です。広告枠の数とは関係なく計測されます。'
			},
			CLICKS: {
				NAME: 'CLICK',
				TOOLTIP_TEXT: 'Adpushup経由で配信された広告がクリックされた回数です。'
			},
			PAGE_RPM: {
				NAME: 'PAGE RPM',
				TOOLTIP_TEXT: '1,000PVあたりの収益です。'
			},
			PAGE_CTR: {
				NAME: 'PAGE CTR',
				TOOLTIP_TEXT: 'PV数に対する広告クリック数の割合です。'
			}
		},
		HIGHCHARTS: {
			AXIS: {
				Y: '値'
			}
		},
		DATA_TABLE: {
			TITLE: 'Page Groups',
			PAGE_GROUPS: {
				NAME: 'Page Groups',
				TOOLTIP_TEXT: 'Page Group毎のレポートを表示',
				HEADER: {
					PLATFORM: 'デバイス',
					VARIATION_COUNT: 'バリエーション数'
				}
			},
			VARIATIONS: {
				NAME: 'バリエーション',
				HEADER: {
					TRAFFIC_DISTRIBUTION: '配信比率',
					REVENUE_CONTRIBUTION: '売上比率 (%)'
				}
			},
			COMMON: {
				NAME: '名',
				REVENUE: '売上 (¥)',
				IMPRESSIONS: 'IMP',
				PAGE_VIEWS: 'PV',
				CLICKS: 'CLICK',
				PAGE_RPM: 'PAGE RPM',
				PAGE_CTR: 'PAGE CTR',
				TOTAL: '合計'
			},
			TABLE: {
				"decimal":        "",
				"emptyTable":     "テーブルにデータがありません",
				"info":           " _TOTAL_ 件中 _START_ から _END_ まで表示",
				"infoEmpty":      " 0 件中 0 から 0 まで表示",
				"infoFiltered":   "（全 _MAX_ 件より抽出）",
				"infoPostFix":    "",
				"thousands":      ",",
				"lengthMenu":     "_MENU_ 件表示",
				"loadingRecords": "読み込み中...",
				"processing":     "処理中...",
				"search":         "検索:",
				"zeroRecords":    "一致するレコードがありません",
				"paginate": {
					"first":      "先頭",
					"last":       "最終",
					"next":       "次",
					"previous":   "前"
				},
				"aria": {
					"sortAscending":  ": 列を昇順に並べ替えるにはアクティブにする",
					"sortDescending": ": 列を降順に並べ替えるにはアクティブにする"
				}
			}
		},
		PAGE_LOADER: {
			TITLE: 'レポート取得中...',
			BUTTON_FILTER: 'フィルタの変更',
			BUTTON_RESET_FILTER: 'フィルタをリセットする'
		},
		SLIDEOUT_MENU: {
			COMPONENTS: {
				SELECTED: {
					NAME: '絞り込み',
					UI_PLACEHOLDER_TEXT: '絞り込みなし'
				},
				FILTERS: {
					DATE: {
						NAME: '期間',
						RELATIVE: {
							NAME: '期間選択',
							OPTIONS: {
								WEEK_THIS: '今週',
								MONTH_THIS: '今月',
								YEAR_THIS: '今年',
								LAST_7_DAYS: '過去7日間',
								LAST_30_DAYS: '過去30日間',
								LAST_60_DAYS: '過去60日間',
								LAST_90_DAYS: '過去90日間',
								LAST_6_MONTHS: '過去6ヶ月'
							}
						},
						ABSOLUTE: {
							NAME: '日付から選択',
							INPUT_FROM: {
								NAME: '開始日',
								PLACEHOLDER_TEXT: '例）2017-01-01'
							},
							INPUT_TO: {
								NAME: '終了日',
								PLACEHOLDER_TEXT: '例）2017-01-31'
							}
						}
					}
				},
				BUTTON_ACTION: {
					APPLY: {
						NAME: '適用',
						LOADING_TEXT: '適用中...'
					},
					RESET: {
						NAME: 'リセット',
						LOADING_TEXT: 'リセット中...'
					}
				}
			}
		},
		ERROR: {
			REPORT_EXCEPTION: '一時的にレポートを取得できません。<br> 時間をおいてもう一度お試しください。',
			REPORT_DATA_NOT_AVAILABLE: '現在データを分析しています。<br> しばらくお待ちください'
		}
	},
	vi: {}
};

module.exports = mapping;
