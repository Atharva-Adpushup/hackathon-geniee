// Pagegroup editing client-side module script

$(document).ready(function () {
    (function (w, d) {

        // Pagegroup editing module object
        var editModule = {
            completeRegex: null,
            isNotEmpty: function(value) {
                return value && value.trim().length > 0;
            },
            updateUI: function() {
                var editBox = $('#edit-box'),
                    outputBox = $('#output-box'),
                    individualComponentsBox = $('#individual-components'),
                    completeRegex = $('#complete-regex'),
                    editBtn = $('#edit-btn-box');

                    completeRegex.html(editModule.completeRegex);
                    editBox.addClass('hidden');
                    individualComponentsBox.addClass('hidden');
                    editBtn.addClass('hidden');
                    outputBox.removeClass('hidden');
            },
            generateNewRegex: function(protocol, w, domainName, pathArray, query) {
                // if(editModule.isNotEmpty(protocol)) {
                //     editModule.completeRegex = protocol;
                // }
                // if(editModule.isNotEmpty(w)) {
                //     editModule.completeRegex = editModule.completeRegex + w;
                // }
                // if(editModule.isNotEmpty(domainName)) {
                //     editModule.completeRegex = editModule.completeRegex + domainName;
                // }
                if(pathArray.length > 0) {
                    editModule.completeRegex = '\\/';
                    pathArray.each(function(p) {
                        var pathValue = $(pathArray[p]).val();
                        if(editModule.isNotEmpty(pathValue)) {
                            editModule.completeRegex = editModule.completeRegex + pathValue;
                        }
                    });
                }
                if(editModule.isNotEmpty(query)) {
                    editModule.completeRegex = editModule.completeRegex + query;
                }
                if(editModule.isNotEmpty(editModule.completeRegex)) {
                    editModule.completeRegex = editModule.completeRegex + '$';
                    editModule.updateUI();
                }
            }
        };

        // save trigger
        $('#save-regex').on('click', function(e) {
            e.preventDefault();
            var editBox = $('#edit-box'),
                pathInputFields = $('input[data-id="path-value"]'),
                protocolValue = $('input[data-id="protocol"]').val(),
                wValue = $('input[data-id="w"]').val(),
                domainValue = $('input[data-id="domain"]').val(),
                queryValue = $('input[data-id="query"]').val();

            editModule.generateNewRegex(protocolValue, wValue, domainValue, pathInputFields, queryValue);
        });

        // edit trigger
        $('#edit-regex').on('click', this, function(e) {
            e.preventDefault();
            var outputBox = $('#output-box'),
                editBox = $('#edit-box');

                outputBox.addClass('hidden');
                editBox.removeClass('hidden');
        });

    })(window, document);
});