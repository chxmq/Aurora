# Aurora

Aurora is a decentralized music sharing and streaming platform built on Web3. Users can upload, discover, and listen to music, interact with artists, tip creators, and build a music community — all backed by decentralized storage via IPFS and Pinata.

## Features

- Stream and discover music tracks
- Upload your own music to IPFS
- Comment on tracks and posts
- Tip your favorite artists
- Search for tracks, artists, and genres
- Explore trending and viral sounds
- Playlists and liked songs
- User profiles with onboarding flow
- Wallet-based authentication via MetaMask
- Responsive design for mobile and desktop

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A MetaMask browser extension
- Pinata API keys (see `.env.example`)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/chxmq/aurora.git
   cd aurora
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Fill in your Pinata API keys in `.env`.

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
src/
  components/
    layout/       # Layout, Header, Sidebar, MusicPlayer
    music/        # MusicTrackCard, AudioEqualizer, AudioVisualizer, etc.
    post/         # PostCard, CreatePostForm, CommentSection
    playlist/     # CreatePlaylistModal, AddToPlaylistModal
    user/         # OnboardingGate, OnboardingModal, EditProfileModal, etc.
    search/       # SearchResults
    storage/      # PinataStorageMonitor
    ui/           # shadcn/ui primitives
  hooks/          # Custom React hooks
  lib/            # Types and utilities
  pages/          # App routes and pages
  providers/      # Context providers (Data, Wallet, Storage)
  services/       # IPFS, localStorage, fileStorage
  App.tsx
  main.tsx
```

## Environment Variables

See `.env.example` for all required variables.

## Credits

Built with ❤️ by [@chxmq](https://github.com/chxmq) and [@tallamSai](https://github.com/tallamSai)

## License

Copyright (c) 2026 Aurora. All Rights Reserved. See the [LICENSE](LICENSE) file for details.
