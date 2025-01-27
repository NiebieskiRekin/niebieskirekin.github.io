const liczba_text = 'Słodziak nr ';
const content_path = "/Lulus/";
// random number between 1 and 26
function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min)) + min; // The maximum is exclusive and the minimum is inclusive
}

function rollRandomImage() {
  var numRand = getRandomInt(1, 26);
  const liczba = document.getElementById("liczba");
  liczba.innerText = liczba_text + numRand;
  const lulus_img = document.getElementById("lulus-img");
  lulus_img.src = "/Lulus/" + numRand + ".jpeg";
}

rollRandomImage()
