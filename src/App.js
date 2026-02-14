import { useEffect, useRef, useState } from 'react';
import './App.css';
import reindeerImage from './assets/reindeer.jpg';

const GAME_WIDTH = 360;
const GAME_HEIGHT = 460;
const PLAYER_WIDTH = 52;
const PLAYER_HEIGHT = 56;
const PLAYER_SPEED = 8;
const WIN_SECONDS = 18;

function App() {
  const [page, setPage] = useState('ask'); // 'ask', 'game' or 'thanks'
  const [yesSize, setYesSize] = useState(1);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const noButtonRef = useRef(null);
  const [yesPosition, setYesPosition] = useState({ x: 0, y: 0 });
  const yesButtonRef = useRef(null);

  const handleNoHover = (e) => {
    if (!noButtonRef.current) return;

    // ADD THIS CODE HERE:
    if (yesButtonRef.current && yesPosition.x === 0) {
      const yesRect = yesButtonRef.current.getBoundingClientRect();
      setYesPosition({ x: yesRect.left, y: yesRect.top });
    }

    const button = noButtonRef.current;
    const rect = button.getBoundingClientRect();
    
    // Get button center
    const buttonCenterX = rect.left + rect.width / 2;
    const buttonCenterY = rect.top + rect.height / 2;
    
    // Get mouse/touch position
    const mouseX = e.clientX || e.touches?.[0]?.clientX || buttonCenterX;
    const mouseY = e.clientY || e.touches?.[0]?.clientY || buttonCenterY;
    
    // Calculate direction away from mouse
    const deltaX = buttonCenterX - mouseX;
    const deltaY = buttonCenterY - mouseY;
    
    // Normalize and scale the movement
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const moveDistance = 100; // pixels to move away
    
    const moveX = (deltaX / distance) * moveDistance;
    const moveY = (deltaY / distance) * moveDistance;
    
    // Calculate new position
    let newX = buttonCenterX + moveX - rect.width / 2;
    let newY = buttonCenterY + moveY - rect.height / 2;
    
    // Keep button within viewport bounds
    const margin = 20;
    newX = Math.max(margin, Math.min(newX, window.innerWidth - rect.width - margin));
    newY = Math.max(margin, Math.min(newY, window.innerHeight - rect.height - margin));
    
    setNoPosition({ x: newX, y: newY });
    
    // Increase yes button size more gradually
    setYesSize(prev => Math.min(prev + 0.08, 2.5));
  };

  const handleYesClick = () => {
    setPage('game');
  };

  if (page === 'thanks') {
    return <ThanksPage />;
  }

  if (page === 'game') {
    return <SnowballDodgeGame onWin={() => setPage('thanks')} />;
  }

  return (
    <div className="container">
      <div className="content">
        <div className="heart-container">
          <div className="heart">💌💌💌</div>
        </div>
        
        <h1 className="heading">Will you be my Valentine Cutie?</h1>
        <h2 className="subheading">I bet you can't bring yourself to say no! 🫣</h2>
        
        <div className="button-container">
          <button
            ref={yesButtonRef}
            onClick={handleYesClick}
            className="yes-button"
            style={{
              transform: `scale(${yesSize})`,
              fontSize: `${16 + (yesSize - 1) * 8}px`,
              position: yesPosition.x !== 0 ? 'fixed' : 'relative',
              left: yesPosition.x !== 0 ? `${yesPosition.x}px` : 'auto',
              top: yesPosition.y !== 0 ? `${yesPosition.y}px` : 'auto',
            }}
          >
            Yes
          </button>
          
          <button
            ref={noButtonRef}
            onMouseEnter={handleNoHover}
            onTouchStart={handleNoHover}
            className="no-button"
            style={{
              position: noPosition.x !== 0 ? 'fixed' : 'relative',
              left: noPosition.x !== 0 ? `${noPosition.x}px` : 'auto',
              top: noPosition.y !== 0 ? `${noPosition.y}px` : 'auto',
            }}
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
}

function SnowballDodgeGame({ onWin }) {
  const [playerX, setPlayerX] = useState((GAME_WIDTH - PLAYER_WIDTH) / 2);
  const [snowballs, setSnowballs] = useState([]);
  const [timeLeft, setTimeLeft] = useState(WIN_SECONDS);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [moveDirection, setMoveDirection] = useState(0);
  const [touchDirection, setTouchDirection] = useState(0);
  const snowballId = useRef(0);

  const resetGame = () => {
    setPlayerX((GAME_WIDTH - PLAYER_WIDTH) / 2);
    setSnowballs([]);
    setTimeLeft(WIN_SECONDS);
    setIsGameOver(false);
    setIsWon(false);
    setMoveDirection(0);
    setTouchDirection(0);
  };

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'ArrowLeft') setMoveDirection(-1);
      if (event.key === 'ArrowRight') setMoveDirection(1);
    };

    const onKeyUp = (event) => {
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        setMoveDirection(0);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  useEffect(() => {
    if (isGameOver || isWon) return;

    const gameLoop = setInterval(() => {
      setPlayerX((previous) => {
        const direction = touchDirection !== 0 ? touchDirection : moveDirection;
        const next = previous + direction * PLAYER_SPEED;
        return Math.max(0, Math.min(next, GAME_WIDTH - PLAYER_WIDTH));
      });

      setSnowballs((previous) => {
        const moved = previous
          .map((snowball) => ({ ...snowball, y: snowball.y + snowball.speed }))
          .filter((snowball) => snowball.y < GAME_HEIGHT + 30);

        const shouldSpawn = Math.random() < 0.08;
        if (!shouldSpawn) return moved;

        const size = 20 + Math.random() * 14;
        return [
          ...moved,
          {
            id: snowballId.current++,
            x: Math.random() * (GAME_WIDTH - size),
            y: -size,
            speed: 3 + Math.random() * 3.5,
            size
          }
        ];
      });
    }, 30);

    return () => clearInterval(gameLoop);
  }, [isGameOver, isWon, moveDirection, touchDirection]);

  useEffect(() => {
    if (isGameOver || isWon) return;

    const timer = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 1) {
          setIsWon(true);
          return 0;
        }
        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isGameOver, isWon]);

  useEffect(() => {
    if (isGameOver || isWon) return;

    const playerCenterX = playerX + PLAYER_WIDTH / 2;
    const playerCenterY = GAME_HEIGHT - PLAYER_HEIGHT / 2 - 14;

    const hit = snowballs.some((snowball) => {
      const snowballCenterX = snowball.x + snowball.size / 2;
      const snowballCenterY = snowball.y + snowball.size / 2;
      const dx = snowballCenterX - playerCenterX;
      const dy = snowballCenterY - playerCenterY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const playerRadius = Math.min(PLAYER_WIDTH, PLAYER_HEIGHT) / 2 - 6;
      const snowballRadius = snowball.size / 2;
      return distance < playerRadius + snowballRadius;
    });

    if (hit) {
      setIsGameOver(true);
    }
  }, [snowballs, playerX, isGameOver, isWon]);

  useEffect(() => {
    if (!isWon) return;
    const finishTimeout = setTimeout(() => onWin(), 850);
    return () => clearTimeout(finishTimeout);
  }, [isWon, onWin]);

  return (
    <div className="game-page">
      <p className="challenge-top">You though it was going to be that easy?</p>

      <div className="game-card">
        <div className="game-hud">
          <span>Penguin survives in: {timeLeft}s</span>
          <span>{isGameOver ? 'Ouch! ❄️' : 'Dodge the snowballs'}</span>
        </div>

        <div className="game-area">
          <div
            className="penguin-player"
            style={{ left: `${playerX}px`, width: `${PLAYER_WIDTH}px`, height: `${PLAYER_HEIGHT}px` }}
          >
            🐧
          </div>

          {snowballs.map((snowball) => (
            <div
              key={snowball.id}
              className="snowball"
              style={{
                left: `${snowball.x}px`,
                top: `${snowball.y}px`,
                width: `${snowball.size}px`,
                height: `${snowball.size}px`
              }}
            />
          ))}

          {(isGameOver || isWon) && (
            <div className="game-overlay">
              <h3>{isWon ? 'You won!' : 'Snowball hit!'}</h3>
              <p>{isWon ? 'Heading to your surprise...' : 'Try again to unlock the Thanks Page.'}</p>
              {isGameOver && (
                <button className="retry-button" onClick={resetGame}>
                  Retry
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mobile-controls">
          <button
            className="control-button"
            onTouchStart={() => setTouchDirection(-1)}
            onTouchEnd={() => setTouchDirection(0)}
            onMouseDown={() => setTouchDirection(-1)}
            onMouseUp={() => setTouchDirection(0)}
            onMouseLeave={() => setTouchDirection(0)}
          >
            Left
          </button>
          <button
            className="control-button"
            onTouchStart={() => setTouchDirection(1)}
            onTouchEnd={() => setTouchDirection(0)}
            onMouseDown={() => setTouchDirection(1)}
            onMouseUp={() => setTouchDirection(0)}
            onMouseLeave={() => setTouchDirection(0)}
          >
            Right
          </button>
        </div>
      </div>

      <p className="challenge-bottom">You're gonna have to earn it</p>
    </div>
  );
}

function ThanksPage() {
  return (
    <div className="thanks-container">
      <div className="thanks-content">
        <img src={reindeerImage} alt="Cute reindeer" className="thanks-image" />
        <p className="thanks-image-subtitle">Jhanvi, the most beautiful girl in the world</p>
        <h1 className="thanks-heading">Yay! 🎉</h1>
        <p className="thanks-text">
          Congratulations my Polly Cutie :) <br></br> Love you to the moon and back baby--can't wait to spend the day with you! ❤️
        </p>
        <p className="thanks-text">Love, Vivek (a.k.a. Pudgy) ❄️</p>
      </div>
    </div>
  );
}

export default App;
