import React, { useState, useEffect, useRef } from 'react';
import { Search, Heart, Play, Pause, Volume2, SkipBack, SkipForward, Repeat, Shuffle } from 'lucide-react';
import './App.scss';

function App() {
  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [activeFilter, setActiveFilter] = useState("all");
  
  const audioRef = useRef(null);
  const API_URL = 'http://localhost:5000/api/tracks';

  const themes = ["all", "favorite", "sedih", "senang", "bahagia", "galau"];

  // 1. Ambil lagu dari backend saat pertama kali dimuat
  useEffect(() => {
    fetchTracks();
  }, []);

  const fetchTracks = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setTracks(data);
      if (data.length > 0 && !currentTrack) {
        setCurrentTrack(data[0]); // Pasang lagu pertama sebagai default
      }
    } catch (err) {
      console.error("Gagal memuat musik:", err);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Update progress bar
  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    const current = audioRef.current.currentTime;
    const dur = audioRef.current.duration;
    setCurrentTime(current);
    if (!isNaN(dur)) setDuration(dur);
    setProgress((current / dur) * 100);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressChange = (e) => {
    const newTime = (e.target.value / 100) * audioRef.current.duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
    setProgress(e.target.value);
  };

  const handleVolumeChange = (e) => {
    const newVolume = e.target.value;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  // 2. Logika Play / Pause musik
  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // 3. Ganti lagu yang sedang diputar
  const selectTrack = (track) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    setProgress(0);
    setCurrentTime(0);
    // Beri jeda tipis agar src audio sempat berganti sebelum di-play
    setTimeout(() => {
      if (audioRef.current) {
        // Set volume again incase it reset
        audioRef.current.volume = volume / 100;
        audioRef.current.play().catch(e => console.log("Playback interrupted"));
      }
    }, 50);
  };

  // 4. Fitur Like yang tersambung ke API Backend
  const toggleLikeApi = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}/toggle-like`, { method: 'POST' });
      if (res.ok) {
        // Update state lokal agar UI berubah secara realtime
        setTracks(tracks.map(track => 
          track.id === id ? { ...track, isLiked: !track.isLiked } : track
        ));
        
        // Update juga data lagu yang sedang aktif jika itu lagu yang sama
        if (currentTrack && currentTrack.id === id) {
          setCurrentTrack({ ...currentTrack, isLiked: !currentTrack.isLiked });
        }
      }
    } catch (err) {
      console.error("Gagal menyukai lagu:", err);
    }
  };

  // Filter lagu berdasarkan pencarian dan filter aktif
  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          track.artist.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === "favorite") return matchesSearch && track.isLiked;
    if (activeFilter !== "all") return matchesSearch && track.theme === activeFilter;
    
    return matchesSearch;
  });

  return (
    <div className="spotify-clone">
      {/* Sidebar / Main Content Area */}
      <div className="main-content">
        <header className="app-header">
          <div className="logo">
            <div className="logo-icon">V</div>
            <h1>VibeStream</h1>
          </div>
          
          <div className="search-container">
            <Search className="search-icon" size={20} />
            <input 
              type="text" 
              placeholder="Cari lagu atau artis..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </header>

        {/* Elemen Audio Tersembunyi */}
        <audio 
          ref={audioRef} 
          src={currentTrack?.audioUrl} 
          onEnded={() => setIsPlaying(false)} 
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />

        <div className="content-grid">
          {/* Sisi Kiri: Daftar Lagu */}
          <div className="playlist-container">
            <div className="playlist-header">
              <h2>Discover Tracks</h2>
              <p>Temukan lagu Wave to Earth & Taylor Swift sesuai suasana hatimu</p>
              
              <div className="theme-filters">
                {themes.map(theme => (
                  <button 
                    key={theme} 
                    className={`theme-btn ${activeFilter === theme ? 'active' : ''}`}
                    onClick={() => setActiveFilter(theme)}
                  >
                    {theme.charAt(0).toUpperCase() + theme.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="track-list">
              {filteredTracks.length > 0 ? (
                filteredTracks.map((track, index) => (
                  <div 
                    key={track.id} 
                    onClick={() => selectTrack(track)}
                    className={`track-item ${currentTrack?.id === track.id ? 'active' : ''}`}
                  >
                    <div className="track-number">
                      {currentTrack?.id === track.id && isPlaying ? (
                        <div className="playing-eq">
                          <span></span><span></span><span></span>
                        </div>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <img src={track.cover} alt={track.title} className="track-cover-small" />
                    <div className="track-info">
                      <strong className={`track-title ${currentTrack?.id === track.id ? 'text-green' : ''}`}>
                        {track.title}
                      </strong>
                      <div className="track-subtitle">
                        <span className="track-artist">{track.artist}</span>
                        <span className="track-theme-badge">{track.theme}</span>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Mencegah lagu keputar saat klik tombol like
                        toggleLikeApi(track.id);
                      }}
                      className={`like-button ${track.isLiked ? 'liked' : ''}`}
                    >
                      <Heart size={20} fill={track.isLiked ? '#1db954' : 'transparent'} color={track.isLiked ? '#1db954' : '#b3b3b3'} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="no-results">
                  <p>Lagu tidak ditemukan. Coba kata kunci atau filter lain.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sisi Kanan: Player Board Aktif (Hanya detail visual besar) */}
          {currentTrack && (
            <div className="now-playing-card">
              <div className="cover-wrapper">
                <img src={currentTrack.cover} alt={currentTrack.title} className="track-cover-large" />
                <div className={`play-overlay ${isPlaying ? 'playing' : ''}`} onClick={togglePlay}>
                  {isPlaying ? <Pause size={48} fill="white" /> : <Play size={48} fill="white" className="ml-2" />}
                </div>
              </div>
              <div className="now-playing-info">
                <div>
                  <h2 className="title">{currentTrack.title}</h2>
                  <p className="artist">{currentTrack.artist}</p>
                </div>
                <button 
                  onClick={() => toggleLikeApi(currentTrack.id)}
                  className={`large-like-btn ${currentTrack.isLiked ? 'liked' : ''}`}
                >
                  <Heart size={28} fill={currentTrack.isLiked ? '#1db954' : 'transparent'} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Player Bar (Spotify style) */}
      {currentTrack && (
        <div className="bottom-player">
          <div className="player-left">
            <img src={currentTrack.cover} alt={currentTrack.title} />
            <div className="info">
              <h4>{currentTrack.title}</h4>
              <p>{currentTrack.artist}</p>
            </div>
            <button 
              onClick={() => toggleLikeApi(currentTrack.id)}
              className="player-like"
            >
              <Heart size={16} fill={currentTrack.isLiked ? '#1db954' : 'transparent'} color={currentTrack.isLiked ? '#1db954' : '#b3b3b3'} />
            </button>
          </div>
          
          <div className="player-center">
            <div className="controls">
              <button className="control-btn secondary"><Shuffle size={16} /></button>
              <button className="control-btn secondary"><SkipBack size={20} fill="currentColor" /></button>
              <button className="control-btn primary" onClick={togglePlay}>
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
              </button>
              <button className="control-btn secondary"><SkipForward size={20} fill="currentColor" /></button>
              <button className="control-btn secondary"><Repeat size={16} /></button>
            </div>
            <div className="progress-container">
              <span className="time-text visible">{formatTime(currentTime)}</span>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={progress || 0} 
                onChange={handleProgressChange}
                className="progress-bar"
              />
              <span className="time-text visible">{formatTime(duration)}</span>
            </div>
          </div>
          
          <div className="player-right">
            <Volume2 size={20} color="#b3b3b3" />
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={volume} 
              onChange={handleVolumeChange}
              className="volume-bar" 
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
