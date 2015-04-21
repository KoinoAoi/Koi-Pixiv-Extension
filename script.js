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
		var m = data.match(/<[^>]*original-image"[^>]*>/); //check if single image
		var type = 'single';
		var pageCount = 1;
		if (!m){//if not single, check for manga
			m = data.match(/<[^>]*mode=manga([^<]*)/);
			
			if(!m)//if not manga, end
				return console.error('Parsing error: ' + href);
			type = 'manga';
			pageCount = parseInt(data.match(/(\d+)(?=P<\/)/)[0]);
			console.log(pageCount);

		}

		var $origin = $(m[0]), url;
		if (type == 'manga'){
				url = $origin[0].href;
				url = url.replace('manga', 'manga_big').concat('&page=0');
				var d = new Date();
				var mangaxhr = new XMLHttpRequest();
				//synchronous loading is scary, but we only need the page=0 to get the URL
				mangaxhr.open('GET', url, false); 
				mangaxhr.send();
				url = mangaxhr.responseText.match(/http:\/\/i\d[^"]*/)[0];
				console.log('mangadata: ' +url);					
			}
		else
			url = $origin.data('src');

		info = $(data.match(/<[^>]*meta property="og:title"[^\n]*/)[0]);
		content = info[0].content;
		title = content.match(/[^|]*/)[0];
		artist = content.match(/[|][^[]*/)[0].substring(2);
		console.log('url: '+ url);
		console.log('title: '+ title);
		console.log('artist: ' + artist);


		// Fetch the image as a Blob
		//iterate through every page number if it's a manga. If not, it'll stop after the first.
		for(var x=0; x<pageCount;x++){
			var xhr = new XMLHttpRequest();
			var name = artist + ' - ' + title;
			if(type='manga'){
				//Adjust Filename
				url=url.replace(/_p\d/, '_p'+x);
				console.log('Iterated URL: '+url);
				name.concat(' ('+ x +')');
			}
			xhr.open('GET', url);
			xhr.responseType = 'blob';
			xhr.send();

			xhr.onload = function(){
				if (this.status !== 200)
					return console.error(`Fetch failed: ${this.status} : ${url}`);
				// Download the Blob

				var a = document.createElement('a');
				a.setAttribute('href',window.URL.createObjectURL(this.response));
				a.setAttribute('download', name);
				a.click();
			};			
		}
	});
});