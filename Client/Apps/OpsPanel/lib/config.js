const config = {
	hbConfig: {
		pulsepoint: {
			name: 'pulsepoint',
			isHb: true,
			global: {
				cp: { default: '560684', validations: { required: true }, alias: 'User Id', isEditable: true }
			},
			local: {
				ct: { validations: { required: true }, alias: 'Tag Id' },
				cf: { validations: { required: true }, alias: 'Tag Size' }
			}
		},
		sekindoUM: {
			name: 'sekindoUM',
			isHb: false,
			global: {},
			local: {
				spaceId: { validations: { required: true }, alias: 'Space Id' }
			}
		},
		wideorbit: {
			name: 'wideorbit',
			isHb: false,
			global: {
				pbId: { default: '577', validations: { required: true }, alias: 'Publisher Id', isEditable: true }
			},
			local: {
				pId: { validations: { required: true, type: 'number' }, alias: 'Tag Id' }
			}
		},
		springserve: {
			name: 'springserve',
			isHb: false,
			global: {
				placementId: { validations: { required: true }, alias: 'Placement Id', isEditable: true }
			}
		},
		brealtime: {
			name: 'brealtime',
			isHb: false,
			global: {
				placementId: { validations: { required: true }, alias: 'Placement Id', isEditable: true }
			}
		},
		brainjuicemedia: {
			name: 'brainjuicemedia',
			isHb: true,
			global: {
				placementId: { validations: { required: true }, alias: 'Placement Id', isEditable: true }
			}
		},
		c1x: {
			name: 'c1x',
			isHb: true,
			global: {
				placementCode: { validations: { required: false }, alias: 'Placement Code', isEditable: true }
			}
		},
		openx: {
			name: 'openx',
			isHb: true,
			global: {
				unit: { validations: { required: true }, alias: 'Ad Unit Code', isEditable: true },
				delDomain: { validations: { required: true }, alias: 'Delivery Domain', isEditable: true }
			}
		},
		districtmDMX: {
			name: 'districtmDMX',
			isHb: true,
			global: {
				id: { validations: { required: true }, alias: 'Ad Id', isEditable: true }
			}
		}
		// Set new partners in DFP key values as well
	},
	supportedAdSizes: [
		{
			layoutType: 'SQUARE',
			sizes: [
				{ width: 300, height: 250 },
				{ width: 250, height: 250 },
				{ width: 200, height: 200 },
				{ width: 336, height: 280 }
			]
		},
		{
			layoutType: 'HORIZONTAL',
			sizes: [
				{ width: 728, height: 90 },
				{ width: 468, height: 60 },
				{ width: 900, height: 90 },
				{ width: 970, height: 250 }
			]
		},
		{
			layoutType: 'VERTICAL',
			sizes: [
				{ width: 300, height: 600 },
				{ width: 160, height: 600 },
				{ width: 120, height: 600 },
				{ width: 300, height: 1050 }
			]
		},
		{
			layoutType: 'MOBILE',
			sizes: [
				{ width: 320, height: 50 },
				{ width: 300, height: 250 },
				{ width: 250, height: 250 },
				{ width: 200, height: 200 },
				{ width: 320, height: 100 }
			]
		}
	]
};

export default config;
