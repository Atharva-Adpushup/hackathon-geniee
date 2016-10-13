var map = 

function (doc, meta) 
{
  if(meta.id.substr(0,4) == "site")
  {
    var isAdsense = false;
    var isWordpress = false;
    var dateCreated = null;
    
    try
    {
      for(var i=0; i<doc.adNetworks.length; i++)
      {
          if(doc.adNetworks[i].name === 'ADSENSE')
          {
           isAdsense = true; break; 
          }
      }
      
      if(doc.cmsInfo.cmsName.toLowerCase() === 'wordpress')
      {
        isWordpress = true; 
      }
      
      dateCreated = doc.dateCreated;
      
    }
    catch(e)
    {
      
    }
    
    
    var val = {
      siteDomain : doc.siteDomain,
      ownerEmail : doc.ownerEmail,
      isAdsense : isAdsense,
      isWordpress : isWordpress,
      dateCreated : dateCreated,
      apConfigs : doc.apConfigs
    }
    
    emit(doc.siteId, val);
  }
}