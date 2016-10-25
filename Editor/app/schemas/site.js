import { Schema, arrayOf } from 'normalizr';

const channelSchema = new Schema('channelData', { idAttribute: 'id' }),
	variationSchema = new Schema('variationByIds', { idAttribute: 'id' }),
	sectionSchema = new Schema('sectionByIds', { idAttribute: 'id' }),
	adSchema = new Schema('adByIds', { idAttribute: 'id' });

channelSchema.define({
	variations: arrayOf(variationSchema)
});

variationSchema.define({
	sections: arrayOf(sectionSchema)
})

sectionSchema.define({
	ads: arrayOf(adSchema)
});

export { channelSchema };