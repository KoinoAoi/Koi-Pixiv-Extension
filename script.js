'use strict'

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
document.addEventListener('click', event => {
	const el = event.target
	if (!el.matches('.image'))
		return
	event.preventDefault()

	/*
	 * There is not enough information here. We will have to download and
	 * parse the page.
	 */
	const xhr = new XMLHttpRequest(),
		href = el.href
	xhr.open('GET', href)
	xhr.onload = function () {
		if (this.status !== 200)
			return alert(`Failed to fetch: ${this.status}: ${href}`)
		grabData(this.response, href)
	}
	xhr.send()
})

	function grabData(data, href){
		var m = data.match(/<[^>]*original-image"[^>]*>/); //check if single image
		var manga = false;
		if (!m){//if not single, check for manga
			m = data.match(/<[^>]*mode=manga([^<]*)/);
			if(!m)//if not manga, end
				return console.error('Parsing error: ' + href);
			manga = true;
		}

		var artID = href.match(/=(\d+)/)[1];
		var info = data.match(/<[^>]*meta property="og:title"[^\n]*/)[0];
		var content = parseDOM(info).getAttribute('content');
		var title = content.match(/[^|]*/)[0];
		var artist = content.match(/[|][^[]*/)[0].substring(2);
		var origin = parseDOM(m[0]), url;

		if (manga){
			var pageCount = parseInt(data.match(/(\d+)(?=P<\/)/)[0]);
			url = origin.href.replace('manga', 'manga_big') + '&page=0';
			var mangaxhr = new XMLHttpRequest();
			mangaxhr.open('GET', url);
			mangaxhr.send();
			mangaxhr.onload = function(){
				url = mangaxhr.responseText.match(/http:\/\/i\d[^"]*/)[0];
				downloadName(title, artist, artID, true, url, pageCount);
			}
		}
		else {
			url = origin.getAttribute('data-src');
			downloadName(title, artist, artID, false, url, 1);
		}
	}

	function downloadName(title, artist, artID, manga, url, pageCount){
		var last = url.match(/[^\.]+/g);
		var fType = last[last.length-1];
		for(var x=0; x<pageCount; x++){
			var name = artist + ' - ' + title +'('+artID+')';
			if(manga){
				url=url.replace(/_p\d+/, '_p'+x);
				name = name.concat(' pg'+ x);
			}
			name = name.concat('.'+fType);
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
					return alert(`Fetch failed: ${this.status} : ${url}`);
				// Download the Blob
				var a = document.createElement('a');
				a.setAttribute('href',window.URL.createObjectURL(this.response));
				a.setAttribute('download', name);
				a.click();
			};
	}//end of download()

// Parse HTML string to node array/element
function parseDOM(string, forceArray) {
	const el = document.createElement('div')
	el.innerHTML = string
	const children = el.childNodes
	if (!forceArray && children.length === 1)
		return children[0]
	return Array.from(children)
}
