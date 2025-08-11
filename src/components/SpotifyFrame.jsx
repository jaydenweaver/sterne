export default function SpotifyFrame({ playlistId }) {

  return(
    <iframe
      src={`https://open.spotify.com/embed/playlist/${playlistId}`}
      height="380"
      frameBorder="0"
      allow="encrypted-media"
      allowFullScreen={false}
      title="Spotify Player"
    ></iframe>
  );
}
