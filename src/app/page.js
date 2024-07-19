"use client"

import Image from 'next/image'
import { motion, AnimatePresence } from "framer-motion"
import { MouseEvent, useEffect, useState, useRef} from 'react';
import getCards from './util/cardService';
import { ArrowRightIcon, DocumentDuplicateIcon, ShareIcon } from '@heroicons/react/20/solid';
import CountUp from 'react-countup';

const initialCards = getCards();
const maxStrikes = 3;

export default function Home() {
  const [strikes, setStrikes] = useState(0)
  const [score, setScore] = useState(0)
  const [playStatus, setPlayStatus] = useState(true)
  const [winner, setWinner] = useState(2) // 2 is neither
  const [winnerID, setWinnerID] = useState('')
  const isFirstRender = useRef(true)
  
  const [cards, setCards] = useState(initialCards)

  useEffect(() => {
    
    if (isFirstRender.current) {
      updateData()
      isFirstRender.current = false
      return
    }

    console.log("effect")
    setTimeout(updateData, 2000)
    
  }, [strikes, score]);
  
  function checkSolution (card) {
    console.log(cards)
    const currCards = cards[0] // first pair

    // Player 0 is winner
    if (currCards[0]["Price"] > currCards[1]["Price"]) {
      setWinner(0)
      setWinnerID(currCards[0]["Card Name"])
      if (card["Card Name"] !== currCards[0]["Card Name"]) {
        setStrikes(strikes + 1)
      } else {
        setScore(score + 1)
      }
    } else if (currCards[0]["Price"] < currCards[1]["Price"]) {
      // Player 1 is winner
      setWinner(1)
      setWinnerID(currCards[1]["Card Name"])
      if (card["Card Name"] !== currCards[1]["Card Name"]) {
        setStrikes(strikes + 1)
      } else {
        setScore(score + 1)
      }
    } else {
      setWinnerID(currCards[1]["Card Name"])
      setScore(score + 1)
    }

    setPlayStatus(false)
  }

  function updateData() {
    console.log("play status", playStatus)
    console.log("strikes: ", strikes)
    if (strikes === maxStrikes) return;
    console.log("updating data")
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

  return (
    <AnimatePresence mode="wait">
      <div className="flex overflow-auto flex-col min-w-screen min-h-screen bg-gradient-to-b from-neutral-800 to-neutral-950 relative">
        {/* Game Over */}
        {(strikes === maxStrikes ) &&
          <motion.div 
            className={`fixed overflow-auto z-10 w-full h-full bg-opacity-80 flex flex-col items-center ${strikes === maxStrikes ? 'bg-gray-800' : 'bg-green-600'}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{
              delay: 2
            }}
          >
            <div className='my-auto text-white text-center flex flex-col gap-4'>
              {strikes === maxStrikes ? 
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
                  className="flex items-center gap-x-1 rounded-md bg-green-700 mx-auto px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                >
                  Play again
                  <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    navigator.clipboard.writeText(`Score: ${score} \n\nTry the Pokemon Card Higher Lower Game at https://higherlowercards.vercel.app`)
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
      
      <div className='flex flex-col my-2 sm:my-4 m-auto gap-3 mb-0'>
      
        {/* Higher or Lower Logo */}
        {cards[0] &&
        <div className='flex flex-col items-center justify-center'>
          <div className='mx-auto mb-0 mt-2 text-xl md:text-3xl font-semibold text-white'>
            <span style={{ color: '#22c55e' }}>HIGHER</span> or <span style={{ color: 'red' }}>LOWER</span> ?
          </div>
          <div className='mx-auto mb-0 mt-1 text-xs text-white'>
            Pick the card you think is worth more!
          </div>
        </div>
        }

        {/* Cards */}
        <div className='items-center grid grid-cols-2 gap-x-1 gap-y-0 my-auto w-screen text-center md:max-w-3xl mx-auto mt-0'>
        
          {cards[0] && cards[0].map((card) => {
            // console.log(player)
            return(
              <motion.button 
                key={card["Card Name"]}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`flex flex-col overflow-hidden md:rounded-lg bg-opacity-0 ${playStatus ? '' : 'pointer-events-none'}`}
                onClick={() => checkSolution(card)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                suppressHydrationWarning
              >
                {/* <p className='p-4 font-semibold text-gray-50 text-sm md:text-base uppercase mx-auto' suppressHydrationWarning>{card["Card Name"]}</p> */}
                <Image className={`max-h-[315px] sm:max-h-[520px] max-w-full object-contain object-top ${(winnerID == card["Card Name"] || winnerID == "equal" || playStatus) ? '' : 'opacity-50'}`} src={card["Image"]} alt={card["Card Name"]} width={500} height={1000} suppressHydrationWarning/>
              </motion.button>
          )})}
            
            
            <div className={`min-h-10 m-auto w-full text-3xl font-bold md:rounded-lg p-1 md:p-4 bg-opacity-0 ${winner === 0 ? 'text-green-500' : ''} ${winner === 1 ? 'text-red-600' : ''} ${winner === 2 ? 'text-white' : ''}`}>
              {playStatus ? (
                <span className="invisible">Placeholder</span>
              ) : (
                <CountUp start={0} end={cards[0][0]["Price"]} duration={0.6} separator="," prefix="$" />
              )}
            </div>

            <div className={`min-h-10 m-auto w-full text-3xl font-bold md:rounded-lg p-1 md:p-4 bg-opacity-0 ${winner === 1 ? 'text-green-500' : ''} ${winner === 0 ? 'text-red-600' : ''} ${winner === 2 ? 'text-white' : ''}`}>
              {playStatus ? (
                <span className="invisible">Placeholder</span>
              ) : (
                <CountUp start={0} end={cards[0][1]["Price"]} duration={0.6} separator="," prefix="$" />
              )}
            </div>
          </div>

          <div className='mt-1 flex gap-1 mx-auto'>
            <p className='text-white'>Score: <span className='font-semibold text-white'>{score}</span></p>
            {/* <p>High Score: </p> */}
          </div>
          
          {/* Strikes - comment out if necessary */}
          <div className='mt-1 flex gap-2 mx-auto mb-5'>
            <div className={`w-10 h-10 border-2 border-white rounded-full ${strikes > 0 ? 'bg-red-600' : ''}`}/>
            <div className={`w-10 h-10 border-2 border-white rounded-full ${strikes > 1 ? 'bg-red-600' : ''}`}/>
            <div className={`w-10 h-10 border-2 border-white rounded-full ${strikes > 2 ? 'bg-red-600' : ''}`}/>
          </div>

        </div>

        <div className='absolute text-xs bottom-0 m-2 text-gray-500 mb-1 md:mb-1'>
          Made by <a href='https://www.linkedin.com/in/evanping/' target='_blank' className='font-medium text-gray-600 hover:text-gray-700'>Evan</a>
        </div>
      </div>
    </AnimatePresence>
  )
}
