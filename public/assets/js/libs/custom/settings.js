$(document).ready(function () {
    (function (w) {
        function getFormData(values, type) {
            switch(type) {
                case 'pageGroups':
                    var pageGroups = [];

                    for(var i=0; i<values.length; i+=2) {
                        var json = {};
                        if(values[i].name === 'pageGroupPattern') {
                            json[values[i].value] = values[i+1].value;
                            pageGroups.push(json);
                        }
                    }

                    return pageGroups;
                case 'other':
                    var otherSettings = {};
                    for(var i=0; i<values.length; i++) {
                        if(values[i].name !== 'pageGroupPattern') {
                           otherSettings[values[i].name] = values[i].value;
                        }
                    }
                    
                    return otherSettings;
            };
        };

        $('#saveSiteSettings').on('submit', function (e) {
            e.preventDefault();
            var formValues = $(this).serializeArray();
            
            var pageGroupPattern = JSON.stringify(getFormData(formValues, 'pageGroups')),
                otherSettings = JSON.stringify(getFormData(formValues, 'other'));
            $.post('saveSiteSettings', {
                pageGroupPattern: pageGroupPattern,
                otherSettings: otherSettings
            }, function (res) {
                if (res.success) {
                    alert('Settings saved!');
                }
                else {
                    alert('Some error occurred!');
                }
            });
        });
    })(window);
});