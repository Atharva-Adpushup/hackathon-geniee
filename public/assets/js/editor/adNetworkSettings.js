var _ = require("../libs/third-party/underscore"),
    CommonConsts = require("./commonConsts"),
    CryptoJS = require("../libs/third-party/crypto"),
    Utils = require("../libs/custom/utils");

function generateVariationName(tpl,adtype,height,width,len){
    var adtypes = CommonConsts.enums.adNetworks.adTypes,
    temp = tpl.split("_");
    tpl = (parseInt(temp[0].trim()) == ADP_SITE_ID) ? (temp.splice(0,1) && temp.join("_")) : tpl; //remove site id in from of template as we are already adding it below.

    switch(adtype){
        case adtypes.TEXT:
            adtype = "Txt";
            break;
        case adtypes.TEXT_IMAGE:
            adtype = "TxtImg";
            break;
        case adtypes.IMAGE:
            adtype = "Img";
            break;
        case adtypes.MULTIMEDIA:
            adtype = "Multimedia";
            break;
    }
    var a = ["AP",ADP_SITE_ID,tpl.split(" ").join("_"),adtype].join("_"),
        b = [width,height].join("X");

    return (len && len > 0) ? (a+"_"+b).substring(0,len) : (a+"_"+b);

}

var AdNetwork = (function (Utils, _, CommonConsts) {
    var consts = CommonConsts.enums.adNetworks;
    var AdNetwork = function (name, displayType, revenueType, maxAdsToDisplay, supportedAdTypes,supportedSizes) {
        this.name = name.toUpperCase();
        this.displayType = displayType || consts.displayType.BANNER;
        this.revenueType = revenueType || consts.revenueType.CPC;
        this.maxAdsToDisplay = maxAdsToDisplay || 3;
        this.supportedSizes = supportedSizes || [];
        this.supportedAdTypes = supportedAdTypes || [];
    }


    AdNetwork.prototype = {
        sizeExists: function (width, height) {
            return _(this.supportedSizes).find(function (sizeProps) {
                if (Utils.isArray(sizeProps.sizes) && _(sizeProps.sizes).findWhere({height: height, width: width})) {
                    return true;
                }
            })
        },
        layoutTypeExists: function (layoutType) {
            return consts.adLayout.hasOwnProperty(layoutType);
        },
        addSize: function (layoutType, width, height) {
            width = parseInt(width);height = parseInt(height);
            if (!this.layoutTypeExists(layoutType))
                throw new Error("Adlayout Type Not Supported");

            if (this.sizeExists(width, height))
                return true;

            var t = _(this.supportedSizes).findWhere({layoutType: layoutType})
            if (!t) {
                this.supportedSizes.push({layoutType: layoutType, sizes: [{height: height, width: width}]});
            } else {
                t.sizes.push({height: height, width: width});
            }
            return true;

        },
        
        addAdType: function (adType) {
            if (this.supportedAdTypes.indexOf(adType) == -1)
                this.supportedAdTypes.push(adType);

        },
        removeSize: function (layoutType, width, height) {
            if (this.sizeExists(width, height)) {
                this.supportedSizes[layoutType] = _(this.supportedSizes).reject(function (size) {
                    return (size.height == height && size.width == width && layoutType == layoutType);
                })
            }
            return true;
        },
        addAdtype: function (type) {
            if (this.supportedAdTypes.indexOf(type) == -1) {
                this.supportedAdTypes.push(type)
            }
            return true
        },
        removeAdType: function (type) {
            this.supportedAdTypes.splice(this.supportedAdTypes.indexOf(type, 1));
            return true;
        },
        setDisplayType: function (displayType) {
            if (!consts.displayType.hasOwnProperty(displayType)) {
                throw new Error("Display Type Not Supported");
            }
            this.displayType = displayType;
        },
        setRevenueType: function (revenueType) {
            if (!consts.revenueType.hasOwnProperty(revenueType)) {
                throw new Error("Revenue Type Not Supported");
            }
            this.revenueType = revenueType;
        },
        toJSON: function () {
            return {
                name: this.name,
                displayType: this.displayType,
                revenueType: this.revenueType,
                maxAdsToDisplay: this.maxAdsToDisplay,
                supportedSizes: this.supportedSizes,
                supportedAdTypes: this.supportedAdTypes
            }
        }

    }

    return AdNetwork;

})(Utils, _, CommonConsts);

var AdsenseColorTpl = (function (Utils) {
    var AdsenseColorTpl = function (name, border, title, background, text, url, id) {
        this.id = id || Utils.getRandomNumber();
        this.name = name;
        this.border = border;
        this.title = title;
        this.background = background;
        this.text = text;
        this.url = url;
    }
    AdsenseColorTpl.prototype.toJSON = function () {
        return {
            id: this.id,
            name: this.name,
            borderColor: this.border,
            titleColor: this.title,
            backgroundColor: this.background,
            textColor: this.text,
            urlColor: this.url
        }
    }

    AdsenseColorTpl.load = function (json) {
        return new AdsenseColorTpl(json.name, json.borderColor, json.titleColor, json.backgroundColor, json.textColor, json.urlColor, json.id);
    }

    return AdsenseColorTpl;

})(Utils);

var AdsenseAd = (function (Utils, AdsenseColorTpl, CryptoJS) {
    var AdsenseAd = function (json) {
        this.id = json.id || Utils.getRandomNumber();
        this.borderColor = json.borderColor;
        this.titleColor = json.titleColor;
        this.backgroundColor = json.backgroundColor;
        this.textColor = json.textColor;
        this.urlColor = json.urlColor;
        this.size = json.size; //{height:some,width:some}
        this.impressions = json.impressions || 0;
        this.clicks = json.clicks || 0;
        this.adType = json.adType;
        this.css = json.css || {};
        this.height=json.size.height;
        this.width=json.size.width;
        this.network = "ADSENSE";
        this.variationName = generateVariationName(json.name,this.adType,this.height,this.width,40);//CryptoJS.MD5(ADP_SITE_ID + this.network + this.borderColor + this.titleColor + this.backgroundColor + this.textColor + this.urlColor + this.width + this.height + this.adType).toString();
        this.tplName = json.tplName;
    }

    AdsenseAd.loadAdFromJson = function (json) {
        return new AdsenseAd(json);
    }

    AdsenseAd.loadAdFromIngrediants = function (size, adType, adsenseColorTpl) {
        if (!(adsenseColorTpl instanceof AdsenseColorTpl)) {
            throw new error("Second argument ,ust be instance of AdsenseColorTpl");
        }
        var json = adsenseColorTpl.toJSON();
        json.size = {width: size.width, height: size.height};
        json.css = size.css;
        json.adType = adType;
        json.tplName = json.name;
        return new AdsenseAd(json);
    }


    AdsenseAd.prototype.toJSON = function () {
        return {
            id: this.id,
            network: this.network,
            borderColor: this.borderColor,
            titleColor: this.titleColor,
            backgroundColor: this.backgroundColor,
            textColor: this.textColor,
            urlColor: this.urlColor,
            size: this.size,
            width:this.width,
            height:this.height,
            css: JSON.stringify(this.css),
            impressions: this.impressions,
            clicks: this.clicks,
            adType: this.adType,
            variationName: this.variationName,
            tplName: this.tplName
        }
    }

    return AdsenseAd;
})(Utils, AdsenseColorTpl, CryptoJS);

var Adsense = (function (Utils, AdNetwork, CommonConsts) {
    var consts = CommonConsts.enums.adNetworks,
        //supportedTypes = ['text', 'text_image', 'image']; // image ads rejected for now ad google is doing something
        supportedTypes = [consts.adTypes.TEXT, consts.adTypes.TEXT_IMAGE];

    var Adsense = function (sizes, types, noOfAds, pubId, email) {
        var computedSizesConsts = _.reject(consts.commonSupportedSizes, {"layoutType": "CUSTOM"});
        AdNetwork.call(this, "ADSENSE", consts.displayType.BANNER, consts.revenueType.CPC, noOfAds);
        
        this.supportedSizes = _.union(computedSizesConsts, sizes);
        this.supportedAdTypes = _.union(types, supportedTypes);
        if(!_(this.supportedSizes).filter({layoutType:"CUSTOM"}).length){
            this.supportedSizes.push({
                layoutType: 'CUSTOM',
                sizes: []
            });
        }
        this.pubId = pubId || null;
        this.email = email || null;
    }

    Adsense.prototype = Object.create(AdNetwork.prototype, {
        constructor: {value: Adsense}
    })

    Adsense.loadAdFromJson = function (json) {
        return new Adsense(json.supportedSizes, json.supportedAdTypes, json.maxAdsToDisplay,json.pubId,json.email);
    }

    Adsense.prototype.toJSON = function () {
        var json = AdNetwork.prototype.toJSON.call(this);
        json.pubId = this.pubId,
        json.email = this.email;
        return json;
    }
    
    /**
     * Method: toServerJSON
     * Objective: Specifically designed for siteStore's toJSON,
     * perform the following manipulations:
     * - Remove 'supportedAdTypes' property
     * - Filter out supportedSizes to only custom layout
     * Author: Zahin Omar Alwa
     */
    Adsense.prototype.toServerJSON = function () {
        var json = this.toJSON();
        
        json.supportedSizes = _(json.supportedSizes).filter({layoutType: "CUSTOM"});
        json.supportedAdTypes ? delete json.supportedAdTypes : "";
        
        return json;
    }
    
    return Adsense;
})(Utils, AdNetwork, CommonConsts);

var CustomAdVariation = (function (Utils, CryptoJS) {
    var CustomAdVariation = function (networkName, json) {
        this.name = json.name.toUpperCase();
        this.height = json.height;
        this.width = json.width;
        this.code = json.code;
        this.custom = true;
        this.adType = json.adType;
        this.network = json.network || networkName;
        this.variationName = json.variationName || generateVariationName(this.network+"_"+this.name,this.adType,this.height,this.width,0)//CryptoJS.MD5(this.network + ADP_SITE_ID + this.height + this.width + this.code + this.adType).toString();
    }

    CustomAdVariation.loadAdFromJson = function (json) {
        return new CustomAdVariation(json.network,json);
    }

    CustomAdVariation.prototype.toJSON = function () {
        return {
            name: this.name,
            height: this.height,
            width: this.width,
            code: this.code,
            custom: true,
            adType: this.adType,
            network: this.network,
            variationName: this.variationName
        }
    }

    CustomAdVariation.prototype.edit = function (code) {
        this.code = code;
    }

    return CustomAdVariation;
})(Utils, CryptoJS);


var CustomAdNetwork = (function (Utils, CryptoJS, CustomAdVariation, AdNetwork) {
    var CustomAdNetwork = function (json) {
        AdNetwork.call(this, json.name, json.displayType, json.revenueType, json.maxAdsToDisplay, json.supportedAdTypes,json.supportedSizes);
        this.variations = [];
    }
    CustomAdNetwork.prototype = Object.create(AdNetwork.prototype, {
        constructor: {value: CustomAdNetwork}
    })

    CustomAdNetwork.loadAdFromJson = function (json) {
        var n = new CustomAdNetwork(json);
        _(json.variations).each(function(variationJson){
            n.variations.push(CustomAdVariation.loadAdFromJson(variationJson))
        })
        return n;
        /*n.ads = json.ads;
         n.availableSizes = json.availableSizes;
         n.adTypes = json.adTypes;
         return n;*/
    }

    CustomAdNetwork.prototype.findVariation = function (md5) {
        return _(this.variations).findWhere({variationName: md5});
    }

    CustomAdNetwork.prototype.findVariationsBySizeAndAdType = function (width, height, adType) {
        return _(this.variations).filter({adType: adType, width: width, height: height});
    }

    CustomAdNetwork.prototype.addVariation = function (variation, layout) {
        this.addSize(layout, variation.width, variation.height);
        if (!this.findVariation(variation.variationName)) {
            this.variations.push(variation);
        }
    }

    CustomAdNetwork.prototype.removeVaraition = function (md5) {
        this.variations = _(this.variations).reject({variationName: md5});
    }

    CustomAdNetwork.prototype.toJSON = function () {
        var json = AdNetwork.prototype.toJSON.call(this);
        json.variations = [];
        this.variations.forEach(function(variation){
            json.variations.push(variation.toJSON());
        })
        return json;
    }

    return CustomAdNetwork;
})(Utils, CryptoJS, CustomAdVariation, AdNetwork);

module.exports = (function (a, b, c, d, e) {
    return {
        AdsenseColorTpl: a,
        AdsenseAd: b,
        CustomAdNetwork: c,
        CustomAdVariation: d,
        Adsense: e
    }
})(AdsenseColorTpl, AdsenseAd, CustomAdNetwork, CustomAdVariation, Adsense);