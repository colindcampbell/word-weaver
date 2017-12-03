const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.allPlayersReady = functions.database.ref('/games/{gid}/ready').onWrite(event => {
  if (!event.data.exists()) {
    return;
  }  
  const playersReady = event.data.val();
  const playerKeys = Object.keys(playersReady);
  const round = event.data.ref.parent.child('round');
  // Load a new round when both players are ready
  if (playerKeys.filter(key => playersReady[key] === true).length === playerKeys.length) {
    return round.once('value').then(snap => {
      currentRound = snap.val()
      return admin.database().ref(`games/${event.params.gid}`).update({round:currentRound+1,loading:true})
    }).catch(e => {
      console.log(e)
    })
  }
  return
})

exports.roundFinished = functions.database.ref('/games/{gid}/roundFinished').onWrite(event => {
  const isFinished = event.data.val()
  if (isFinished) {
    const game = event.data.ref.parent.child('currentGameRound');
    let gameRoundKey,canMoveOn = false;
    return game.once('value').then(snap => {
      gameRoundKey = Object.keys(snap.val())[0]
      return admin.database().ref('/gameRounds/'+gameRoundKey).once('value')
    }).then(snap => {
      const round = snap.val();
      // For co-op and single player check to see if they got one of the longest words
      canMoveOn = Object.keys(round.taken).filter(i => round.taken[i].length > 5).length > 0
      // Reveal all of the words that weren't guessed
      const taken = Object.assign({},round.taken);
      round.bank.forEach((wordObj, i) => {
        if (!taken.hasOwnProperty(i) || !taken[i].hasOwnProperty('color')) {
          taken[i] = {}
          taken[i].word = wordObj.word
          taken[i].color = "#445566"
        }
      })
      return admin.database().ref('/gameRounds/'+gameRoundKey+'/taken').update(taken);
    }).then(() => {
      return admin.database().ref(`games/${event.params.gid}`).once('value')
    }).then(snap => {
      const game = snap.val()
      const updates = {}
      updates.loading = false
      // Flag that the game is over
      if((game.mode === 'duo-vs' && game.round === 2) ||
         (game.mode !== 'duo-vs' && !canMoveOn)) {
        updates.gameOver = true
      }
      return admin.database().ref(`games/${event.params.gid}`).update(updates)
    }).catch(e => {
      console.log(e)
    });
    // Game Over logic
  }else{
    return
  }
})

// See function newSubmit in GamesContainer.js
// Populates the words when a new game is created
// TODO: populate only when game is full (max players)
exports.populateRoundWords = functions.database.ref('/games/{gid}/round').onWrite(event => {
  // Only edit data when it is first created.
  // if (event.data.previous.exists()) {
  //   return;
  // }
  // Exit when the data is deleted.
  // TODO: only populate round once the last player has joined
  const game = event.data.ref.parent
  if (!event.data.exists()) {
    return;
  }
  const roundIndex = event.data.val()
  const wordIndex = getRandomNumber(9099)
  let keyword = ''
  let newKey
  let roundTime
  return admin.database().ref('/wordBank/'+ wordIndex).once('value').then(snap => {
    keyword = snap.val()
    return admin.database().ref('/word/'+ keyword).once('value')
  }).then(snap => {
    const bank = snap.val()
    bank[bank.length] = keyword;
    // const sortedBank = sortList(bank)
    const points = assignPointValues(sortList(bank))
    const finalBank = points[0]
		const shuffled = shuffleLetters(keyword)
    roundTime = getRoundLength(bank.length)
		return admin.database().ref(`/gameRounds`).push({
			shuffled:shuffled,
  		keyword:keyword,
  		bank:finalBank,
  		taken:[{word:'No data'}],
  		finished:false,
      total:points[1]
    })
  }).then(snap => {
    newKey = snap.key
    return admin.database().ref(`games/${event.params.gid}`).update({
      currentGameRound:{[newKey]:true},
      preRoundTimer:10,
      roundTimer:roundTime,
      roundLength:roundTime,
      roundFinished:false
    })
  }).then(snap => {
    return admin.database().ref(`games/${event.params.gid}/ready`).once('value')
  }).then(snap => {
  	const ready = snap.val()
    Object.keys(ready).forEach(key => {
      ready[key] = false
    })
    return admin.database().ref(`games/${event.params.gid}`).update({ready:ready,loading:false})
  }).catch(e => {
  	console.log(e)
  })
})

exports.addUserToGame = functions.database.ref('/games/{gid}/players/{uid}').onWrite(event => {
  // Exit when the data is deleted.
  if (!event.data.exists()) {
  	// TODO: delete '/gamePlayers/gid/uid', set game open to true, 
    return;
  }
  // Get players count
  let playersCount
  const colors = ["#007AD5","#009B90","#5A00F0"];
  return admin.database().ref(`/games/${event.params.gid}/players`).once('value').then(snap => {
  	playersCount = Object.keys(snap.val()).length
	  return admin.database().ref(`/gamePlayers`)
	  	.push({
	  		score:0,
	  		color:colors[playersCount - 1],
	  		notification:{text:'Joined Game',type:'success'},
        ready:true,
        [event.params.uid]:true,
        playerKey:event.params.uid
	  	})
  }).then(snap => {
    // TODO: change to 3
    // Start Game
    const key = snap.key;
    const updates = { [key]: true };
    return admin.database().ref(`games/${event.params.gid}/currentGamePlayers`).update(updates);
  }).then(() => {
    return admin.database().ref(`games/${event.params.gid}/ready/`).update({[event.params.uid]:false});
  }).then(() => {
    return admin.database().ref(`games/${event.params.gid}`).update({loading:false});
  }).catch(e => {
  	console.log(e);
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

const getRoundLength = (n) => {
  let length
  switch(n){
    case n >= 45 && n < 60:
      length = 105;
      break;
    case n >= 60:
      length = 120;
      break;
    default:
      length = 90;
  }
  return length
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
      accum[0].push({word,value});
      accum[1] += value;
      return accum;
    },[[],0])
  return listWithValues;
}