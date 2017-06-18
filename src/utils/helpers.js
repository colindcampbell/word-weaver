export function getRandomNumber(n){
  const MAX_RANDOM = Math.pow(2, 30)
  var limit = (MAX_RANDOM - (MAX_RANDOM % n)) / MAX_RANDOM;
  var rand = Math.random()
  while (rand >= limit) {
    rand = Math.random()
  }
  return Math.floor(rand * n)
}

export function shuffleLetters(keyword){
  let shuffled = keyword.slice().split('')
  for (let i = shuffled.length; i; i--) {
    let j = getRandomNumber(i);
    [shuffled[i - 1], shuffled[j]] = [shuffled[j], shuffled[i - 1]];
  }
  return shuffled.join('')
}