"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import getCards from "./util/cardService";
import {
  ArrowRightIcon,
  DocumentDuplicateIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/20/solid";
import { FaInstagram } from "react-icons/fa";
import CountUp from "react-countup";

const maxStrikes = 1;
let highScore = 0;
if (typeof window !== "undefined") {
  highScore = localStorage.getItem("highScore") || 0;
}

export default function Home() {
  const [strikes, setStrikes] = useState(0);
  const [score, setScore] = useState(0);
  const [playStatus, setPlayStatus] = useState(true);
  const [winner, setWinner] = useState(2); // 2 is neither, 1 is higher, 0 is lower
  const isFirstRender = useRef(true);

  const [cards, setCards] = useState(() => getCards()); // cards[0] and cards[1] are current displayed cards
  const [preload, setPreload] = useState(null);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isFirstRender.current) {
      updateData();
      isFirstRender.current = false;
      return;
    }

    setTimeout(updateData, 2000);
  }, [strikes, score]);

  useEffect(() => {
    function setViewportHeight() {
      let vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    }

    // Set the initial viewport height
    setViewportHeight();

    // Update the viewport height on resize and orientation change
    window.addEventListener("resize", setViewportHeight);
    window.addEventListener("orientationchange", setViewportHeight);

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener("resize", setViewportHeight);
      window.removeEventListener("orientationchange", setViewportHeight);
    };
  }, []);

  useEffect(() => {
    // Preload the image on deck
    const preloadImages = () => {
      setPreload(
        <Image
          key={cards[2]["Card Name"]}
          src={cards[2]["Image"]}
          alt={"on deck"}
          width={500}
          height={1000}
          className="hidden absolute"
          priority
          // onLoadingComplete={() =>
          //   console.log("preloaded image " + cards[2]["Card Name"])
          // }
        />
      );
    };

    preloadImages();
  }, [cards]);

  function checkSolution(choice) {
    // choice: 1 is higher, 0 is lower

    if (choice === 1) {
      // higher
      if (cards[1]["Price"] < cards[0]["Price"]) {
        setStrikes(strikes + 1);
        if (score > highScore) {
          highScore = score;
          localStorage.setItem("highScore", score);
        }
        setWinner(0);
      } else {
        setScore(score + 1);
        cards[1]["Price"] === cards[0]["Price"] ? setWinner(2) : setWinner(1);
      }
    } else if (choice === 0) {
      // lower
      if (cards[1]["Price"] > cards[0]["Price"]) {
        setStrikes(strikes + 1);
        if (score > highScore) {
          highScore = score;
          localStorage.setItem("highScore", score);
        }
        setWinner(1);
      } else {
        setScore(score + 1);
        cards[1]["Price"] === cards[0]["Price"] ? setWinner(2) : setWinner(0);
      }
    }

    setPlayStatus(false);
  }

  function updateData() {
    if (strikes === maxStrikes) return;
    var array = [...cards];

    // remove equal cards
    while (array.length >= 3 && array[2]["Price"] === array[1]["Price"]) {
      array.splice(2, 1);
      if (array.length < 3) {
        //console.log("Getting more cards");
        array = array.concat(getCards());
      }
    }

    array.splice(0, 1);
    if (array.length < 3) {
      array = array.concat(getCards());
    }

    setCards(array);

    setPlayStatus(true);
    setWinner(2);
  }

  return (
    <AnimatePresence mode="wait">
      <div className="root-component-class bg-gradient-to-b from-neutral-800 to-neutral-950">
        <div className="flex overflow-auto flex-col w-full h-full relative">
          {/* Game Over */}
          {strikes === maxStrikes && (
            <motion.div
              className={`fixed overflow-auto z-10 w-full h-full bg-opacity-75 flex flex-col items-center bg-gray-900`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{
                delay: 2,
              }}
            >
              <div className="my-auto text-white text-center flex flex-col gap-4">
                {/* <p className="font-medium text-3xl">Game Over</p> */}
                <p className="font-medium text-3xl">Your Score: {score}</p>
                <p className="">High Score: {highScore}</p>

                {/* <div className="mt-8 grid grid-rows-2 w-full gap-4"> */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-x-1 rounded-md border-2 border-green-700 mx-auto px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 mt-8 mb-5"
                >
                  Play again
                  <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
                </motion.button>
                {/* <motion.button
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                      navigator.clipboard
                        .writeText(
                          `Score: ${score} \n\nTry the Pokemon Card Higher Lower Game at https://higherlowercards.vercel.app`
                        )
                        .then(() => alert("Score copied!"));
                    }}
                    className="flex items-center gap-x-1 rounded-md border-2 border-yellow-600 mx-auto px-3.5 py-2.5 text-sm font-semibold text-white hover:border-yellow-500 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600"
                  >
                    Share your score
                    <DocumentDuplicateIcon
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </motion.button> */}
                {/* </div> */}
                {/* <p className="bottom-0 m-2 text-xs flex items-center justify-center">
                  <a
                    href="https://www.instagram.com/higherlowercards"
                    target="_blank"
                    className="flex items-center font-medium text-red-400 hover:text-red-500"
                  >
                    <FaInstagram className="h-4 w-4 mr-1" />
                    <span className="text-white hover:text-red-200">
                      Send a suggestion!
                    </span>
                  </a>
                </p> */}
              </div>
            </motion.div>
          )}

          <div className="flex flex-col my-2 sm:my-4 m-auto gap-3 mb-0">
            {/* Higher or Lower Logo */}
            <div className="flex flex-col items-center justify-center">
              <div className="mx-auto mb-2 mt-2 text-2xl md:text-3xl font-semibold text-white">
                <span style={{ color: "#22c55e" }}>HIGHER</span> or{" "}
                <span style={{ color: "red" }}>LOWER</span> ?
              </div>
              {/* <div className="mx-auto mb-0 mt-1 text-xs text-white">
                Pick the card you think is worth more!
              </div> */}
            </div>
            {/* Cards */}
            {preload} {/* Preload the next image */}
            <div className="items-center overflow-hidden grid grid-cols-2 gap-x-1 gap-y-0 my-auto w-screen text-center md:max-w-3xl mx-auto mt-0">
              {cards[0] && (
                <motion.div
                  key={cards[0]["Card Name"]}
                  className={`flex flex-col overflow-hidden md:rounded-lg bg-opacity-0`}
                  initial={{ x: 300, opacity: isFirstRender.current ? 0 : 0.8 }}
                  animate={{ x: 0, opacity: 1, transition: { duration: 0.5 } }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  suppressHydrationWarning
                >
                  <Image
                    className={`max-h-[315px] md:max-h-[425px] xl:max-h-[520px] max-w-full h-3/5 object-contain object-top`}
                    src={cards[0]["Image"]}
                    alt={cards["Card Name"]}
                    width={500}
                    height={1000}
                    suppressHydrationWarning
                  />
                </motion.div>
              )}

              {cards[1] && (
                <motion.div
                  key={cards[1]["Image"]}
                  className={`flex flex-col overflow-hidden md:rounded-lg bg-opacity-0`}
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1, transition: { duration: 0.5 } }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  suppressHydrationWarning
                >
                  <Image
                    className={`max-h-[315px] md:max-h-[425px] xl:max-h-[520px] max-w-full h-3/5 object-contain object-top`}
                    src={cards[1]["Image"]}
                    alt={cards[1]["Card Name"]}
                    width={500}
                    height={1000}
                    suppressHydrationWarning
                  />
                </motion.div>
              )}

              <div
                className={`h-10 m-auto w-full mt-1 text-2xl md:text-3xl font-bold md:rounded-lg p-1 md:p-4 bg-opacity-0 text-white display`}
              >
                <CountUp
                  start={0}
                  end={cards[0]["Price"]}
                  duration={0.6}
                  separator=","
                  prefix="$"
                />
                {isClient && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.5 } }}
                    className="mt-3 text-sm font-normal italic"
                    key={cards[0]["Fun Fact"]}
                  >
                    {cards[0]["Fun Fact"]}
                  </motion.div>
                )}
              </div>

              <div
                className={`h-32 m-auto w-full mt-1 text-2xl md:text-3xl font-bold md:rounded-lg p-1 md:p-4 bg-opacity-0 ${
                  winner === 1 ? "text-green-500" : ""
                } ${winner === 0 ? "text-red-600" : ""} ${
                  winner === 2 ? "text-white" : ""
                }`}
              >
                {!playStatus && (
                  <CountUp
                    start={0}
                    end={cards[1]["Price"]}
                    duration={0.6}
                    separator=","
                    prefix="$"
                  />
                )}

                {strikes === maxStrikes && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.5 } }}
                    className="mt-3 text-white text-xs md:text-sm font-normal italic"
                    key={cards[1]["Fun Fact"]}
                  >
                    {cards[1]["Fun Fact"]}
                  </motion.div>
                )}

                {playStatus && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.5 } }}
                  >
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        checkSolution(1);
                      }}
                      className="w-3/4 sm:w-3/5 flex items-center justify-center gap-x-1 md:gap-x-3 rounded-full border-2 border-green-600 mx-auto px-3.5 py-1.5 md:py-2.5 text-base font-semibold text-green-500 hover:border-green-500 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                    >
                      Higher
                      <ChevronUpIcon className="h-6 w-6" aria-hidden="true" />
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        checkSolution(0);
                      }}
                      className="w-3/4 sm:w-3/5 flex items-center justify-center gap-x-1 md:gap-x-3 rounded-full border-2 border-red-600 mx-auto px-3.5 py-1.5 md:py-2.5 text-base font-semibold text-red-500 hover:border-red-500 shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 mt-2"
                    >
                      Lower
                      <ChevronDownIcon className="h-6 w-6" aria-hidden="true" />
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-1 mx-auto">
              <p className="text-white">
                Score: <span className="font-semibold text-white">{score}</span>
              </p>
            </div>
            {/* Strikes - comment out if necessary */}
            {/* <div className="mt-1 flex gap-2 mx-auto mb-5">
            <div
              className={`w-10 h-10 border-2 border-white rounded-full ${
                strikes > 0 ? "bg-red-600" : ""
              }`}
            />
            <div
              className={`w-10 h-10 border-2 border-white rounded-full ${
                strikes > 1 ? "bg-red-600" : ""
              }`}
            />
            <div
              className={`w-10 h-10 border-2 border-white rounded-full ${
                strikes > 2 ? "bg-red-600" : ""
              }`}
            />
          </div> */}
          </div>
        </div>
        <div className="absolute text-xs bottom-0 m-2 text-gray-500 mb-1 md:mb-1">
          Made by{" "}
          <a
            href="https://www.linkedin.com/in/evanping/"
            target="_blank"
            className="font-medium text-gray-600 hover:text-gray-700"
          >
            Evan
          </a>
        </div>
      </div>
    </AnimatePresence>
  );
}
