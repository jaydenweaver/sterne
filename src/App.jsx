import { useState } from 'react';
import './App.css';
import WebGLCanvas from './WebGL.jsx';
import Landing from './pages/Landing.jsx';

function App() {
  return (
    <div>
      <div style={{zIndex: 1, position: 'relative',}}>
        <Landing/>
      </div>
      <WebGLCanvas/>
    </div>
  )
}

export default App
