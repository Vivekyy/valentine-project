import { useState, useRef } from 'react';
import './App.css';
import heartImage from "./assets/bags.png";

function App() {
  const [page, setPage] = useState('ask'); // 'ask' or 'thanks'
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
    setPage('thanks');
  };

  if (page === 'thanks') {
    return <ThanksPage />;
  }

  return (
    <div className="container">
      <div className="content">
        <div className="heart-container">
          <div className="heart">💌💌💌</div>
        </div>
        
        <h1 className="heading">Will you be my Valentine Gabby?</h1>
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

function ThanksPage() {
  return (
    <div className="thanks-container">
      <div className="thanks-content">
        <img 
          src={heartImage} 
          alt="Heart" 
          className="thanks-image"
        /> <br />
        <h1 className="thanks-heading">Yay! 🎉</h1>
        <p className="thanks-text">
          I'm so happy you said yes! Can't wait to spend Valentine's Day with you.
        </p>
        <p className="thanks-text">Maybe we can finally go skating? ❄️</p>
      </div>
    </div>
  );
}

export default App;
