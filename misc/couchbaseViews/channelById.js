/* Couchbase view to fetch channel(pagegroup) by channel id
   To be saved in _design/dev_app/_view/channelById
*/

// Code for map
function (doc, meta) {
  if(meta.id.substring(0, 4) === 'chnl') {
    emit(doc.id, doc)
  }
}

// Code for reduce