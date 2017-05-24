/**
 * NAME:        channelByGenieePageGroupId
 * DESCRIPTION: Couchbase view to fetch channel(pagegroup) by geniee channel id
 * LOCATION:    _design/dev_app/_view/channelByGenieePageGroupId
 */
function (doc, meta) {
   if ((meta.id.indexOf("chnl::") == 0) && doc.genieePageGroupId) {
       emit(doc.genieePageGroupId, doc);
   }
}


/**
 * NAME:        channelById
 * DESCRIPTION: Couchbase view to fetch channel(pagegroup) by channel id
 * LOCATION:    _design/dev_app/_view/channelById
 */
function (doc, meta) {
  if(meta.id.substring(0, 4) === 'chnl') {
    emit(doc.id, doc)
  }
}


/**
 * NAME:        liveSitesByNonEmptyChannels
 * DESCRIPTION: View to get sites which have enabled 'auto-optimise' site level option (Filtered by non-empty channels)
 * LOCATION:    _design/dev_app/_view/sitesByAutoOptimiseParameter
 */
function (doc, meta) {
   var computedObj,
       isAutoOptimise = !!(doc.apConfigs && doc.apConfigs.autoOptimise),
       isModePublish = !!(doc.apConfigs && (doc.apConfigs.mode == 1)),
       hasSiteNotUpdated = !!((meta.id.indexOf("site::") === 0) && doc.dateModified && isAutoOptimise && isModePublish);

   if (hasSiteNotUpdated) {
     computedObj = {'domain': doc.siteDomain, 'siteId': doc.siteId, 'dateModified': doc.dateModified};

     emit(doc.dateModified, computedObj);
   }
}


/**
 * NAME:        liveSitesByNonEmptyChannels
 * DESCRIPTION: View to get all relevant sites (Filtered by non-empty channels)
 * LOCATION:    _design/dev_app/_view/liveSitesByNonEmptyChannels
 */
function (doc, meta) {
   var isChannelExists = !!(doc.channels && doc.channels.length),
       isLiveSite = !!((meta.id.indexOf("site::") === 0) && isChannelExists);

   if (isLiveSite) {

     emit(doc.siteId, doc.siteId);
   }
}
