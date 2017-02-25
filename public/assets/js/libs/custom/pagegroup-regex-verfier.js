// Pagegroup matching module script

$(document).ready(function () {
    (function (w, d) {
        // Intializing tooltip
        $('[data-toggle="tooltip"]').tooltip();

        // Pagegroup matching module object
        var pgModule = {

            pagegroupPatterns: [],

            fetchPageGroups: function() {
                var pagegroupPatternValues = $('input[name="pageGroupPattern"]'),
                    that = this;
                pagegroupPatternValues.each(function() {
                    var pgValue = $(this).val();
                    if(pgValue && pgValue.trim() != '') {
                        that.pagegroupPatterns.push($(this).val());
                    } 
                });
            },
            crossPageGroupTest: function(alreadyMatchedPattern, url, errorBox) {
                var response;
                $.each(this.pagegroupPatterns, function(k, v) {
                    if(v != alreadyMatchedPattern) {
                        var pagegroupTest = new RegExp(v, 'i');
                        response = pagegroupTest.test(url);
                    }
                });
                return response ? !response : undefined;
            },
            pagegroupPatternMatch: function(fields, pattern, errorBox, mainErrorBox) {
                var response,
                    that = this;
                    errorBox.html(' ');
                if(pattern && pattern.trim() != '') {
                    var patternTest = new RegExp(pattern, 'i');
                    fields.each(function() {
                        var field = $(this),
                            inputUrl = field.val(),
                            span = field.closest('div.input-group').find('span');

                        if (inputUrl && inputUrl.trim() != '') {
                            response = patternTest.test(inputUrl);
                            var crossResponse = that.crossPageGroupTest(pattern, inputUrl, errorBox),
                                i = span.find('i');
                            if(crossResponse == undefined) {
                                response = response;
                            } else {
                                response = crossResponse;
                                i.attr('data-original-title', 'Current url satifies more than one Pagegroup pattern');
                                i.addClass('failure-cross');
                            }
                            if (response) {
                                if(i.hasClass('fa-times')) {
                                    i.addClass('fa-check');
                                    i.removeClass('fa-times');
                                    i.removeClass('failure');
                                    i.removeClass('failure-cross');
                                    field.removeClass('border-failure');
                                }
                                i.attr('data-original-title', 'All well here');
                                i.addClass('success');
                                field.addClass('border-success');
                            } else {
                                i.removeClass('fa-check');
                                i.addClass('fa-times');
                                i.addClass('failure');
                                i.removeClass('success');
                                field.addClass('border-failure');
                                field.removeClass('border-success');
                            }
                            if(!mainErrorBox.hasClass('hidden')) {
                                mainErrorBox.addClass('hidden');
                            }
                            span.removeClass('invisible');
                        } else {
                            if (!span.hasClass('invisible')) {
                                span.addClass('invisible');
                            }
                            field.removeClass('border-failure');
                            field.removeClass('border-success');
                        }
                    });
                } else {
                    fields.each(function() {
                        var field = $(this),
                            url = field.val(),
                            span = field.closest('div.input-group').find('span'),
                            i = span.find('i');

                        if (url && url.trim() != '') {
                            i.removeClass('fa-check');
                            i.addClass('fa-times');
                            i.addClass('failure');
                            i.removeClass('success');
                            field.addClass('border-failure');
                            field.removeClass('border-success');
                            span.removeClass('invisible');
                            mainErrorBox.html('<p>All Pagegroups with corresponding urls must have a pattern</p>');
                            mainErrorBox.removeClass('hidden');
                        } else {
                            span.addClass('invisible');
                            field.removeClass('border-success');
                            field.removeClass('border-failure');
                        }
                    });
                }
            },
        };

        // Pagegroup pattern verfication trigger main
        $('.pg-verify-btn').on('click', function(e) {
            e.preventDefault();
            pgModule.pagegroupPatterns = [];
            pgModule.fetchPageGroups();
            var allPageGroups = $('.single-pagegroup-box'),
                mainErrorBox = $('.main-error-box');
                mainErrorBox.html(' ');
            allPageGroups.each(function() {
                var pagegroupBox = $(this),
                    pagegroupPattern = pagegroupBox.find('input[name="pageGroupPattern"]').val(),
                    errorBox = pagegroupBox.find('.error-box'),
                    urlFields = pagegroupBox.find('.pg-url');

                pgModule.pagegroupPatternMatch(urlFields, pagegroupPattern, errorBox, mainErrorBox);
            });
        });

        // Update input field UI state on type
        $('.pg-url').on('keyup', this, function(e) {
            var field = $(this),
                inputUrlParentBox = field.closest('.pagegroup-col'),
                span = field.closest('div.input-group').find('span');

                field.hasClass('border-success') ? field.removeClass('border-success') : field.removeClass('border-failure');
                span.addClass('invisible');
        });

    })(window, document);
});