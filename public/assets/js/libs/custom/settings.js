$(document).ready(function () {
    (function (w, d) {
        var autoOptimise,
            headerCode = "(function(w, d) { var s = d.createElement('script'); s.src = '//cdn.adpushup.com/" + w.selectedSiteId + "/adpushup.js'; s.type = 'text/javascript'; s.async = true; (d.getElementsByTagName('head')[0] || d.getElementsByTagName('body')[0]).appendChild(s); })(window, document);";
        $('#header-code').text('<script data-cfasync="false" type="text/javascript">' + headerCode + '</script>');

        $('#autoOptimise').on('change', function () {
            autoOptimise = $(this).prop('checked');
        });

        function getFormData(values, type) {
            switch (type) {
                case 'pageGroups':
                    var pageGroups = [];

                    for (var i = 0; i < values.length; i += 2) {
                        var json = {};
                        if (values[i].name === 'pageGroupPattern') {
                            json[values[i].value] = values[i + 1].value;
                            pageGroups.push(json);
                        }
                    }

                    return pageGroups;
                case 'other':
                    var otherSettings = {};
                    for (var i = 0; i < values.length; i++) {
                        if (values[i].name !== 'pageGroupPattern') {
                            otherSettings[values[i].name] = values[i].value;
                        }
                    }

                    return otherSettings;
            };
        };

        $(d).on('click', '#clipboardCopy, #header-code', function () {
            $('.clipboard-copy').fadeIn();
            setTimeout(function () {
                $('.clipboard-copy').fadeOut();
            }, 1500);
            $('#header-code').select();
            d.execCommand('copy');
        });

        $('#sendCodeForm').submit(function (e) {
            e.preventDefault();
            $('#headerCodeInput').val($('#header-code').val());
            var data = $(this).serialize();

            $('#sendCodeSubmit').prop('disabled', true).html('Sending...');
            $.post('/user/sendCode', data, function (res) {
                if (res.success) {
                    $('#sendCodeSubmit').css('opacity', 1).html('Code sent successfully!');
                    setTimeout(function () {
                        $('#sendToDevModal').modal('toggle');
                        $('#sendCodeSubmit').prop('disabled', false).html('Send');
                    }, 2000);
                } else {
                    alert('Some error occurred!');
                }
            });
        });

        $('#saveSiteSettings').on('submit', function (e) {
            e.preventDefault();
            var formValues = $(this).serializeArray(),
                autoOpt = getFormData(formValues, 'other').autoOptimise ? true : false,
                pageGroupPattern = JSON.stringify(getFormData(formValues, 'pageGroups')),
                otherSettings = JSON.stringify(getFormData(formValues, 'other'));
            $.post('saveSiteSettings', {
                pageGroupPattern: pageGroupPattern,
                otherSettings: otherSettings,
                autoOptimise: autoOpt
            }, function (res) {
                if (res.success) {
                    alert('Settings saved!');
                }
                else {
                    alert('Some error occurred!');
                }
            });
        });
    })(window, document);
});