$(document).ready(function () {
    (function (w) {
        $('.addPageGroupPattern').on('submit', function (e) {
            e.preventDefault();
            var values = $(this).serializeArray(), json = {};
            $.each(values, function () { json[this.name] = this.value || '' });

            $.post('savePageGroupPattern', {
                pageGroupName: json.pageGroupName,
                pageGroupPattern: json.pageGroupPattern
            }, function (res) {
                if (res.success) {
                    alert('Pagegroup pattern saved!');
                }
                else {
                    alert('Some error occurred!');
                }
            });
        });
    })(window);
});