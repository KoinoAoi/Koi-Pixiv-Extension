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


//Stuff that doesn't work yet
//Make a button HERE

//When button is pressed; Do this:

function gainOriginalImage(){
	
	var selImg = document.getElementsByClassName('image')[0];
	var illustURL = selImg.getAttribute('href');
	var urlString = selImg.getAttribute('style').split(/\(|\)/)[1];
	var urlSplit = urlString.split('/');
	var fileExt= urlString.split('.');
	fileExt = fileExt[fileExt.length-1];
	var masterSplit = urlString.split(/(?:master|_)/); 
	var originImg;
	var pageNum;

	if(urlSplit.length==7){ 
		originImg = urlString.split('_')[0]+'.'+fileExt;
	}
	else if (urlSplit.length==14){
		originImg = 'http://'+urlSplit[2]+'/img-original'
							+masterSplit[1]+'_p'+pageNum+'.'+fileExt;
	}
	var artName=urlSplit[13].split('_')[0];
//Stuff that doesn't make sense yet.
	$('body').append('<iframe id="koiFrame" onload="downloadImage(originImg, artName)
						"src="'+illustURL+'"></iframe>');
//document.getElementById("koiFrame").contentWindow.downloadImage(originImg, artName);

}
function downloadImage(origin, name){
	var fileName = name+'_p0.';
	var a = document.createElement('a');
	a.setAttribute('href', origin);
	a.setAttribute('download', fileName);
	a.click();
}

}();