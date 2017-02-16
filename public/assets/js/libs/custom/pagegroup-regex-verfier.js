// Pagegroup matching module script

$(document).ready(function () {
    (function (w, d) {

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
                $.each(this.pagegroupPatterns, function(i, v) {
                    if(v != alreadyMatchedPattern) {
                        var pagegroupTest = new RegExp(v);
                        response = pagegroupTest.test(url);
                        console.log(v + ' : ' + url + ' : ' + response);
                        if(response) {
                            errorBox.append('<p>Given url satifies more than one pagegroup pattern</p>');
                            return false;
                        }
                    }
                });
                return response ? !response : undefined;
            },
            createPagegroupTest: function(patternText) {
            },
            pagegroupPatternMatch: function(fields, pattern, errorBox) {
                var response,
                    that = this;
                    errorBox.html(' ');
                if(pattern && pattern.trim() != '') {
                    var patternTest = new RegExp(pattern);
                    fields.each(function() {
                        var field = $(this),
                            url = field.val(),
                            span = field.closest('div.input-group').find('span');

                        if (url && url.trim() != '') {
                            response = patternTest.test(url);
                            var crossResponse = that.crossPageGroupTest(pattern, url, errorBox);
                            if(crossResponse == undefined) {
                                response = response;
                            } else {
                                response = crossResponse;
                            }
                            var i = span.find('i');
                            if (response) {
                                if(i.hasClass('fa-times')) {
                                    i.addClass('fa-check');
                                    i.removeClass('fa-times');
                                    i.removeClass('failure');
                                    field.removeClass('border-failure');
                                }
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
                            span = field.closest('div.input-group').find('span');

                        if (url && url.trim() != '') {
                            var i = span.find('i');
                                i.removeClass('fa-check');
                                i.addClass('fa-times');
                                i.addClass('failure');
                                i.removeClass('success');
                                field.addClass('border-failure');
                                field.removeClass('border-success');
                                span.removeClass('invisible');
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
            console.log(pgModule.pagegroupPatterns);
            var allPageGroups = $('.single-pagegroup-box');
                allPageGroups.each(function() {
                    var pagegroupBox = $(this),
                        pagegroupPattern = pagegroupBox.find('input[name="pageGroupPattern"]').val(),
                        errorBox = pagegroupBox.find('.error-box'),
                        urlFields = pagegroupBox.find('.pg-url');

                if(!pagegroupPattern || pagegroupPattern.trim() == '') {
                    errorBox.html('<p>Pagegroup pattern missing</p>');
                }

                pgModule.pagegroupPatternMatch(urlFields, pagegroupPattern, errorBox);
            });
        });

        // Pagegroup pattern verification
        $('.verify-pagegroup-pattern-btn').on('click', this, function(e) {
            e.preventDefault();
            var verifyBtn = $(this),
                pagegroupBox = verifyBtn.closest('div.pagegroup-col'),
                pagegroupPattern = pagegroupBox.find('input[name="pageGroupPattern"]').val(),
                pagegroupUrlsBox = pagegroupBox.find('div.pagegroup-urls');

            if(!pagegroupPattern || pagegroupPattern.trim() == '') {
                alert('Please enter pagegroup pattern');
                return;
            }
            pagegroupUrlsBox.removeClass('hidden');
            pgModule.createPagegroupTest(pagegroupPattern);
        });

    })(window, document);
});