"use client"

import Image from 'next/image'
import { motion, AnimatePresence } from "framer-motion"
import { MouseEvent, useEffect, useState } from 'react';
import getPlayers from './util/playerService';
import getQuestions from './util/questionService';
import { NumberLiteralType } from 'typescript';
import { ArrowRightIcon } from '@heroicons/react/20/solid';

// interface Player {
//   playerID: string;
//   nameFirst: string;
//   nameLast: string;
//   yearID: number;
//   stint: number;
//   teamID: string;
//   lgID: string;
//   G: number;
//   AB: number;
//   R: number;
//   H: number;
//   '2B': number;
//   '3B': number;
//   HR: number;
//   RBI: number;
//   SB: number;
//   CS: number;
//   BB: number;
//   SO: number;
//   IBB: number;
//   HBP: number;
//   SH: number;
//   GIDP: number; 
//   image: string;
// }

const baseballTermsDictionary = {
  'H': 'hits',
  '2B': 'doubles',
  '3B': 'triples',
  'HR': 'home runs',
  'RBI': 'RBIs',
  'SB': 'stolen bases',
  'BB': 'walks',
  'SO': 'strikeouts',
};

// const questionsData: Array<Array<any>> = getQuestions();
const questionsData = getQuestions();

// const years: Array<number> = questionsData[0] // inconsistent hydration, so I ignore it
const years = questionsData[0]
// const initialStats: Array<any> = questionsData[1]
const initialStats = questionsData[1]
// use the "years" from questions to grab players that played in those years
// const initialPlayers: Array<any> = getPlayers(years);
const initialPlayers= getPlayers(years);

export default function Home() {
  const [strikes, setStrikes] = useState(0)
  const [score, setScore] = useState(0)
  const [playStatus, setPlayStatus] = useState(true)
  const [winner, setWinner] = useState(2) // 2 is neither
  const [winnerID, setWinnerID] = useState('')
  
  // const [players, setPlayers] = useState<Array<Array<Player>>>(initialPlayers)
  // const [stats, setStats] = useState<Array<string>>(initialStats)
  const [players, setPlayers] = useState(initialPlayers)
  const [stats, setStats] = useState(initialStats)

  useEffect(() => {
    // var array = [...players]
    // array.splice(0, 1)
    // setPlayers(array)

    // var arrayStats = [...stats]
    // arrayStats.splice(0, 1)
    // setStats(arrayStats)

    updateData()
  }, []);
  
  function checkSolution (player, currStat) {
    // comp the selected player (in this props) and the players.slice to see who won
    const currPlayers = players.slice(0, 1)[0]

    // console.log(currStat)
    // console.log(currPlayers[0][currStat], currPlayers[1][currStat])

    // Player 0 is winner
    if (currPlayers[0][currStat] > currPlayers[1][currStat]) {
      // console.log('0:', currPlayers[0].nameFirst, currPlayers[0].nameLast)
      setWinner(0)
      setWinnerID(currPlayers[0].playerID)
      if (player.playerID !== currPlayers[0].playerID) {
        setStrikes(strikes + 1)
      } else {
        setScore(score + 1)
      }
    } else if (currPlayers[0][currStat] < currPlayers[1][currStat]) {
      // Player 1 is winner
      // console.log('1:', currPlayers[1].nameFirst, currPlayers[1].nameLast)
      setWinner(1)
      setWinnerID(currPlayers[1].playerID)
      if (player.playerID !== currPlayers[1].playerID) {
        setStrikes(strikes + 1)
      } else {
        setScore(score + 1)        
      }
    } else {
      // console.log('equal?')
      setScore(score + 1)
    }

    setPlayStatus(false)
    setTimeout(updateData, 2000)
  }

  function updateData() {
    var array = [...players]
    array.splice(0, 1)
    setPlayers(array)

    var arrayStats = [...stats]
    arrayStats.splice(0, 1)
    setStats(arrayStats)
    
    setPlayStatus(true)
    setWinner(2)
    setWinnerID('')
  }

  return (
    <AnimatePresence mode="wait">
    <div className="flex w-screen h-screen bg-gradient-to-b from-amber-300 to-amber-400">
      {(strikes === 3 || score === 100 )&& 
      <motion.div 
        className={`absolute z-10 w-screen h-screen opacity-80 flex flex-col items-center ${strikes === 3 ? 'bg-gray-600' : 'bg-green-600'}`}
        initial={{ y: -300, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{
          delay: 1
        }}
      >
        <div className='my-auto text-white text-center flex flex-col gap-4'>
          {strikes === 3 ? 
            <p className='font-medium text-3xl'>Game Over</p> 
          : <p className='font-medium text-3xl'>Congratulations!</p>
          }
          <p className=''>Your final score: {score}</p>
          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.location.reload()}
            className="mt-4 flex items-center gap-x-1 rounded-md bg-yellow-600 mx-auto px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600"
          >
            Play again
            <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
          </motion.button>
        </div>
      </motion.div>
      }
      <div className='flex flex-col m-auto gap-6'>
    
      {players[0] &&
      <div className='mx-auto mb-0 text-xl'>
        In <span suppressHydrationWarning className='font-semibold'>{players[0][0].yearID}</span>, who had more <span suppressHydrationWarning className='font-semibold'>{baseballTermsDictionary[stats.slice(0, 1)]}</span>?
      </div>
      }

      <div className='grid grid-cols-2 gap-4 md:gap-8 my-auto w-screen text-center md:max-w-2xl mx-auto mt-0'>
      
        {players[0] && players[0].map((player) => {
          // console.log(player)
          return(
            <motion.button 
              key={player.playerID}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col overflow-hidden md:rounded-lg shadow bg-gray-700 ${playStatus ? '' : 'pointer-events-none'}`}
              onClick={() => checkSolution(player, stats.slice(0, 1))}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              suppressHydrationWarning
            >
              <p className='p-4 font-semibold text-gray-50 uppercase mx-auto' suppressHydrationWarning>{player.nameFirst} {player.nameLast}</p>
              <img className={`h-72 md:h-96 w-full object-cover object-top relative ${(playStatus || winnerID === player.playerID) ? '' : 'opacity-20'}`} src={player.image} suppressHydrationWarning/>  
            </motion.button>
        )})}
          
          <div className={`m-auto w-full text-white border-2 md:rounded-lg p-2 md:p-4 ${winner === 0 ? 'bg-green-600 font-bold border-white' : 'bg-gray-500 border-gray-500'}`}>
            {playStatus ? '???' : `${players.slice(0, 1)[0][0][stats.slice(0, 1)]}`}
          </div>
          
          <div className={`m-auto w-full text-white border-2 md:rounded-lg p-2 md:p-4 ${winner === 1 ? 'bg-green-600 font-bold border-white' : 'bg-gray-500 border-gray-500'}`}>
            {playStatus ? '???' : `${players.slice(0, 1)[0][1][stats.slice(0, 1)]}`}
          </div>
        </div>

        <div className='mt-6 flex gap-6 mx-auto'>
          <p className=''>Score: <span className='font-semibold'>{score}/100</span></p>
          {/* <p>High Score: </p> */}
        </div>

        <div className='-mt-2 flex gap-2 mx-auto'>
          <div className={`w-10 h-10 border-2 border-white rounded-full ${strikes > 0 ? 'bg-red-600' : ''}`}/>
          <div className={`w-10 h-10 border-2 border-white rounded-full ${strikes > 1 ? 'bg-red-600' : ''}`}/>
          <div className={`w-10 h-10 border-2 border-white rounded-full ${strikes > 2 ? 'bg-red-600' : ''}`}/>
        </div>

      </div>
      
    </div>
    </AnimatePresence>
  )
}
