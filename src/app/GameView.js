"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useState, useRef } from "react";
import { initializeCardBank, getCards, isCardBankReady } from "./util/cardService";
import {
  ArrowRightIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/20/solid";
import CountUp from "react-countup";

const maxStrikes = 1;
const prizePromptDelayMs = 1600;
const decodedImageUrls = new Set();
let highScore = 0;
if (typeof window !== "undefined") {
  highScore = localStorage.getItem("highScore") || 0;
}

function ShowProgressBar({ score }) {
  const markedSegments = Math.min(score, 10);

  return (
    <div className="flex w-full max-w-sm shrink-0 gap-[clamp(0.2rem,0.8vmin,0.375rem)] rounded-full bg-white/5 p-[clamp(0.3rem,1vmin,0.5rem)] shadow-lg ring-1 ring-white/10">
      {Array.from({ length: 10 }, (_, index) => {
        const segmentNumber = index + 1;
        const isMarked = segmentNumber <= markedSegments;
        const isGreenTarget = segmentNumber === 5;
        const isRedTarget = segmentNumber === 10;

        return (
          <div
            key={segmentNumber}
            className={`h-3 flex-1 rounded-full border transition-colors ${
              isMarked && isGreenTarget
                ? "border-green-400 bg-green-500"
                : isMarked && isRedTarget
                ? "border-red-400 bg-red-500"
                : isMarked
                ? "border-white bg-white"
                : isGreenTarget
                ? "border-green-500/70 bg-green-500/15"
                : isRedTarget
                ? "border-red-500/70 bg-red-500/15"
                : "border-white/10 bg-white/10"
            }`}
            style={
              isGreenTarget || isRedTarget
                ? {
                    borderWidth: 2,
                    borderColor: isGreenTarget ? "#22c55e" : "#ef4444",
                  }
                : undefined
            }
            aria-label={`Progress segment ${segmentNumber}`}
          />
        );
      })}
    </div>
  );
}

function LoadingScreen({ className = "" }) {
  return (
    <div
      className={`flex items-center justify-center bg-gradient-to-b from-neutral-800 to-neutral-950 px-4 ${className}`}
    >
      <div className="text-center text-white">
        <div className="mb-4 text-2xl font-semibold">Loading...</div>
        <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-white"></div>
      </div>
    </div>
  );
}

async function preloadAndDecodeImage(imageUrl) {
  if (!imageUrl || decodedImageUrls.has(imageUrl) || typeof window === "undefined") return;

  await new Promise((resolve) => {
    const image = new window.Image();

    image.onload = async () => {
      try {
        if (image.decode) {
          await image.decode();
        }
      } catch (error) {
        // The image is already loaded; decode failures should not block play.
      }

      decodedImageUrls.add(imageUrl);
      resolve();
    };

    image.onerror = () => {
      decodedImageUrls.add(imageUrl);
      resolve();
    };
    image.src = imageUrl;
  });
}

export function Game({ showProgress = false } = {}) {
  const [strikes, setStrikes] = useState(0);
  const [score, setScore] = useState(0);
  const [playStatus, setPlayStatus] = useState(true);
  const [winner, setWinner] = useState(2); // 2 is neither, 1 is higher, 0 is lower
  const [showHitCardPrompt, setShowHitCardPrompt] = useState(false);
  const [showChaseCardPrompt, setShowChaseCardPrompt] = useState(false);
  const [hitCardPromptSeen, setHitCardPromptSeen] = useState(false);
  const [chaseCardPromptSeen, setChaseCardPromptSeen] = useState(false);
  const isFirstRender = useRef(true);
  const cardsRef = useRef([]);
  const preloadedImageUrlRef = useRef("");
  const cardStageRef = useRef(null);
  const cardStageHeightRef = useRef(0);

  const [cards, setCards] = useState([]); // cards[0] and cards[1] are current displayed cards
  const [preload, setPreload] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [layoutReady, setLayoutReady] = useState(false);
  const [visibleImageLoadKeys, setVisibleImageLoadKeys] = useState({
    left: "",
    right: "",
  });
  const [cardStageHeight, setCardStageHeight] = useState(0);

  const updateData = useCallback(async () => {
    if (!isCardBankReady() || strikes === maxStrikes) return;

    const onDeckImageUrl = cardsRef.current[2]?.["Image"];
    if (onDeckImageUrl && preloadedImageUrlRef.current !== onDeckImageUrl) {
      await preloadAndDecodeImage(onDeckImageUrl);
      preloadedImageUrlRef.current = onDeckImageUrl;
    }

    setCards(getCards());
    setPlayStatus(true);
    //setWinner(2);
  }, [strikes]);

  const markVisibleImageLoaded = useCallback((side, imageUrl) => {
    setVisibleImageLoadKeys((currentImageLoadKeys) =>
      currentImageLoadKeys[side] === imageUrl
        ? currentImageLoadKeys
        : { ...currentImageLoadKeys, [side]: imageUrl }
    );
  }, []);

  useEffect(() => {
    async function initialize() {
      try {
        setIsLoading(true);
        await initializeCardBank();
        
        // Initialize the first set of cards
        const initialCards = getCards();
        setCards(initialCards);
        setIsClient(true);
        setIsLoading(false);
        
        console.log("App initialized successfully");
      } catch (error) {
        console.error("Failed to initialize card bank:", error);
        //setLoadingError(error.message);
        setIsLoading(false);
      }
    }

    initialize();
  }, []);

  useEffect(() => {
    cardsRef.current = cards;
  }, [cards]);

  useEffect(() => {
    const waitingForPrizePrompt =
      showProgress &&
      ((score === 5 && !hitCardPromptSeen) ||
        (score === 10 && !chaseCardPromptSeen));

    if (
      !isCardBankReady() ||
      isLoading ||
      showHitCardPrompt ||
      showChaseCardPrompt ||
      waitingForPrizePrompt
    ) {
      return;
    }

    if (
      showProgress &&
      ((score === 5 && hitCardPromptSeen) ||
        (score === 10 && chaseCardPromptSeen))
    ) {
      return;
    }

    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    setTimeout(updateData, 2000);
  }, [
    score,
    isLoading,
    showProgress,
    showHitCardPrompt,
    showChaseCardPrompt,
    hitCardPromptSeen,
    chaseCardPromptSeen,
    updateData,
  ]);

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
    if (!isCardBankReady() || !cards[2]) return;
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
          onLoad={() => {
            preloadedImageUrlRef.current = cards[2]["Image"];
          }}
          onLoadingComplete={() => {
            preloadedImageUrlRef.current = cards[2]["Image"];
          }}
        />
      );
    };

    preloadImages();
  }, [cards]);

  function checkSolution(choice) {
    // choice: 1 is higher, 0 is lower

    if (choice === 1) {
      // actually lower
      if (cards[1]["Price"] < cards[0]["Price"]) {
        setStrikes(strikes + 1);
        if (score > highScore) {
          highScore = score;
          localStorage.setItem("highScore", score);
        }
        setWinner(0);
      } else {
        const nextScore = score + 1;
        setScore(nextScore);
        if (showProgress && nextScore === 5) {
          setTimeout(() => setShowHitCardPrompt(true), prizePromptDelayMs);
        }
        if (showProgress && nextScore === 10) {
          setTimeout(() => setShowChaseCardPrompt(true), prizePromptDelayMs);
        }
        //cards[1]["Price"] === cards[0]["Price"] ? setWinner(2) : 
        setWinner(1);
      }
    } else if (choice === 0) {
      // actually higher
      if (cards[1]["Price"] > cards[0]["Price"]) {
        setStrikes(strikes + 1);
        if (score > highScore) {
          highScore = score;
          localStorage.setItem("highScore", score);
        }
        setWinner(1);
      } else {
        const nextScore = score + 1;
        setScore(nextScore);
        if (showProgress && nextScore === 5) {
          setTimeout(() => setShowHitCardPrompt(true), prizePromptDelayMs);
        }
        if (showProgress && nextScore === 10) {
          setTimeout(() => setShowChaseCardPrompt(true), prizePromptDelayMs);
        }
        //cards[1]["Price"] === cards[0]["Price"] ? setWinner(2) : 
        setWinner(0);
      }
    }

    setPlayStatus(false);
  }

  useEffect(() => {
    if (
      isLoading ||
      !cards[0] ||
      !cards[1] ||
      visibleImageLoadKeys.left !== cards[0]["Image"] ||
      visibleImageLoadKeys.right !== cards[1]["Image"]
    ) {
      return;
    }

    let secondFrame = 0;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        setLayoutReady(true);
      });
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      cancelAnimationFrame(secondFrame);
    };
  }, [cards, isLoading, visibleImageLoadKeys]);

  useEffect(() => {
    if (!layoutReady || !cardStageRef.current || cardStageHeightRef.current) return;

    const firstFrame = requestAnimationFrame(() => {
      const nextHeight = Math.ceil(
        cardStageRef.current?.getBoundingClientRect().height || 0
      );

      if (nextHeight) {
        cardStageHeightRef.current = nextHeight;
        setCardStageHeight(nextHeight);
      }
    });

    return () => cancelAnimationFrame(firstFrame);
  }, [layoutReady]);

  useEffect(() => {
    const resetCardStageHeight = () => {
      cardStageHeightRef.current = 0;
      setCardStageHeight(0);
    };

    window.addEventListener("resize", resetCardStageHeight);
    window.addEventListener("orientationchange", resetCardStageHeight);

    return () => {
      window.removeEventListener("resize", resetCardStageHeight);
      window.removeEventListener("orientationchange", resetCardStageHeight);
    };
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <LoadingScreen className="root-component-class min-h-screen" />
    );
  }

  return (
    <AnimatePresence mode="wait">
      <div className="root-component-class relative bg-gradient-to-b from-neutral-800 via-neutral-900 to-neutral-950 text-white">
        {!layoutReady && (
          <LoadingScreen className="absolute inset-0 z-20" />
        )}
        <main className={`flex h-full w-full flex-col items-center justify-center overflow-hidden px-3 pb-7 pt-3 sm:px-6 sm:pb-7 sm:pt-5 ${layoutReady ? "" : "invisible"}`}>
          {/* Game Over */}
          {strikes === maxStrikes && (
            <motion.div
              className={`fixed inset-0 z-10 flex items-center justify-center overflow-auto bg-gray-900/80 px-4`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{
                delay: 2,
              }}
            >
              <div className="flex w-full max-w-sm flex-col gap-4 text-center text-white">
                {/* <p className="font-medium text-3xl">Game Over</p> */}
                <p className="text-3xl font-semibold">Your Score: {score}</p>
                <p className="text-sm text-neutral-300">High Score: {highScore}</p>

                {/* <div className="mt-8 grid grid-rows-2 w-full gap-4"> */}
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => window.location.reload()}
                  className="mx-auto mt-4 flex items-center gap-x-1 rounded-full border-2 border-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                >
                  Play again
                  <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {showHitCardPrompt && strikes !== maxStrikes && (
            <motion.div
              className={`fixed inset-0 z-10 flex items-center justify-center overflow-auto bg-gray-900/80 px-4`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex w-full max-w-sm flex-col gap-4 text-center text-white">
                <p className="text-3xl font-semibold text-green-500">
                  You won the HIT CARD!
                </p>
                <p className="text-sm leading-relaxed text-neutral-200">
                  Walk away with the HIT CARD, or risk it all to go for the CHASE CARD Prize.
                </p>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setHitCardPromptSeen(true);
                    setShowHitCardPrompt(false);
                    updateData();
                  }}
                  className="mx-auto mt-4 flex items-center gap-x-1 rounded-full border-2 border-green-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                >
                  Keep going
                  <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
                </motion.button>
              </div>
            </motion.div>
          )}

          {showChaseCardPrompt && strikes !== maxStrikes && (
            <motion.div
              className={`fixed inset-0 z-10 flex items-center justify-center overflow-auto bg-gray-900/80 px-4`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex w-full max-w-sm flex-col gap-4 text-center text-white">
                <p className="text-3xl font-semibold text-red-500">
                  You won the CHASE CARD!
                </p>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setChaseCardPromptSeen(true);
                    setShowChaseCardPrompt(false);
                    updateData();
                  }}
                  className="mx-auto mt-4 flex items-center gap-x-1 rounded-full border-2 border-red-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-red-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                >
                  Keep going
                  <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
                </motion.button>
              </div>
            </motion.div>
          )}

          <section className="flex h-full min-h-0 w-full max-w-5xl flex-col items-center justify-center gap-1.5 sm:gap-2.5">
            {/* Higher or Lower Logo */}
            <div className="flex shrink-0 flex-col items-center justify-center">
              <h1 className="text-center text-[clamp(1.75rem,5vmin,3.5rem)] font-black uppercase leading-none tracking-normal text-white drop-shadow-[0_3px_16px_rgba(0,0,0,0.55)]">
                <span className="text-green-500">Higher</span>
                <span className="mx-[clamp(0.4rem,1.2vmin,0.75rem)] text-[clamp(0.85rem,2.2vmin,1.5rem)] font-semibold lowercase text-neutral-200">
                  or
                </span>
                <span className="text-red-500">Lower</span>
                <span className="ml-1 text-neutral-200">?</span>
              </h1>
              <p className="mt-[clamp(0.2rem,0.8vmin,0.5rem)] text-center text-[clamp(0.68rem,1.7vmin,1rem)] font-medium leading-tight text-neutral-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.65)]">
                Predict whether the next card is higher or lower in value!
              </p>
            </div>
            {/* Cards */}
            {preload} {/* Preload the next image */}
            <div
              ref={cardStageRef}
              className="grid min-h-0 w-full grid-cols-2 grid-rows-[auto_auto] gap-x-2 gap-y-5 overflow-hidden text-center sm:gap-x-4 sm:gap-y-8 md:max-w-5xl lg:max-w-6xl"
              style={cardStageHeight ? { height: `${cardStageHeight}px` } : undefined}
            >
              {cards[0] && (
                <motion.div
                  key={cards[0]["Card Name"]}
                  className={`flex h-full w-full flex-col items-center justify-end overflow-hidden rounded-lg`}
                  initial={{ x: 300, opacity: isFirstRender.current ? 0 : 0.8 }}
                  animate={{ x: 0, opacity: 1, transition: { duration: 0.5 } }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  suppressHydrationWarning
                >
                  <Image
                    className={`max-h-[55vh] sm:max-h-[65vh] md:max-h-[75vh] xl:max-h-[85vh] max-w-full h-[95%] object-contain object-bottom drop-shadow-2xl`}
                    src={cards[0]["Image"]}
                    alt={cards[0]["Card Name"]}
                    width={500}
                    height={1000}
                    onLoad={() => markVisibleImageLoaded("left", cards[0]["Image"])}
                    onLoadingComplete={() =>
                      markVisibleImageLoaded("left", cards[0]["Image"])
                    }
                    suppressHydrationWarning
                  />
                </motion.div>
              )}

              {cards[1] && (
                <motion.div
                  key={cards[1]["Image"]}
                  className={`flex h-full w-full flex-col items-center justify-end overflow-hidden rounded-lg`}
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1, transition: { duration: 0.5 } }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  suppressHydrationWarning
                >
                  <Image
                    className={`max-h-[55vh] sm:max-h-[65vh] md:max-h-[75vh] xl:max-h-[85vh] max-w-full h-[95%] object-contain object-bottom drop-shadow-2xl`}
                    src={cards[1]["Image"]}
                    alt={cards[1]["Card Name"]}
                    width={500}
                    height={1000}
                    onLoad={() => markVisibleImageLoaded("right", cards[1]["Image"])}
                    onLoadingComplete={() =>
                      markVisibleImageLoaded("right", cards[1]["Image"])
                    }
                    suppressHydrationWarning
                  />
                </motion.div>
              )}

              <div
                className={`mx-auto flex h-full w-full flex-col items-center p-[clamp(0.35rem,1.4vmin,1rem)] text-[clamp(1.2rem,3.8vmin,1.875rem)] font-bold text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)]`}
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
                    className="mx-auto mt-[clamp(0.25rem,1vmin,0.75rem)] max-w-sm text-[clamp(0.62rem,1.5vmin,0.875rem)] font-normal italic leading-snug text-neutral-300"
                    key={cards[0]["Fun Fact"]}
                  >
                    {cards[0]["Fun Fact"]}
                  </motion.div>
                )}
              </div>

              <div
                className={`mx-auto flex h-[7.75rem] w-full flex-col items-center justify-start overflow-visible p-[clamp(0.3rem,1vmin,0.65rem)] text-[clamp(1.2rem,3.8vmin,1.875rem)] font-bold drop-shadow-[0_2px_10px_rgba(0,0,0,0.75)] ${
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
                    className="mx-auto mt-[clamp(0.25rem,1vmin,0.75rem)] max-w-sm text-[clamp(0.62rem,1.5vmin,0.875rem)] font-normal italic leading-snug text-neutral-200"
                    key={cards[1]["Fun Fact"]}
                  >
                    {cards[1]["Fun Fact"]}
                  </motion.div>
                )}

                {playStatus && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: 0.5 } }}
                    className="w-full"
                  >
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        checkSolution(1);
                      }}
                      className="mx-auto flex w-full max-w-[clamp(11.2rem,30.4vmin,16.8rem)] items-center justify-center gap-x-[clamp(0.3rem,0.9vmin,0.65rem)] rounded-full border-2 border-green-600 bg-green-950/20 px-[clamp(0.85rem,2.4vmin,1.25rem)] py-[clamp(0.4rem,1.1vmin,0.6rem)] text-[clamp(0.95rem,2vmin,1.15rem)] font-semibold text-green-500 shadow-sm transition hover:border-green-500 hover:bg-green-950/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                    >
                      Higher
                      <ChevronUpIcon className="h-[clamp(1.1rem,2.8vmin,1.5rem)] w-[clamp(1.1rem,2.8vmin,1.5rem)]" aria-hidden="true" />
                    </motion.button>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => {
                        checkSolution(0);
                      }}
                      className="mx-auto mt-[clamp(0.4rem,1.2vmin,0.65rem)] flex w-full max-w-[clamp(11.2rem,30.4vmin,16.8rem)] items-center justify-center gap-x-[clamp(0.3rem,0.9vmin,0.65rem)] rounded-full border-2 border-red-600 bg-red-950/20 px-[clamp(0.85rem,2.4vmin,1.25rem)] py-[clamp(0.4rem,1.1vmin,0.6rem)] text-[clamp(0.95rem,2vmin,1.15rem)] font-semibold text-red-500 shadow-sm transition hover:border-red-500 hover:bg-red-950/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                    >
                      Lower
                      <ChevronDownIcon className="h-[clamp(1.1rem,2.8vmin,1.5rem)] w-[clamp(1.1rem,2.8vmin,1.5rem)]" aria-hidden="true" />
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </div>
            <div className="mx-auto flex shrink-0 rounded-full border border-white/10 bg-white/5 px-[clamp(0.85rem,2.2vmin,1rem)] py-[clamp(0.2rem,0.8vmin,0.25rem)] text-[clamp(0.78rem,1.8vmin,1rem)] shadow-lg">
              <p className="text-neutral-200">
                Score: <span className="font-semibold text-white">{score}</span>
              </p>
            </div>
            {showProgress && <ShowProgressBar score={score} />}
          </section>
        </main>
        <div className="absolute bottom-0 m-2 mb-1 text-xs text-gray-500 md:mb-1">
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
