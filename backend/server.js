import express from 'express';
import cors from 'cors';
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Database lagu tiruan (Menggunakan sampel audio & gambar publik gratis)
let tracks = [
  {
    id: 1,
    title: "Bad",
    artist: "Wave to Earth",
    cover: "https://picsum.photos/id/1015/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // placeholder
    isLiked: false,
    theme: "galau"
  },
  {
    id: 2,
    title: "Light",
    artist: "Wave to Earth",
    cover: "https://picsum.photos/id/1016/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    isLiked: true,
    theme: "bahagia"
  },
  // ... (lagu lama tetap sama)

  // LAGU TAMBAHAN DENGAN AUDIO LEBIH BAIK
  {
    id: 7,
    title: "Anti-Hero",
    artist: "Taylor Swift",
    cover: "https://picsum.photos/id/1074/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3",
    isLiked: false,
    theme: "galau"
  },
  {
    id: 8,
    title: "Daisy",
    artist: "Wave to Earth",
    cover: "https://picsum.photos/id/1080/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3",
    isLiked: true,
    theme: "senang"
  },
  {
    id: 9,
    title: "Golden",
    artist: "Harry Styles",
    cover: "https://picsum.photos/id/201/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3",
    isLiked: false,
    theme: "bahagia"
  },
  {
    id: 10,
    title: "drivers license",
    artist: "Olivia Rodrigo",
    cover: "https://picsum.photos/id/133/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3",
    isLiked: true,
    theme: "sedih"
  },
  {
    id: 11,
    title: "Espresso",
    artist: "Sabrina Carpenter",
    cover: "https://picsum.photos/id/180/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3",
    isLiked: false,
    theme: "senang"
  },
  {
    id: 12,
    title: "Die With A Smile",
    artist: "Lady Gaga & Bruno Mars",
    cover: "https://picsum.photos/id/221/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3",
    isLiked: true,
    theme: "bahagia"
  },
  {
    id: 13,
    title: "APT.",
    artist: "ROSÉ & Bruno Mars",
    cover: "https://picsum.photos/id/237/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3",
    isLiked: false,
    theme: "senang"
  },
  {
    id: 14,
    title: "Birds of a Feather",
    artist: "Billie Eilish",
    cover: "https://picsum.photos/id/251/300/300",
    audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3",
    isLiked: true,
    theme: "galau"
  }
];

// 1. Ambil semua daftar lagu
app.get('/api/tracks', (req, res) => {
  res.json(tracks);
});

// 2. Toggle Like/Favorite lagu (Ganti status suka)
app.post('/api/tracks/:id/toggle-like', (req, res) => {
  const trackId = Number(req.params.id);
  const track = tracks.find(t => t.id === trackId);

  if (!track) {
    return res.status(404).json({ message: "Lagu tidak ditemukan" });
  }

  track.isLiked = !track.isLiked;
  res.json({ message: `Status like berhasil diubah`, track });
});

app.listen(PORT, () => {
  console.log(`🎵 VibeStream Backend berjalan di http://localhost:${PORT}`);
});
