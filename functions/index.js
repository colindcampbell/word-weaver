const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

// When both players click the ready button load a new round. Incrementing the round triggers the populateRoundWords function
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

// When the timer expires reveal the hidden words and end the game or allow players to indicate they are ready for the next round
exports.roundFinished = functions.database.ref('/games/{gid}/roundFinished').onWrite(event => {
  if (!event.data.exists()) {
    // TODO: delete '/gamePlayers/gid/uid', set game open to true, 
    return;
  }  
  const isFinished = event.data.val()
  if (isFinished) {
    const game = event.data.ref.parent.child('currentGameRound');
    let gameRoundKey,canMoveOn = false;
    return game.once('value').then(snap => {
      gameRoundKey = Object.keys(snap.val())[0]
      return admin.database().ref('/gameRounds/'+gameRoundKey).once('value')
    }).then(snap => {
      const round = snap.val()
      // For co-op and single player check to see if they got one of the longest words
      canMoveOn = Object.keys(round.taken).filter(i => round.taken[i].word.length === 6).length > 0
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
    })
  }else{
    return
  }
})

// See function newSubmit in GamesContainer.js
// Populates the words when a new game is created or when a new round is starting
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
  let keyword = '', newKey, roundTime, points
  return admin.database().ref('/wordBank/'+ wordIndex).once('value').then(snap => {
    keyword = snap.val()
    return admin.database().ref('/word/'+ keyword).once('value')
  }).then(snap => {
    const bank = snap.val()
    bank[bank.length] = keyword
    points = assignPointValues(sortList(bank))
    const finalBank = points[0]
		const shuffled = shuffleLetters(keyword)
    roundTime = getRoundLength(bank.length)
		return admin.database().ref(`/gameRounds`).push({
			shuffled:shuffled,
  		keyword:keyword,
  		bank:finalBank,
  		taken:[{word:'No data'}],
  		finished:false,
      total:points[1],
      timestamp:Date.now()
    })
  }).then(snap => {
    newKey = snap.key
    return admin.database().ref(`games/${event.params.gid}`).update({
      currentGameRound:{[newKey]:true},
      preRoundTimer:5,
      roundTimer:roundTime,
      roundLength:roundTime,
      roundFinished:false
    })
  }).then(snap => {
    return admin.database().ref(`games/${event.params.gid}`).once('value')
  }).then(snap => {
  	const game = snap.val(),
          players = game.players,
          round = game.round,
          updates = {loading:false,ready:{}}
    if (round > 0) {
      Object.keys(players).forEach(key => { updates.ready[key] = false })
    }
    return admin.database().ref(`games/${event.params.gid}`).update(updates)
  }).catch(e => {
  	console.log(e)
  })
})

// Create a record in the gamePlayers object in Firebase that holds the specific info about that player for that game (score, color, notification, etc.)
exports.addUserToGame = functions.database.ref('/games/{gid}/players/{uid}').onWrite(event => {
  // Exit when the data is deleted.
  if (!event.data.exists()) {
  	// TODO: delete '/gamePlayers/gid/uid', set game open to true, 
    return;
  }
  // Get players count
  let playerCount, mode, players
  const gameMode = `/games/${event.params.gid}/mode`,
        colors = ["#007AD5","#009B90","#5A00F0"]
  return admin.database().ref(gameMode).once('value').then(snap => {
    mode = snap.val()
    return admin.database().ref(`/games/${event.params.gid}/players`).once('value')
  }).then(snap => {
    players = snap
    playerCount = Object.keys(snap.val()).length
    color = mode === 'solo' ? colors[2] : colors[playerCount - 1]
    return admin.database().ref(`/gamePlayers`)
      .push({
        score:0,
        roundScore:0,
        color:color,
        notification:{text:'Joined Game',type:'success'},
        [event.params.uid]:true,
        playerKey:event.params.uid,
        timestamp:Date.now()
      })
  }).then(snap => {
    // TODO: change to 3
    // Start Game
    const key = snap.key;
    const updates = { [key]: true }
    return admin.database().ref(`games/${event.params.gid}/currentGamePlayers`).update(updates);
  }).then(() => {
    const updates = {}
    players.forEach(child => {
      updates[child.key] = false
    })
    return admin.database().ref(`games/${event.params.gid}/ready/`).update(updates)
  }).then(() => {
    return admin.database().ref(`games/${event.params.gid}`).update({loading:false,playerCount:playerCount})
  }).catch(e => {
  	console.log(e);
  })
})

// Sets high score to 0 when a user is created
exports.setUserData = functions.database.ref('/users/{uid}').onWrite(event => {
  // Only edit data when it is first created.
  if (!event.data.exists()) {
    return;
  }  
  if (event.data.previous.exists()) {
    return;
  }
  const user = event.data.val();
  return admin.database().ref(`/users/${event.params.uid}`).update({wins:0,highScore:0,highScoreDuo:0,userName:user.displayName,sound:true}).catch(e => {
    console.log(e)
  })
})

const CUT_OFF_TIME = 1 * 60 * 60 * 1000; // 1 hour in milliseconds.

exports.deleteOldGamePlayers = functions.database.ref('/gamePlayers/{pushId}/timestamp')
  .onWrite(event => {
  if (event.data.previous.exists()) {
    return;
  }
  const ref = event.data.ref.parent.parent; // reference to the items
  const now = Date.now();
  const cutoff = now - CUT_OFF_TIME;
  const oldItemsQuery = ref.orderByChild('timestamp').endAt(cutoff);
  return oldItemsQuery.once('value').then(snapshot => {
    // create a map with all children that need to be removed
    const updates = {};
    snapshot.forEach(child => {
      updates[child.key] = null;
    });
    // execute all updates in one go and return the result to end the function
    return ref.update(updates);
  });
}); 

exports.deleteOldGames = functions.database.ref('/games/{pushId}/timestamp')
  .onWrite(event => {
  if (event.data.previous.exists()) {
    return;
  }    
  const ref = event.data.ref.parent.parent; // reference to the items
  const now = Date.now();
  const cutoff = now - CUT_OFF_TIME;
  const oldItemsQuery = ref.orderByChild('timestamp').endAt(cutoff);
  return oldItemsQuery.once('value').then(snapshot => {
    // create a map with all children that need to be removed
    const updates = {};
    snapshot.forEach(child => {
      updates[child.key] = null;
    });
    // execute all updates in one go and return the result to end the function
    return ref.update(updates);
  });
}); 

exports.deleteOldGameRound = functions.database.ref('/gameRounds/{pushId}/timestamp')
  .onWrite(event => {
  if (event.data.previous.exists()) {
    return;
  }    
  const ref = event.data.ref.parent.parent; // reference to the items
  const now = Date.now();
  const cutoff = now - CUT_OFF_TIME;
  const oldItemsQuery = ref.orderByChild('timestamp').endAt(cutoff);
  return oldItemsQuery.once('value').then(snapshot => {
    // create a map with all children that need to be removed
    const updates = {};
    snapshot.forEach(child => {
      updates[child.key] = null;
    });
    // execute all updates in one go and return the result to end the function
    return ref.update(updates);
  });
});  

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
  let length = 90
  if(n >= 40 && n < 50){
    length = 100;
  }else if (n >= 50 && n < 60) {
    length = 110;
  }else if (n >= 60) {
    length = 120;
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