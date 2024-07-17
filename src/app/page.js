"use client"

import Image from 'next/image'
import { motion, AnimatePresence } from "framer-motion"
import { MouseEvent, useEffect, useState } from 'react';
import getCards from './util/playerService';
//import { NumberLiteralType } from 'typescript';
import { ArrowRightIcon, DocumentDuplicateIcon, ShareIcon } from '@heroicons/react/20/solid';

const initialCards = getCards();

export default function Home() {
  const [strikes, setStrikes] = useState(0)
  const [score, setScore] = useState(0)
  const [playStatus, setPlayStatus] = useState(true)
  const [winner, setWinner] = useState(2) // 2 is neither
  const [winnerID, setWinnerID] = useState('')
  
  // const [players, setPlayers] = useState<Array<Array<Player>>>(initialPlayers)
  // const [stats, setStats] = useState<Array<string>>(initialStats)
  const [cards, setCards] = useState(initialCards)

  useEffect(() => {
    // var array = [...players]
    // array.splice(0, 1)
    // setPlayers(array)
  
    // var arrayStats = [...stats]
    // arrayStats.splice(0, 1)
    // setStats(arrayStats)
  
    updateData()
  }, []);
  
  function checkSolution (card) {
    console.log(cards)
    // comp the selected player (in this props) and the players.slice to see who won
    const currCards = cards[0] // first pair

    // console.log(currStat)
    // console.log(currPlayers[0][currStat], currPlayers[1][currStat])

    // Player 0 is winner
    if (currCards[0]["Price"] > currCards[1]["Price"]) {
      // console.log('0:', currPlayers[0].nameFirst, currPlayers[0].nameLast)
      setWinner(0)
      setWinnerID(currCards[0]["Card Name"])
      if (card["Card Name"] !== currCards[0]["Card Name"]) {
        setStrikes(strikes + 1)
      } else {
        setScore(score + 1)
      }
    } else if (currCards[0]["Price"] < currCards[1]["Price"]) {
      // Player 1 is winner
      // console.log('1:', currPlayers[1].nameFirst, currPlayers[1].nameLast)
      setWinner(1)
      setWinnerID(currCards[1]["Card Name"])
      if (card["Card Name"] !== currCards[1]["Card Name"]) {
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
    if (cards.length === 0) {
      setCards(getCards())
    } else {
      var array = [...cards]
    array.splice(0, 1)
    setCards(array)
    }
    
    setPlayStatus(true)
    setWinner(2)
    setWinnerID('')
  }

  const priceFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  });

  return (
    <AnimatePresence mode="wait">
    <div className="flex flex-col w-screen h-screen bg-gradient-to-b from-neutral-800 to-neutral-950">
      
      {/* Game Over */}
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

          <div className='mt-8 grid grid-rows-2 w-full gap-4'>
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => window.location.reload()}
              className="flex items-center gap-x-1 rounded-md bg-yellow-700 mx-auto px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-yellow-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600"
            >
              Play again
              <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                navigator.clipboard.writeText(`Score: ${score} \n\nTry the MLB Higher Lower Game at https://mlbhigherlower.vercel.app`)
                .then(() => alert('Score copied!'))
              }}
              className="flex items-center gap-x-1 rounded-md border-2 border-yellow-600 mx-auto px-3.5 py-2.5 text-sm font-semibold text-white hover:border-yellow-500 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600"
            >
              Share your score
              <DocumentDuplicateIcon className="h-5 w-5" aria-hidden="true" />
            </motion.button>
          </div>
        </div>
      </motion.div>
      }
      <div className='flex flex-col m-auto gap-6'>
    
    {/* Question */}
      {cards[0] &&
      <div className='mx-auto mb-0 text-lg md:text-xl font-semibold text-white'>
        Higher or Lower?
      </div>
      }

    {/* Player Cards */}
      <div className='grid grid-cols-2 gap-4 md:gap-12 my-auto w-screen text-center md:max-w-2xl mx-auto mt-0'>
      
        {cards[0] && cards[0].map((card) => {
          // console.log(player)
          return(
            <motion.button 
              key={card["Card Name"]}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col overflow-hidden md:rounded-lg shadow bg-gray-700 ${playStatus ? '' : 'pointer-events-none'}`}
              onClick={() => checkSolution(card)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              suppressHydrationWarning
            >
              {/* <p className='p-4 font-semibold text-gray-50 text-sm md:text-base uppercase mx-auto' suppressHydrationWarning>{card["Card Name"]}</p> */}
              <Image className={`h-full w-full object-fit object-top relative ${(playStatus || winnerID === card["Card Name"]) ? '' : 'opacity-20'}`} src={card["Image"]} alt={card["Card Name"]} width={300} height={1000} suppressHydrationWarning/>  
            </motion.button>
        )})}
          
          <div className={`m-auto w-full text-white border-2 md:rounded-lg p-2 md:p-4 ${winner === 0 ? 'bg-green-600 font-bold border-white' : 'bg-gray-500 border-gray-500'}`}>
            {playStatus ? '---' : `${priceFormatter.format(cards[0][0]["Price"])}`}
          </div>
          
          <div className={`m-auto w-full text-white border-2 md:rounded-lg p-2 md:p-4 ${winner === 1 ? 'bg-green-600 font-bold border-white' : 'bg-gray-500 border-gray-500'}`}>
            {playStatus ? '---' : `${priceFormatter.format(cards[0][1]["Price"])}`}
          </div>
        </div>

        <div className='mt-1 flex gap-6 mx-auto'>
          <p className='text-white'>Score: <span className='font-semibold text-white'>{score}/100</span></p>
          {/* <p>High Score: </p> */}
        </div>

        <div className='mt-1 flex gap-2 mx-auto'>
          <div className={`w-10 h-10 border-2 border-white rounded-full ${strikes > 0 ? 'bg-red-600' : ''}`}/>
          <div className={`w-10 h-10 border-2 border-white rounded-full ${strikes > 1 ? 'bg-red-600' : ''}`}/>
          <div className={`w-10 h-10 border-2 border-white rounded-full ${strikes > 2 ? 'bg-red-600' : ''}`}/>
        </div>

      </div>

      <div className='absolute text-xs bottom-0 right-0 m-2 md:m-4 text-gray-500'>
        Made by <a href='https://www.linkedin.com/in/evanping/' target='_blank' className='font-medium text-gray-600 hover:text-gray-700'>Evan</a>
      </div>
    </div>
    </AnimatePresence>
  )
}
