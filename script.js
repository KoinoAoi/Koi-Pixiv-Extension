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
	//Check if we're clicking a manga thumb first
	var mangaCheck = document.getElementsByClassName('manga-viewer');
	if(el.matches('.manga-thumb')){
		event.preventDefault();
		var pNum = el.getAttribute('data-src').match(/p(\d+)/)[1];
		turnPage(pNum);
		return
	}
	//When clicking a history item. Remove mangaviewer and unhide regular history 
	if(el.matches('._history-item')&&!(mangaCheck=='[]')){
		revert();
		return
	} 
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

	function grabData(data, href, pageNum){
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
			var mangaCheck = (document.getElementsByClassName('manga-viewer')[0]);
			var mangaxhr = new XMLHttpRequest();
			mangaxhr.open('GET', url);
			mangaxhr.send();
			mangaxhr.onload = function(){
				url = mangaxhr.responseText.match(/http:\/\/i\d[^"]*/)[0];
				//When in mangaviewer mode, clicking on expanded image, downloads it.
				if(mangaCheck){
					var imgCon = document.getElementsByClassName('image-container')[0].
						getElementsByTagName('a')[0];
					var pNum = imgCon.getAttribute('style').match(/_p(\d+)/)[1];
					url = url.replace(/p(\d+)/, 'p'+pNum);
					downloadName(title, artist, artID, 'page', url, 1);
					return;
				}
				//Otherwise, open MangaViewer mode.
				var thumbUrl = url.replace('img-original', 'c/240x480/img-master');
					thumbUrl = thumbUrl.replace(/_p[^]+/, '_p0_master1200.jpg');
				mangaView(title, artist, artID, url, thumbUrl, pageCount);
			}
		}
		else {
			url = origin.getAttribute('data-src');
			downloadName(title, artist, artID, 'single', url, 1);
		}
	}

	function mangaView(title, artist, artID, url, thumbURL, pageCount){
		//Hide the container and create a new one
		document.getElementsByClassName('related-container')[0]
			.setAttribute('style','display:none');
		var mangaContainer = document.createElement('dl');
		mangaContainer.setAttribute('class', 'related-container manga-viewer');
		document.getElementsByClassName('detail-container')[0]
			.appendChild(mangaContainer);
		
		//Create the Back and Download All links. Doesn't need to be a link but 
		//the blue text makes it apparent to users that it's a functional element
		var back = document.createElement('a');
		back.appendChild(document.createTextNode('-Go Back- '));
		var downAll = document.createElement('a');
		downAll.appendChild(document.createTextNode('-Download All-'));
		document.getElementsByClassName('manga-viewer')[0].appendChild(back);
		document.getElementsByClassName('manga-viewer')[0].appendChild(downAll);
		//.onclick was being stupid. Event Listeners do the job.
		back.addEventListener('click', function(){
				revert();
		});
		downAll.addEventListener('click', function(){
				downloadName(title, artist, artID, 'all', url, pageCount);
		});

		//add the thumbnails to the new container
		var mangaThumbs = document.createElement('dd');
		mangaThumbs.setAttribute('class','_history-related-items manga-thumb-list');
		mangaThumbs.setAttribute('style', 'width:'+(160*(pageCount+1))+'px;');
		document.getElementsByClassName('manga-viewer')[0].appendChild(mangaThumbs);
		for (var x=0; x<pageCount; x++){
			var mangaThumb = document.createElement('a');
			mangaThumb.setAttribute('href','/member_illust.php?mode=medium&amp;illust_id='+artID);
			mangaThumb.setAttribute('target','_blank');
			mangaThumb.setAttribute('class','_history-related-item update-detail _area-target list-item manga-thumb');
			mangaThumb.setAttribute('data-id', null);
			mangaThumb.setAttribute('data-filter', 'lazy-image');
			var loopUrl = thumbURL.replace(/_p\d+/, '_p'+x);
			mangaThumb.setAttribute('data-src', loopUrl);
			mangaThumb.setAttribute('style', 'background-image: url('+loopUrl+');');
			document.getElementsByClassName('manga-thumb-list')[0].appendChild(mangaThumb);
		}

	}
	//When clicking on a manga thumbnail, change the expanded image
	function turnPage(pageNum){
		var imgContainer = document.getElementsByClassName('image-container')[0].
			getElementsByTagName('a')[0];
		var x = imgContainer.getAttribute('style').replace(/_p\d+/, '_p'+pageNum);
		imgContainer.setAttribute('style', x);
	}

	//removes the manga viewer and unhides the related images viewer
	function revert(){
		var x = document.getElementsByClassName('manga-viewer');
		for (var l=0; l < x.length; l++){
			document.getElementsByClassName('detail-container')[0]
			.removeChild(x[l]);
		}
		document.getElementsByClassName('related-container')[0]
			.setAttribute('style','display:all');
	}

	//creates the filename prior to downloading
	function downloadName(title, artist, artID, manga, url, pageCount){
		var last = url.match(/[^\.]+/g);
		var fType = last[last.length-1];
		for(var x=0; x<pageCount; x++){
			var name = artist + ' - ' + title +'('+artID+')';
			if(manga == 'all'){
				url=url.replace(/_p\d+/, '_p'+x);
				name = name.concat(' pg'+ x);
			}
			else if(manga == 'page')
			{
				var k = url.match(/_p(\d+)/)[1];
				name = name.concat(' pg'+k);
			}
			name = name.concat('.'+fType);
			download(name, url);
		}
	}// end of downloadName()

	//downloads file
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
