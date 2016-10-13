function(doc, meta) {


    if (meta.id.substr(0, 4) == "urlm") {
        var key = new Array(7);
        var autoAnalysis = {};
        var autoAnalysisRetries = doc.autoAnalysis.retriesDone;
        if (autoAnalysisRetries == null) {
            autoAnalysisRetries = -1;
        }

        var incontentSectionsConsidered = 0;
        for (var i = 0; i < doc.incontentSections.length; i++) {
            var section = doc.incontentSections[i];
            if (section.adSizes) {
                incontentSectionsConsidered++;
            }
        }

        key[0] = doc.siteId;
        key[1] = doc.pageGroup;
        key[2] = doc.platform;
        key[3] = incontentSectionsConsidered; //doc.incontentSections.length;
        key[4] = autoAnalysisRetries;
        key[5] = doc.urlFull.substring(0, 150); // can't allow crazy long urls sorry
        key[6] = meta.id;

        autoAnalysis.lastTried = doc.autoAnalysis.lastTried;
        autoAnalysis.dateAnalyzed = doc.autoAnalysis.dateAnalyzed;

        emit(key, { "autoAnalysis": autoAnalysis });
    }


}