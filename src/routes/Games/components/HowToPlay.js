import React from 'react'

export const HowToPlay = ({hideHowTo}) => (

	<div className="posf df jcc aic" style={{top:0,left:0,right:0,bottom:0,zIndex:10,background:"rgba(68, 85, 102,.75)"}}>
		<div className="posr" style={{background:"#fff",width:"60%",maxHeight:"80%",overflow:"auto",maxWidth:640,minWidth:360,padding:20,borderRadius:3,color:"#456"}}>
			<span className="posa fwb tac" style={{cursor:"pointer",top:6,right:6,fontSize:28,padding:"4px 6px 6px",lineHeight:"20px"}} onClick={hideHowTo}>&times;</span>
			<h1 className="tac" style={{marginBottom:20}} onClick={hideHowTo}>Welcome to WordWeaver!</h1>
			<h2>Objective</h2>
			<p>The objective of WordWeaver is simple: unscramble letters and create words in order to score points. You are given 6 scrambled letter with which you must create as many 3, 4, 5, and 6 letter words as possible in the allotted time. The bank of words available for the given set of letters was built using the <a className="text-link" target="_blank" href="https://scrabble.hasbro.com/en-us/tools">official Scrabble</a><sup>&copy;</sup> <a className="text-link" target="_blank" href="https://scrabble.hasbro.com/en-us/tools">dictionary</a>.</p>
			<h2>Game Modes</h2>
			<p style={{marginLeft:20}}><span className="fwb">Single Player:</span> In this mode your objective, in addition to finding as many words as possible, is to find the word that uses all 6 letters. Finding this word (at least one if there are multiple) will let you move to the next round. You will continue to move on and score points as long as you find the longest word each round.</p>
			<p style={{marginLeft:20}}><span className="fwb">Multiplayer Duo Co-Op:</span> In this mode your objective is the same as single player mode with the difference being that you are working with another player to find words.</p>
			<p style={{marginLeft:20}}><span className="fwb">Multiplayer Duo Versus:</span> In this mode you are competing head-to-head with a competitor to find words as quickly as possible. Once a word is found it is no longer available for the other player. The words that each player has captured will be indicated with a color-coded background. The game length is fixed at 3 rounds and the winner is determined by each player's cumulative score for those 3 rounds.</p>
			<h2>Controls</h2>
			<p>Once gameplay begins, you will interact using the keyboard.</p>
			<p style={{marginLeft:20}}><span className="fwb">To select letters</span> from the available scrambled letters, simply type the letter on your keyboard. </p>
			<p style={{marginLeft:20}}><span className="fwb">To submit a guess</span> that you have created, press the <span className="fwb">Enter</span> key. </p>
			<p style={{marginLeft:20}}><span className="fwb">To shuffle the letters</span> available, press the <span className="fwb">Spacebar</span> key. This can be done even when there are letters already selected for your guess.</p>
			<p style={{marginLeft:20}}><span className="fwb">To remove selected letters</span> from your guess, press the <span className="fwb">Backspace</span> or <span className="fwb">Delete</span> key.</p>
			<p style={{marginLeft:20}}><span className="fwb">To clear all letters</span> from your guess, press the <span className="fwb">Escape</span> key.</p>
			<h2>Scoring</h2>
			<p>Scoring is based on Scrabble letter value. The value of each word that you capture is a combination of the value of each letter added together, then multiplied by 10. For example "THE" would have a value of 40: (1 + 2 + 1) x 10</p>
			<p>There is also a multiplier for the length of the word: 2x for 4-letter words, 3x for 5-letter words, and 4x for 6-letter words.</p>
		</div>
	</div>

)