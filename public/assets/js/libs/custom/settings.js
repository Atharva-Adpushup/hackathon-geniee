$(document).ready(function () {
    (function (w) {
        $('.addPageGroupPattern').on('submit', function (e) {
            e.preventDefault();
            var values = $(this).serializeArray(), json = {}, siteId = w.location.pathname.split('/')[2];
            $.each(values, function () { json[this.name] = this.value || '' });

            $.post('/site/' + siteId + '/savePageGroupPattern', {
                siteId: siteId,
                pageGroupName: json.pageGroupName,
                pageGroupPattern: json.pageGroupPattern
            }, function (res) {
                if (res.success) {
                    alert('Pagegroup pattern saved!');
                }
                else {
                    alert(res.message);
                }
            });
        });
    })(window);
});