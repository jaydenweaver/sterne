import { useEffect, useRef, useState } from 'react';
import './App.css';
import WebGLCanvas from './WebGL.jsx';
import Landing from './pages/Landing.jsx';
import Info from './pages/Info.jsx';

export default function App() {
  
  const STATE = {
    LANDING: 1,
    INFO: 2
  };
  
  const fadeDuration = 500; // in milliseconds

  const [view, setView] = useState(STATE.LANDING);
  const [isFading, setIsFading] = useState(false);
  const [nextView, setNextView] = useState(null);

  const mousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePosRef.current.x = e.clientX;
      mousePosRef.current.y = e.clientY;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove); 
    }
  }, []);

  useEffect(() => {
    if (isFading) {
      const timeout = setTimeout(() => {
        setView(nextView);
        setIsFading(false);
      }, fadeDuration); 
      
      return () => clearTimeout(timeout);
    }
  }, [isFading, nextView]);
  
  const handleChangeView = (next) => {
    setIsFading(true);
    setNextView(next);
  } 

  return (
    <div>
      <div className={isFading ? 'fade-out main' : 'fade-in-fast main'}>
        <div>
          {view === STATE.LANDING && <Landing />}
          {view === STATE.INFO && <Info />}
        </div>

        {view === STATE.LANDING &&
          <button className='next-btn fade-in-third text-content' onClick={() => handleChangeView(STATE.INFO)}>
            <span>About me</span>
            <span className='arrow'>↓</span>
          </button>
        }
      </div>
      <WebGLCanvas mousePosRef={mousePosRef}/>
    </div>
  )
}

