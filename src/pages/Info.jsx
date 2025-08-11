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
    <div ref={panelRef} className='info-panel fade-in'>
      <h1>Info page</h1>
      <SpotifyFrame playlistId='28eqzJgbdcIIkwFe8tdjwG'/>
    </div>
  );
} 
