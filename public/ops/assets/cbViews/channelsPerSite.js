var map = 

function (doc, meta) {
  if(meta.id.substring(0,4) === 'chnl' )
  {
    emit([doc.siteId, doc.platform, doc.pageGroup, doc.incontentSettings.contentSelector], null); 
  }
}