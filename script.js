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
	$.get(href, function(data){
		grabData(data, href);
	}); 
});

	function grabData(data, href){
		if (!data)
			return console.error('Failed to fetch: ' + href);
		var m = data.match(/<[^>]*original-image"[^>]*>/); //check if single image
		var manga = false;
		if (!m){//if not single, check for manga
			m = data.match(/<[^>]*mode=manga([^<]*)/);
			if(!m)//if not manga, end
				return console.error('Parsing error: ' + href);
			manga = true;
		}

		var artID = href.match(/=(\d+)/)[1];
		var info = $(data.match(/<[^>]*meta property="og:title"[^\n]*/)[0]);
		var content = info[0].content;
		var title = content.match(/[^|]*/)[0];
		var artist = content.match(/[|][^[]*/)[0].substring(2);
		var $origin = $(m[0]), url;

		if (manga){
			var pageCount = parseInt(data.match(/(\d+)(?=P<\/)/)[0]);
			url = $origin[0].href;
			url = url.replace('manga', 'manga_big').concat('&page=0');
			var mangaxhr = new XMLHttpRequest();
			mangaxhr.open('GET', url); 
			mangaxhr.send();
			mangaxhr.onload = function(){
				url = mangaxhr.responseText.match(/http:\/\/i\d[^"]*/)[0];
				downloadName(title, artist, artID, true, url, pageCount);
			}
		}
		else{
			url = $origin.data('src');
			downloadName(title, artist, artID, false, url, 1);
		}
	}

	function downloadName(title, artist, artID, manga, url, pageCount){
		for(var x=0; x<pageCount; x++){
			var name = artist + ' - ' + title +'('+artID+')';
			if(manga){
				url=url.replace(/_p\d+/, '_p'+x);
				name = name.concat(' pg'+ x);
			}
			download(name, url);		
		}
	}// end of proceedToDownload()

	function download(name, url){
		var xhr = new XMLHttpRequest();
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
	}//end of download()