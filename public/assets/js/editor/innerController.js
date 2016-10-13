var $ = require('libs/third-party/jquery'),
    Selectorator = require("libs/custom/cssSelectorator"),
    ComponentCollection = require("innerMain.jsx"),
    CryptoJS = require("libs/third-party/crypto"),
    _ = require("libs/third-party/underscore"),
    Messenger = require("libs/custom/messenger"),
    Utils = require("libs/custom/utils"),
    Event = require("libs/custom/event"),
    DataSyncService = require("./dataSyncService"),
    Document = require("./document"),
    React = window.React;

var AdpElement = (function($, Selectorator) {

    function getInsertOptions(el) {
        switch (el.nodeName.toLowerCase()) {
            case "table":
            case "ul":
            case "img":
            case "input":
            case "textarea":
            case "button":
            case "embed":
                return ["Insert After", "Insert Before"]
                break;

            case "li":
            case "td":
                return ["Append", "Prepend"]
                break;

            default:
                return ["Append", "Prepend", "Insert After", "Insert Before"];
        }
    }

    var AdpElement = function($el) {
        this.selectorator = new Selectorator();
        this.$el = $el;
        this.selector = this.selectorator.generate($el)[0];
        //        this.allXpaths = this.selectorator.generateAllSelectors($el);
        this.parents = [{ xpath: this.selector, tagName: this.$el.prop("tagName") }];
        this.insertOptions = getInsertOptions(this.$el.get(0));

        this.$el.parents().each(function(index, parent) {
            if (parent.tagName !== "HTML" && parent.tagName !== "BODY")
                this.parents.push({
                    xpath: this.selectorator.generate($(parent))[0],
                    tagName: parent.tagName
                });
        }.bind(this));
    };

    AdpElement.prototype.menuRenderPosition = function() {
        var elem = this.$el.get(0),
            menuWidth = 400, top, left,
            halfScreenWidth = ($(window).width()) / 2,
            halfScreenHeight = ($(window).height()) / 2,
            elmVitals = elem.getBoundingClientRect();

        left = elmVitals.left > halfScreenWidth ? elmVitals.left : elmVitals.right;

        if (elmVitals.top < 1) {
            top = 0
        } else if ((elmVitals.top > halfScreenHeight) || (elmVitals.bottom > window.screen.availHeight)) {
            top = elmVitals.top
        } else {
            top = elmVitals.bottom
        }

        return { top: top, left: left }

    }

    AdpElement.prototype.selectParent = function() {
        this.childrenArr.push(this.$el);

        this.$el = this.$el.parent();
        this.selector = this.selectorator.generate(this.$el)[0];
    };

    AdpElement.prototype.selectChild = function() {
        this.$el = this.childrenArr.pop();
        this.selector = this.selectorator.generate(this.$el)[0];
    };

    AdpElement.prototype.toJSON = function() {
        return {
            xpath: this.selector,
            parents: this.parents,
            insertOptions: this.insertOptions,
            tagName: this.$el.prop("tagName")
        }
    };

    return AdpElement;
})($, Selectorator);

var HighlighterBox = (function(React, CC, $, Selectorator) {
    var HighlighterBox = function() {
        this.HB = null;
        this.adpElement = null;
    };

    HighlighterBox.prototype.setAdpElement = function(elem) {
        this.adpElement = elem;
    };

    HighlighterBox.prototype.setActiveElem = function($elem) {
        this.activeElement = $elem;

        var offset = $elem.offset();

        this.HB.setStyle({
            top: offset.top,
            left: offset.left,
            width: $elem.outerWidth(),
            height: $elem.outerHeight()
        });
    };

    HighlighterBox.prototype.hide = function() {
        this.HB.setStyle({
            width: 0,
            height: 0
        });
    };

    HighlighterBox.prototype.initHighlighter = function() {
        var container = $("<div />").insertAfter("body").get(0);
        this.HB = React.render(React.createElement(CC.HighlighterBox), container);
    };

    return HighlighterBox;
})(React, ComponentCollection, $, Selectorator);

var AdBox = (function(React, $, CC) {

    var biggestHeight = function($el) {
        var biggestHeight = 0;

        $el.children().each(function() {
            // If this elements height is bigger than the biggestHeight
            if ($(this).height() > biggestHeight) {
                // Set the biggestHeight to this Height
                biggestHeight = $(this).height();
            }
        });

        return biggestHeight;
    };

    var AdBox = function(audienceId, width, height, parent, clickHandler, css) {
        this.adWidth = parseInt(width);
        this.adHeight = parseInt(height);
        this.audienceId = parseInt(audienceId);
        this.parent = parent;
        this.css = css || {};
        this.id = this.adWidth + "_" + this.adHeight + "_" + this.audienceId;
        this.clickHandler = clickHandler;
    };

    AdBox.prototype.hide = function() {
        this.reactEl.hide();
    };

    return AdBox;
})(React, $, ComponentCollection);

var Section = (function(Utils, CryptoJS, $, AdBox, Event, CC, React, _) {
    var Section = function(id, selector, operation, sectionData) {
        this.id = id;
        this._selector = selector;
        this.operation = operation;
        this.sectionData = sectionData;
        this.adBoxes = [];
        this.onAdClick = new Event();
        this.onXpathMiss = new Event();
        this.sectionMd5 = CryptoJS.MD5(this._selector + this.operation).toString();
        this.selectorator = new Selectorator();
        this.$el = $("<div/>", { 'data-apid': "_adbox_selector_" + this.id }).css({ position: 'relative', clear: "both", "pointer-events": "none" });
        this.injectSection();

    }

    Section.prototype.injectSection = function() {
        if (this.operation === "Insert Before")
            this.$el.insertBefore($(this._selector));
        else if (this.operation === "Insert After")
            this.$el.insertAfter($(this._selector));
        else if (this.operation === "Append")
            $(this._selector).append(this.$el);
        else
            $(this._selector).prepend(this.$el);
    }

    Section.prototype.getMaxDimensions = function() {
        var d = { width: 0, height: 0 };
        if (this.adBoxes.length) {
            var ad;
            ad = _.max(this.adBoxes, function(ad) { return ad.adWidth + (parseInt(ad.css['margin-right']) || 0) + (parseInt(ad.css['margin-left']) || 0) });
            d.width = ad.adWidth + (parseInt(ad.css['margin-right']) || 0) + (parseInt(ad.css['margin-left']) || 0);
            ad = _.max(this.adBoxes, function(ad) { return ad.adHeight + (parseInt(ad.css['margin-top'])) || 0 + (parseInt(ad.css['margin-bottom']) || 0) });
            d.height = ((parseInt(ad.adHeight) + (parseInt(ad.css['margin-top'])) || 0) + ((parseInt(ad.css['margin-bottom']) || 0)));
        }
        return d;
    }

    Section.prototype.getAllXpaths = function() {
        if (!this.allXpaths)
            this.allXpaths = this.selectorator.generateAllSelectors($(this._selector));
        return this.allXpaths;
    }


    Section.prototype.render = function() {
        var d = this.getMaxDimensions();
        if (!this.adBoxes.length) {
            this.remove();
        }
        if (!this.$el.length) {
            this.onXpathMiss.fire(this.id, this._selector);
            return false;
        }

        this.reactEl = React.render(React.createElement(CC.Section, {
            width: d.width,
            sectionData: this.sectionData,
            height: d.height,
            ads: this.adBoxes
        }), this.$el.get(0));

        this.$el.css({ width: "100%", height: d.height });
    }

    Section.prototype.adClicked = function(width, height, audienceId, event) {
        this.onAdClick.fire(this.id, audienceId, width, height, event.clientX, event.clientY)
        event.preventDefault();
        event.stopPropagation();
    }

    Section.prototype.remove = function() {
        React.unmountComponentAtNode(this.$el.get(0));
        this.$el.remove();
    }

    Section.prototype.findAd = function(audienceId, width, height) {
        return _(this.adBoxes).findWhere({ audienceId: parseInt(audienceId), adWidth: parseInt(width), adHeight: parseInt(height) });
    }

    Section.prototype.insertAd = function(audienceId, width, height, css) {
        this.adBoxes.push(new AdBox(audienceId, width, height, this.$el.get(0), this.adClicked.bind(this, width, height, audienceId), css));
        this.render();
    }

    Section.prototype.applyCss = function(audienceId, width, height, css) {
        var ad = this.findAd(audienceId, width, height);
        ad.css = css;
        this.render()
    }

    Section.prototype.removeAd = function(audienceId, width, height) {
        this.adBoxes = _(this.adBoxes).reject({ audienceId: parseInt(audienceId), adWidth: parseInt(width), adHeight: parseInt(height) });
        this.render();
    }

    Section.prototype.updateXpath = function(xpath) {
        if ($(xpath).length) {
            this.remove();
            this._selector = xpath;
            this.allXpaths = this.selectorator.generateAllSelectors($(this._selector));
            this.injectSection();
            this.render();
            return true;
        } else {
            alert("Xpath doesn't exists");
            return false;
        }
    }

    return Section;
})(Utils, CryptoJS, $, AdBox, Event, ComponentCollection, React, _);

module.exports = (function($, Document, Messenger, HighlighterBox, DataSyncService, AdpElement, AdBox, Section, React) {

    var Controller = function() {
        this.sections = [];
        this.$incontentEl = null;
        this.$incontentCover = null;
        this.messenger = new Messenger();
        this.document = new Document();
        this.document.onClick.bind(this.handleClick, this);
        this.document.onMouseLeave.bind(this.handleMouseLeave, this);
        this.document.onMouseMove.bind(this.handleMouseMove, this);
        this.document.onReady.bind(this.handleReady, this);
        this.document.onMouseOver.bind(this.handleMouseOver, this);
        this.messenger.onMessage.bind(this.handleMessage, this);

        this.HB = new HighlighterBox();
        this.HB.initHighlighter();

        if (/comp|inter|loaded/.test(document.readyState)) {
            this.document.onReady.fire();
        } else {
            var isCustomDocumentFired = false;
            document.addEventListener("DOMContentLoaded", function(event) {
                if (!isCustomDocumentFired) {
                    isCustomDocumentFired = true;
                    this.document.onReady.fire();
                }
            }.bind(this));

            $(document).ready(function(){
                if (!isCustomDocumentFired) {
                    isCustomDocumentFired = true;
                    this.document.onReady.fire();
                }
            }.bind(this))
        }
    };


    Controller.prototype.handleReady = function() {
        this.messenger.sendMessage(ADP.enums.messenger.CM_FRAMELOAD_SUCCESS, {
            channelId: window.ADP_CHANNEL_ID
        });

    };

    Controller.prototype.handleClick = function($target, event) {
        if ($target.get(0).tagName == "HTML" || $target.get(0).tagName == "BODY" || $target.hasClass("_ap_reject")) {
            this.HB.hide();
            return false;
        }

        var elem = new AdpElement($target),
            position = elem.menuRenderPosition();

        this.HB.setAdpElement(elem);

        if (!$target.hasClass("_APD_highlighter")) {
            this.messenger.sendMessage(ADP.enums.messenger.SHOW_INSERT_CONTEXTMENU, {
                clientX: position.left,
                clientY: position.top,
                parents: elem.parents,
                insertOptions: elem.insertOptions
            });
        }
    };

    Controller.prototype.handleMouseMove = function($el) {
        if ($el.get(0).tagName == "HTML" || $el.get(0).tagName == "BODY" || $el.hasClass("_ap_reject")) {
            this.HB.hide();
            return false;
        }
        this.HB.setActiveElem($el);
        //below code will make things very slow
        /*var adpEl = new AdpElement($el)
        this.messenger.sendMessage(ADP.enums.messenger.ACTIVE_ELEMENT_INFO, {
            info: adpEl.toJSON()
        });*/


    };

    Controller.prototype.handleMouseLeave = function(el) {
        //this.HB.hide();
    };

    Controller.prototype.handleMouseOver = function(el) {
    };

    Controller.prototype.getSection = function(id) {
        return _(this.sections).findWhere({ id: id });
    };



    Controller.prototype.adClicked = function(sectionId, audienceId, width, height, x, y) {
        this.messenger.sendMessage(ADP.enums.messenger.SHOW_EDIT_CONTEXTMENU, {
            clientX: x,
            clientY: y,
            audienceId: parseInt(audienceId),
            sectionId: sectionId,
            adSize: { width: width, height: height }
        });
    }

    Controller.prototype.sectionNotFound = function(sectionId, selector) {
        this.messenger.sendMessage(ADP.enums.messenger.SECTION_XPATH_MISSING, {
            id: sectionId,
            xpath: selector
        });
    }

    Controller.prototype.handleContentArea = function(selector) {
        if (this.$incontentEl && this.$incontentEl.length) {
            this.$incontentEl.css({ "-webkit-filter": "", "border": "", "pointer-events": "" });
        }
        if (this.$incontentCover && this.$incontentCover.length) {
            this.$incontentCover.remove();
        }

        this.$incontentEl = (selector == "[id^=_ap_wp_content_start]") ? $(selector).parent("div") : $(selector);
        if (!this.$incontentEl.length)
            return false

        this.$incontentEl.css({ "-webkit-filter": "blur(5px)", "border": "dotted 2px red", "pointer-events": "none" });
        var pos = this.$incontentEl.offset(),
            coverWidth = (90 * this.$incontentEl.width()) / 100;

        this.$incontentCover = $("<div/>", {
            'id': "_ap_incontentCover",
            class: "_ap_reject",
            'text': "Incontent Settings"
        }
        ).css({
            position: 'absolute',
            width: coverWidth,
            height: 200,
            background: "rgba(0,0,0,.5)",
            "z-index": 10,
            color: "#FFFFFF",
            "pointer-events": "none",
            top: pos.top + 50,
            left: pos.left + ((this.$incontentEl.width() - coverWidth) / 2)
        });
        //$("body").append(this.$incontentCover);

    }


    Controller.prototype.handleMessage = function(cmd, data) {
        var isEnvironmentProduction = (window.ADP_ENVIRONMENT === 'production');

        switch (cmd) {
            case ADP.enums.messenger.HIGHLIGHT_ELEMENT:
                this.HB.setActiveElem($(data));
                break;

            case ADP.enums.messenger.HIGHLIGHT_ADBOX:
                var section = this.getSection(data.sectionId),
                    ad = section.findAd(data.audienceId, data.width, data.height),
                    $el = $(React.findDOMNode(section.reactEl.refs[ad.id])).find("div");
                this.HB.setActiveElem($el);


                break;

            case ADP.enums.messenger.SELECT_ELEMENT:

                var selectedElem = $(data);
                var leftOffset = selectedElem.offset().left;

                var elem = new AdpElement(selectedElem);

                this.HB.setAdpElement(elem);
                this.messenger.sendMessage(ADP.enums.messenger.SHOW_INSERT_CONTEXTMENU, {
                    clientX: leftOffset,
                    selector: elem.selector,
                    parents: elem.parents,
                    insertOptions: elem.insertOptions
                });

                break;

            case ADP.enums.messenger.INSERT_AD:
                var section = this.getSection(data.sectionId);
                if (!section) {
                    if (!$(data.selector).length) {
                        this.sectionNotFound(data.sectionId, data.selector)
                        return false;
                    } else {
                        section = new Section(data.sectionId, data.selector || this.HB.adpElement.selector, data.operation, data.sectionData);
                        section.onAdClick.bind(this.adClicked, this);
                        section.onXpathMiss.bind(this.sectionNotFound, this)
                        this.sections.push(section);
                    }
                }

                section.insertAd(data.audienceId, data.adSize.width, data.adSize.height, data.adSize.css);

                var ad = section.findAd(data.audienceId, data.adSize.width, data.adSize.height),
                    $adEl = section.$el.find("#" + ad.id);

                this.HB.hide();
                this.document.scrollElementToScreen($adEl);
                this.messenger.sendMessage(ADP.enums.messenger.LAST_AD_VITALS, {
                    sectionId: data.sectionId,
                    adId: ad.id,
                    audienceId: data.audienceId,
                    vitals: $adEl.get(0).getBoundingClientRect()
                });

                break;

            case ADP.enums.messenger.APPLY_CSS:
                var section = this.getSection(data.sectionId);
                if (!section) {
                    return false
                }

                section.applyCss(data.audienceId, data.adSize.width, data.adSize.height, data.css);
                break;

            case ADP.enums.messenger.REMOVE_AD:
                var section = this.getSection(data.sectionId);
                if (!section)
                    return false;
                section.removeAd(data.audienceId, data.size.width, data.size.height);

                if (!section.adBoxes.length) {
                    this.sections.splice(this.sections.indexOf(section), 1);
                }
                break;

            case ADP.enums.messenger.HIDE_AD:
                var adBox = _(this.adBoxes).where({
                    sectionId: data.sectionId,
                    audienceId: data.audienceId,
                    adWidth: data.adWidth,
                    adHeight: data.adHeight
                });
                adBox[0].hide();
                break;

            case ADP.enums.messenger.CHANGE_EDITOR_MODE:
                this.HB.hide();
                this.document.changeEditorMode(data.mode);
                break;

            case ADP.enums.messenger.PREPARE_IN_CONTENT_AREA:
                this.HB.hide();
                this.handleContentArea(data.selector)
                break;

            case ADP.enums.messenger.INJECT_ADRECOVERJS:
                var script = document.createElement('script'),
                    adRecoverEditorStr = isEnvironmentProduction ? 'adRecoverEditor-build.min.js' : 'adRecoverEditor-build.js',
                    currentBaseUrl = (window.ADP_BASEURL.split(":")), baseUrlWithoutProtocol;
                    currentBaseUrl.splice(0, 1);
                    // Check added for urls like http://localhost:8080
                    // or https://app.adpushup.com
                    baseUrlWithoutProtocol = ((currentBaseUrl.length == 2) && !isNaN(currentBaseUrl[1])) ? currentBaseUrl.join(":") : currentBaseUrl[0];

                script.src = baseUrlWithoutProtocol + "/assets/js/build/" + adRecoverEditorStr;
                document.getElementsByTagName('head')[0].appendChild(script);
                break;

            case ADP.enums.messenger.SCROLL_SECTION_TO_SCREEN:
                var section = this.getSection(data.sectionId);
                if (!section)
                    return false;

                this.document.scrollElementToScreen(section.$el);
                this.HB.setActiveElem(section.$el)
                break;

            case ADP.enums.messenger.GET_SECTION_ALTERNATE_XPATHS:
                var section = this.getSection(data.sectionId);

                this.messenger.sendMessage(ADP.enums.messenger.SECTION_ALL_XPATHS, {
                    id: data.sectionId,
                    allXpaths: (!section ? [] : section.getAllXpaths())
                });
                break;

            case ADP.enums.messenger.TRY_EDITING_XPATH:

                var section = this.getSection(data.sectionId);
                if (section) {
                    if (section.updateXpath(data.newXpath)) {
                        this.messenger.sendMessage(ADP.enums.messenger.SECTION_ALL_XPATHS, {
                            id: data.sectionId,
                            xpath: data.newXpath,
                            allXpaths: section.getAllXpaths()
                        });
                    }
                }
                break;

        }
    };

    return Controller;
})($, Document, Messenger, HighlighterBox, DataSyncService, AdpElement, AdBox, Section, React);
