const search = () => {
    let filter = document.getElementById('mysearchinput').value.toUpperCase();
    let ul = document.getElementById('items');
    let li = ul.getElementsByTagName('li');
    for(var i = 0; i < li.length; i++){
        let a = li[i].getElementsByTagName('a')[0];
        let text = a.textContent.toUpperCase();
        if(filter != '' && text.indexOf(filter) > -1){
            li[i].style.display = '';
        }
        else{
            li[i].style.display = 'none';
        }
    }
}