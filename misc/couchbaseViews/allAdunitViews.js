function(doc, meta) {
    var docType = meta.id.substr(0, 4);
    if (docType == "aplt") {
        var ads = doc.adUnits;
        for (var i = 0; i < ads.length; i++) {
            var ad = ads[i];
            ad.siteId = doc.siteId
            emit(meta.id, ad);
        }
    } else if (docType == "amtg") {
        var ad = doc.ad;
        if (!ad) {
            return;
        }
        emit(meta.id, ad);
    }
    else if ((docType == "tgmr" || docType == "fmrt" || docType == "ampd") && doc.siteId && doc.ads && doc.ads.length) {
        var ads = doc.ads;
        for (var i = 0; i < ads.length; i++) {
            var ad = ads[i];
            ad.siteId = doc.siteId;
            ad.siteDomain = doc.siteDomain;
            emit(meta.id, ad);
        }
    }
    else if (docType == "chnl" && doc.siteId && doc.variations) {
        var variations = doc.variations
        for (var vid in variations) {
            var sections = variations[vid].sections;
            if (!sections) {
                continue;
            }
            for (var sid in sections) {
                var ads = sections[sid].ads;
                if (!ads) {
                    continue;
                }
                for (var adId in ads) {
                    var ad = ads[adId]
                    ad.siteId = doc.siteId;
                    ad.siteDomain = doc.siteDomain;
                    ad.adId = adId;
                    emit(meta.id, ad);
                }
            }
        }
    }
}