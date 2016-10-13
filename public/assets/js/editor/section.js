var Utils = require("libs/custom/utils"),
    CommonConsts = require("../commonConsts"),
    Stores = CommonConsts.enums.stores,
    CryptoJS = require("libs/third-party/crypto");

module.exports = (function (Utils, CryptoJS) {

    var Section = function (name, channelId, xpath, operation) {
        this.id = Utils.getRandomNumber();
        this.xpath = xpath;
        this.operation = operation;
        this.channelId = channelId;
        this.name = name || "Section_" + Utils.getRandomNumber();
        this.sectionMd5 = CryptoJS.MD5(this.xpath+this.operation).toString();
    }

    Section.prototype.audianceExists = function (audienceId) {
        return this.segments.indexOf(audienceId) == -1;
    }

    Section.prototype.setSectionName = function (name) {
        this.name = name;
    }

    Section.prototype.setXpath = function (xpath) {
        this.xpath = xpath;
        this.sectionMd5 = CryptoJS.MD5(this.xpath+this.operation).toString();
    }

    Section.prototype.getActionByKey = function (audienceId, key) {
        var actions = this.segments[audienceId];
        if (!actions) return null;
        return actions[key];
    }

    Section.prototype.toJSON = function (flux) {
        return {
            id: this.id,
            xpath: this.xpath,
            operation: this.operation,
            channelId: this.channelId,
            name: this.name,
            ads:flux.store(Stores.ACTION_STORE).getSectionAds(this.id,this.channelId),
            actions: flux.store(Stores.ACTION_STORE).sectionActionsToJSON(this.id)
        }
    }
})( Utils, CryptoJS );
