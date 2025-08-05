import { useState } from 'react';
import './App.css';
import WebGLCanvas from './WebGL.jsx';

function App() {
  return (
    <div>
      <h1 style={{zIndex: 1, position: 'relative',}}>sterne</h1>
      <WebGLCanvas/>
    </div>
  )
}

export default App
