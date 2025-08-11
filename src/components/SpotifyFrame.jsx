export default function SpotifyFrame({ trackId }) {

  return(
    <iframe 
      src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator`}
      width="100%" 
      height="152" 
      frameBorder="0" 
      allowFullScreen="" 
      loading="lazy"
      style={{ overflow: 'hidden', border: '12px' }}></iframe>
  );
}
