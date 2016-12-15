/* Couchbase view to fetch channel(pagegroup) by geniee channel id
   To be saved in _design/dev_app/_view/channelByGenieePageGroupId
*/

function (doc, meta) {
   if ((meta.id.indexOf("chnl::") == 0) && doc.genieePageGroupId) {
       emit(doc.genieePageGroupId, doc);
   }
}
