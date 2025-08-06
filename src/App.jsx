import { useState } from 'react';
import './App.css';
import WebGLCanvas from './WebGL.jsx';

function App() {
  return (
    <div>
      <div style={{zIndex: 1, position: 'relative',}}>
        <h1 style={{marginBottom: '5px'}}>Jayden Weaver</h1>
        <h2 style={{marginTop: '5px',}}>sterne</h2>
      </div>
      <WebGLCanvas/>
    </div>
  )
}

export default App
