const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sleep = require('system-sleep')
admin.initializeApp(functions.config().firebase);

exports.startRound = functions.database.ref('/games/{gid}/preRoundTimer').onWrite(event => {
	const timer = event.data.val()
	if (timer > 0) {
		const newTimer = timer - 1
		sleep(900)
		console.log(timer)
		return event.data.ref.set(newTimer)
	}else if(timer === 0){
		const gameRef = event.data.ref.parent
		return gameRef.child('open').once('value').then(snap => {
			if (snap.val() === 'true') {
				return gameRef.child('roundTimer').set(120)
			}
			return
		})
	}
})

exports.populateRoundWords = functions.database.ref('/games/{gid}/rounds/{rid}').onWrite(event => {
  // Only edit data when it is first created.
  if (event.data.previous.exists()) {
    return;
  }
  // Exit when the data is deleted.
  if (!event.data.exists()) {
    return;
  }
  const wordIndex = getRandomNumber(9099)
  let keyword = ''
  return admin.database().ref('/wordBank/'+ wordIndex).once('value').then(snap => {
    keyword = snap.val()
    return admin.database().ref('/word/'+ keyword).once('value')
  }).then(snap => {
    const bank = snap.val()
    bank[bank.length] = keyword;
    const sortedBank = sortList(bank)
    const finalBank = assignPointValues(sortedBank)
		const shuffled = shuffleLetters(keyword)
		return admin.database().ref(`/gameRounds/${event.params.gid}/${event.params.rid}`).update({
			shuffled:shuffled,
  		keyword:keyword,
  		bank:finalBank,
  		taken:[{word:'No data'}],
  		finished:false
  	})
  }).catch(e => {
  	console.log(e)
  })
})

exports.addUserToGame = functions.database.ref('/games/{gid}/players/{uid}').onWrite(event => {
  // Exit when the data is deleted.
  if (!event.data.exists()) {
  	// TODO: delete '/gamePlayers/gid/uid'
    return
  }
  // Get players count
  let playersCount
  const colors = ["#007AD5","#009C7E","#5A00F0"];
  return admin.database().ref(`/games/${event.params.gid}/players`).once('value').then(snap => {
  	playersCount = Object.keys(snap.val()).length
	  return admin.database().ref(`gamePlayers/${event.params.gid}/${event.params.uid}`)
	  	.update({
	  		score:0,
	  		color:colors[playersCount - 1],
	  		notification:{text:'Joined Game',type:'success'},
	  		open:true
	  	})
  }).then(() => {
    if (playersCount === 1) {
      return admin.database().ref(`gamePlayers/${event.params.gid}`).update({
      	open:false,
				preRoundTimer:30
      })
    }
    return
  })
  .catch(e => {
  	console.log(e)
  })
})

const getRandomNumber = (n) => {
  const MAX_RANDOM = Math.pow(2, 30);
  var limit = (MAX_RANDOM - (MAX_RANDOM % n)) / MAX_RANDOM;
  var rand = Math.random();
  while (rand >= limit) {
    rand = Math.random();
  }
  return Math.floor(rand * n);
}

const shuffleLetters = (keyword) => {
  let shuffled = keyword.slice().split('');
  for (let i = shuffled.length; i; i--) {
    let j = getRandomNumber(i);
    [shuffled[i - 1], shuffled[j]] = [shuffled[j], shuffled[i - 1]];
  }
  return shuffled.join('');
}

const sortList = (list) => {
  let sortedList = []
  let splitByLength = list.reduce((accum,word) => {
    accum[word.length-3].push(word);
    return accum;
  },[[],[],[],[]])
  splitByLength.forEach((arr) => {
    arr.sort((a, b) => {
      if(a < b) return -1;
      if(a > b) return 1;
      return 0;
    })
  })
  splitByLength.forEach((arr) => {
    sortedList = sortedList.concat(arr);
  })
  return sortedList;
}

const assignPointValues = (list) => {
  const pointValues = {a:10,b:30,c:30,d:20,e:10,f:40,g:20,h:40,i:10,j:80,k:50,l:10,m:30,n:10,o:10,p:30,q:100,r:10,s:10,t:10,u:10,v:40,w:40,x:80,y:40,z:100}
  const listWithValues = 
    list.reduce((accum,word,i) => {
      let value = 0;
      word.split('').forEach(letter => {
        value += pointValues[letter];
      })
      value = value * (word.length - 2);
      accum.push({word,value});
      return accum;
    },[])
  return listWithValues;
}