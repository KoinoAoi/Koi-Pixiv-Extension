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

}();