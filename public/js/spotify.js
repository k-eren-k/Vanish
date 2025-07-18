document.addEventListener("DOMContentLoaded", () => {
  const nowPlayingContainer = document.getElementById("now-playing-container");
  const notPlayingMessage = document.getElementById("not-playing-message");
  const albumArt = document.getElementById("album-art");
  const songTitle = document.getElementById("song-title");
  const songArtist = document.getElementById("song-artist");
  const songUrl = document.getElementById("song-url");
  const progressBar = document.getElementById("progress");
  const historyList = document.getElementById("history-list");

  let updateInterval;

  const fetchNowPlaying = async () => {
    try {
      const response = await fetch("/api/now-playing");
      const data = await response.json();

      if (data.isPlaying) {
        nowPlayingContainer.style.display = "flex";
        notPlayingMessage.style.display = "none";

        if (songTitle.textContent !== data.title) {
          albumArt.src = data.albumArtUrl;
          songTitle.textContent = data.title;
          songArtist.textContent = data.artist;
          songUrl.href = data.songUrl;
        }

        const progressPercent = (data.progress_ms / data.duration_ms) * 100;
        progressBar.style.width = `${progressPercent}%`;
      } else {
        nowPlayingContainer.style.display = "none";
        notPlayingMessage.style.display = "block";
        fetchRecentlyPlayed();
        if (updateInterval) clearInterval(updateInterval);
      }
    } catch (error) {
      console.error("Error fetching now playing data:", error);
      nowPlayingContainer.style.display = "none";
      notPlayingMessage.style.display = "block";
    }
  };

  const fetchRecentlyPlayed = async () => {
    try {
      const response = await fetch("/api/recently-played");
      const tracks = await response.json();

      historyList.innerHTML = ""; 

      tracks.forEach((track, index) => {
        const listItem = `
                    <li class="history-item">
                        <span class="track-number">${(index + 1)
                          .toString()
                          .padStart(2, "0")}</span>
                        <div class="track-details">
                            <span class="track-title">${track.title}</span>
                            <span class="track-artist">${track.artist}</span>
                        </div>
                        <a href="${
                          track.songUrl
                        }" target="_blank" rel="noopener noreferrer" class="play-icon">
                            <i class="fas fa-play"></i>
                        </a>
                        <div class="album-art-popup">
                            <img src="${
                              track.albumArtUrl
                            }" alt="Album art for ${track.title}">
                        </div>
                    </li>
                `;
        historyList.innerHTML += listItem;
      });
    } catch (error) {
      console.error("Error fetching recently played tracks:", error);
    }
  };

  fetchNowPlaying();
  fetchRecentlyPlayed();
  updateInterval = setInterval(fetchNowPlaying, 2000); 
});
