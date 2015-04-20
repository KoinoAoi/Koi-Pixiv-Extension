document.onDOMContentLoaded= function() {
	document.getElementsByClassName('premium-ad')[0]
		.setAttribute('style','display:none');
	setTimeout(function(){
		var elem = document.getElementsByClassName('_history-item trial');
		for (var i = 0; i<elem.length;i+=0){
			var imgName = elem[i].getAttribute('style').split('/');
			var dataID = imgName[imgName.length-1].split('_')[0];
			elem[i].setAttribute('data-id', dataID);
			elem[i].setAttribute('class', '_history-item show-detail list-item');
		}
	}, 3000);
}();

/*
 * It is very problematic to add an icon to dynamically mutating elements
 * with no access to the mutation code. So lets just override the click
 * event. Later some behaviour divergance can be added.
 */
$(document).on('click', '.image', function(event) {
	event.preventDefault();
	var $el = $(event.target),
		href = $el[0].href;

	/*
	 * There is not enough information here. We will have to download and
	 * parse the page.
	 */
	$.get(href, function(data) {
		if (!data)
			return console.error('Failed to fetch: ' + href);
		var m = data.match(/<[^>]*original-image"[^>]*>/);
		if (!m)
			return console.error('Parsing error: ' + href);
		var $original = $(m[0]),
			url = $original.data('src'),
			name = $original.attr('alt');

		// Fetch the image as a Blob
		var xhr = new XMLHttpRequest();
		xhr.onload = function(){
			if (this.status !== 200)
				return console.error(`Fetch failed: ${this.status} : ${url}`);
			// Download the Blob
			var a = document.createElement('a');
			a.setAttribute('href',window.URL.createObjectURL(this.response));
			a.setAttribute('download', name);
			a.click();
		};
		xhr.open('GET', url);
		xhr.responseType = 'blob';
		xhr.send();
	});
});