var map =

function (doc, meta) {
  if(meta.id.substring(0,4) == 'urlm')
  {
    emit([doc.siteId, doc.pageGroup, doc.platform], null)
  }
}

var reduce = 

_count