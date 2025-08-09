import { useEffect, useRef } from 'react';
import './App.css';
import WebGLCanvas from './WebGL.jsx';
import Landing from './pages/Landing.jsx';

function App() {
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
  

  return (
    <div>
      <div className='main'>
        <div>
          <Landing />
        </div>
        <button className='next-btn fade-in-third text-content' onClick={() => console.log('button clicked')}>
          <span>About me</span>
          <span className='arrow'>↓</span>
        </button>
      </div>
      <WebGLCanvas mousePosRef={mousePosRef}/>
    </div>
  )
}

export default App
