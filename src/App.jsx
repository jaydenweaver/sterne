import { useState } from 'react';
import './App.css';
import WebGLCanvas from './WebGL.jsx';
import Landing from './pages/Landing.jsx';

function App() {
  return (
    <div>
      <div className='main'>
        <div className='fade-in'>
          <Landing />
        </div>
        <button className='next-btn fade-in-delayed text-content' onClick={() => console.log('button clicked')}>
          <span>Next</span>
          <span className='arrow'>↓</span>
        </button>
      </div>
      <WebGLCanvas/>
    </div>
  )
}

export default App
