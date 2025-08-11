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
    <div className='fade-in'>
      <div ref={panelRef} className='info-panel'>
        <h1>Info page</h1>
        <SpotifyFrame trackId='4UZifG6wVTl3dFIeHKLi8y'/>
      </div>
    </div>
  );
} 
