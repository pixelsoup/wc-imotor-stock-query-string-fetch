var inputFieldtrigger = document.getElementById("searchFld");
var inputFieldtarget = document.getElementById("border-bottom");

inputFieldtrigger.onclick = function() {
  inputFieldtarget.classList.add('searchTransition');
}

document.addEventListener('click', function(event) {
  if (event.target != inputFieldtrigger) {
    inputFieldtarget.classList.remove('searchTransition')
  }
})