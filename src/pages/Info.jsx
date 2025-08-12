import { useRef, useEffect } from 'react';
import SpotifyFrame from '../components/SpotifyFrame.jsx';
export default function Info() {
  const panelRef = useRef(null);

  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollTop = 0;
    }
  }, []);

  return (
    <div className='fade-in info-container'>
      <h1>Projects</h1>
      <div ref={panelRef} className='info-panel'>
        <h3>Splash</h3>
        <h3>Sterne</h3>
        <h3>Movie Browser</h3>
        <h3>Splash</h3>
        <h3>Sterne</h3>
        <h3>Movie Browser</h3>
        <h3>Splash</h3>
        <h3>Sterne</h3>
        <h3>Movie Browser</h3>
        <h3>Splash</h3>
        <h3>Splash</h3>
        <h3>Sterne</h3>
        <h3>Movie Browser</h3>
        <h3>Sterne</h3>
        <h3>Movie Browser</h3>
      </div>
    </div>
  );
} 
