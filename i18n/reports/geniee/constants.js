const mapping = {
	en: {
		NOTIFICATION_ALERT: {
			DATA_DISCREPANCY: {
				PAGEVIEWS: 'Please note that due to infrastructure upgrade, reports data such as page views, page RPM and page CTR might not reflect accurately for now. This message will disappear once data services are stable.'
			}
		},
		HEADER: {
			TITLE: 'Reporting and Analytics',
			BUTTON_FILTER: 'Filters'
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
						NAME: 'Apply'
					},
					RESET: {
						NAME: 'Reset'
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
				PAGEVIEWS: 'インフラストラクチャのアップグレードにより、ページビュー、ページRPM、ページのクリック率などのレポートデータが正確に反映されない場合があります。 このメッセージは、データサービスが安定すると消えます。'
			}
		},
		HEADER: {
			TITLE: 'レポートと分析',
			BUTTON_FILTER: 'フィルタ'
		},
		BREADCRUMB: {
			MEDIA: {
				NAME: 'メディア',
				TOOLTIP_TEXT: 'クリックするとメディアレベルのレポートが表示されます'
			},
			PAGE_GROUPS: 'ページグループ',
			REPORT_DATE: '報告日'
		},
		METRIC_THUMBNAILS: {
			TITLE: 'パフォーマンス',
			REVENUE: {
				NAME: '収益',
				TOOLTIP_TEXT: 'これは、Adpushupを介して配信された広告によって獲得された純収益の見積もりです。'
			},
			PAGE_VIEWS: {
				NAME: 'ページビュー',
				TOOLTIP_TEXT: 'これは、広告を含むページがAdpushup経由で読み込まれた回数です。 ページビューは、ページに表示される広告の量や数に関係なくカウントされます。'
			},
			CLICKS: {
				NAME: 'CLICKS',
				TOOLTIP_TEXT: 'Adpushup経由で配信された広告がクリックされた回数です。'
			},
			PAGE_RPM: {
				NAME: 'ページRPM',
				TOOLTIP_TEXT: 'ページRPMは、1,000ページビューあたりの平均収入です。'
			},
			PAGE_CTR: {
				NAME: 'ページのクリック率',
				TOOLTIP_TEXT: 'ページクリック率（CTR）は、ページビュー数に対する広告クリック数の割合です。'
			}
		},
		DATA_TABLE: {
			TITLE: 'ページグループ',
			PAGE_GROUPS: {
				NAME: 'ページグループ',
				TOOLTIP_TEXT: 'クリックしてページグループレベルのレポートを表示する',
				HEADER: {
					PLATFORM: 'プラットフォーム',
					VARIATION_COUNT: '数多くのバリエーション'
				}
			},
			VARIATIONS: {
				NAME: 'バリエーション',
				HEADER: {
					TRAFFIC_DISTRIBUTION: '交通流通',
					REVENUE_CONTRIBUTION: '収益貢献 (%)'
				}
			},
			COMMON: {
				NAME: '名',
				REVENUE: '収益 (¥)',
				IMPRESSIONS: '印象',
				PAGE_VIEWS: 'ページビュー',
				CLICKS: 'CLICKS',
				PAGE_RPM: 'ページRPM',
				PAGE_CTR: 'ページのクリック率',
				TOTAL: '合計'
			}
		},
		PAGE_LOADER: {
			TITLE: 'レポートを取得中...',
			BUTTON_FILTER: 'フィルタの変更',
			BUTTON_RESET_FILTER: 'フィルターをリセットする'
		},
		SLIDEOUT_MENU: {
			COMPONENTS: {
				SELECTED: {
					NAME: '選択された',
					UI_PLACEHOLDER_TEXT: '表示するフィルタがありません。'
				},
				FILTERS: {
					DATE: {
						NAME: '日付',
						RELATIVE: {
							NAME: 'クイック',
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
							NAME: '絶対の',
							INPUT_FROM: {
								NAME: 'から',
								PLACEHOLDER_TEXT: 'たとえば、01/01/2017'
							},
							INPUT_TO: {
								NAME: 'に',
								PLACEHOLDER_TEXT: 'たとえば、31/01/01'
							}
						}
					}
				},
				BUTTON_ACTION: {
					APPLY: {
						NAME: '適用'
					},
					RESET: {
						NAME: 'リセット'
					}
				}
			}
		},
		ERROR: {
			REPORT_EXCEPTION: '今すぐレポートを取得できません！<br>後でもう一度お試しください',
			REPORT_DATA_NOT_AVAILABLE: '今すぐデータを分析/マイニングしています。<br> レポートはまもなく利用可能になります'
		}
	},
	vi: {}
};

module.exports = mapping;
