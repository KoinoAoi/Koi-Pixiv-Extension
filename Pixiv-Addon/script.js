document.onDOMContentLoaded= function() {
	document.getElementsByClassName('premium-ad')[0].setAttribute('style','display:none');
	setTimeout(function(){
	var elem = document.getElementsByClassName('_history-item trial');
	for (var i = 0; i<elem.length;i+=0){
		var imgName = elem[i].getAttribute('style').split('/');
		var dataID = imgName[imgName.length-1].split('_')[0];
		elem[i].setAttribute('data-id', dataID);
		elem[i].setAttribute('class', '_history-item show-detail list-item');
	  }
	}, 3000);

	/*
	 * It is very problematic to add an icon to dynamically mutating elements
	 * with no access to the mutation code. So lets just override the click
	 * event. Later some behaivior divergance can be added.
	 */
	$(document).on('click', '.image', function(event) {
		event.preventDefault();
		var $el = $(event.target),
			href = $el[0].href;
		console.log('href: '+href);
		/*
		 * There is not enough information here. We will have to download and
		 * parse the page.
		 */
		$.get(href, function(data){

			var $parsed = $("<div>").append(data);
			var $aElement = $parsed.find('.works_display').find('a');
			var detailHref, mode, medienSrc;
	        if($aElement.length === 0) {
	            detailHref = $parsed.find('.wrapper').last().children('img').attr('data-src');
	            mode = "big";
	            medienSrc = $parsed.find('.works_display').children('div').children('img').attr('src');
	            console.log('proceeding to downloadImage ');
	            downloadImage();


	        } else {/* PANIC 
	        	* when I can get singular images working, I'll add in manga mode images later
	            detailHref = $aElement[$aElement.length - 1].href;
	            mode = urlParam(detailHref, "mode");
	            console.log('2');
	            medienSrc = $parsed.find('.works_display').children('a').children('div').children('img').attr('src');
	        */}
		});
	});

getBlobAndDoubleCheck = function(url) {
    var deferred = $.Deferred();

    $.when(getBlob(url)).done(function(blob) {
        if(blob === undefined) {
        	console.log('doublechecker claims undefined, false');
            deferred.resolve();
            return false;
        }
        if(!blob.size) {
        	console.log('doublechecker claims !blob.size');
            var mimeType = url.substring(url.lastIndexOf("."));
            if(mimeType === ".jpg") {
                url = url.replace(mimeType, ".png");
            } else {
                url = url.replace(mimeType, ".jpg");
            }

            $.when(getBlob(url)).done(function(blob) {
            	console.log('resolving 1 dc');
                deferred.resolve(blob);
            });
        } else {
        	console.log('resolving 2 dc');
            deferred.resolve(blob);
        }
        console.log('bottom of getBlobAndDoubleCheck');
    });
    return deferred;
}; //end getBlobAndDoubleCheck

	getBlob = function(url) {
		console.log('getBlob started');
        var deferred = $.Deferred();
        var req = new XMLHttpRequest();

        req.open("GET", url, true);
        req.responseType = "blob";
        console.log('opened');
        req.onabort = function() {
        	console.log('aborted');
            deferred.resolve();
            return false;
        };
        req.onerror = function(){
        	console.log('ERROR');
        	deferred.resolve();
        	return false;
        };
        req.onload = function(event) {
            var blob = req.response;
            console.log('loaded');
            deferred.resolve(blob);
            
        }; //end req.onload
        req.send();
        console.log('sent from getBlob. Deferred:');
        console.log(deferred);
        return deferred;
        
    }; //end getBlob
	function downloadImage() {
		//source here is 
		var realSource = gainOriginalImageUrl();
		$.when(getBlobAndDoubleCheck(realSource)).done(function(blob) {
            if(blob === undefined) {
            	console.log('downloadImage point: False');
                return false;
            }
            if(blob.size) {
            	console.log('downloadImage point: Size')
                var dataType = blob.type.substring(blob.type.indexOf("/") + 1);
                var url = window.URL.createObjectURL(blob);
                console.log('datatype: '+dataType+' ***** url: '+url);
				var a = document.createElement('a');
				a.setAttribute('href', blob);
				a.setAttribute('download', 'test.' + dataType);
				a.click();
            } else {
                //white flag
            }
        });
		
	}

	function gainOriginalImageUrl(){
		var selImg = document.getElementsByClassName('image')[0];
		var illustURL = selImg.getAttribute('href');
		var urlString = selImg.getAttribute('style').split(/\(|\)/)[1];
		var urlSplit = urlString.split('/');
		var fileExt= urlString.split('.');
		var illustID = urlSplit[urlSplit.length-1].split('_')[0];
		fileExt = fileExt[fileExt.length-1];
		var masterSplit = urlString.split(/(?:master|_)/); 
		var originImg;
		var pageNum=0;

		if(urlSplit.length==7){ 
			originImg = illustID+'.'+fileExt;
		}
		else if (urlSplit.length==14){
			originImg = 'http://'+urlSplit[2]+'/img-original'
								+masterSplit[1]+'_p'+pageNum+'.'+fileExt;
		}
		var artName=urlSplit[urlSplit.length-1].split('_')[0];
		console.log('originImg: '+originImg);
		return originImg;
	}

}();