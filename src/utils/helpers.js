export function getRandomNumber(n){
  const MAX_RANDOM = Math.pow(2, 30)
  var limit = (MAX_RANDOM - (MAX_RANDOM % n)) / MAX_RANDOM;
  var rand = Math.random()
  while (rand >= limit) {
    rand = Math.random()
  }
  return Math.floor(rand * n)
}

export function sortList(list){
  let sortedList = []
  let splitByLength = list.reduce((accum,word) => {
    accum[word.length-3].push(word)
    return accum
  },[[],[],[],[]])
  splitByLength.forEach((arr) => {
    arr.sort((a, b) => {
      if(a < b) return -1;
      if(a > b) return 1;
      return 0;
    })
  })
  splitByLength.forEach((arr) => {
    sortedList = sortedList.concat(arr)
  })
  return sortedList
}

export function assignPointValues(list){
  const pointValues = {a:10,b:30,c:30,d:20,e:10,f:40,g:20,h:40,i:10,j:80,k:50,l:10,m:30,n:10,o:10,p:30,q:100,r:10,s:10,t:10,u:10,v:40,w:40,x:80,y:40,z:100}
  const listWithValues = 
    list.reduce((accum,word,i) => {
      let value = 0
      word.split('').forEach(letter => {
        value += pointValues[letter]
      })
      value = value * (word.length - 2)
      accum.push({word,value})
      return accum
    },[])
  return listWithValues
}

export function shuffleLetters(keyword){
  let shuffled = keyword.slice().split('')
  for (let i = shuffled.length; i; i--) {
    let j = getRandomNumber(i);
    [shuffled[i - 1], shuffled[j]] = [shuffled[j], shuffled[i - 1]];
  }
  return shuffled.join('')
}