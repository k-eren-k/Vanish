require("dotenv").config();
const express = require("express");
const axios = require("axios");
// 'querystring' modülü kaldırıldı, yerine URLSearchParams kullanılacak.
const path = require("path");

const app = express();

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

let accessToken = null;

const getNewAccessToken = async () => {
    if (!REFRESH_TOKEN) {
        console.error("HATA: .env dosyasında SPOTIFY_REFRESH_TOKEN bulunamadı.");
        return;
    }
    try {
        // querystring.stringify yerine new URLSearchParams() kullanıldı.
        const params = new URLSearchParams();
        params.append("grant_type", "refresh_token");
        params.append("refresh_token", REFRESH_TOKEN);

        const response = await axios({
            method: "post",
            url: "https://accounts.spotify.com/api/token",
            data: params,
            headers: {
                "content-type": "application/x-www-form-urlencoded",
                Authorization: "Basic " + Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
            },
        });
        accessToken = response.data.access_token;
        console.log("Yeni Spotify Access Token başarıyla alındı.");
        
    } catch (error) {
        console.error("Access Token yenilenirken hata oluştu:", error.response ? error.response.data : error.message);
    }
};

getNewAccessToken();
setInterval(getNewAccessToken, 55 * 60 * 1000);

const ensureToken = (req, res, next) => {
    if (!accessToken) {
        return res.status(503).json({ error: "Spotify token is not available yet. Please try again in a moment." });
    }
    next();
};

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/projects", (req, res) => {
    res.render("projects");
});

app.get("/contact", (req, res) => {
    res.render("contact");
});

app.get("/api/now-playing", ensureToken, async (req, res) => {
    try {
        const response = await axios.get("https://api.spotify.com/v1/me/player/currently-playing", { headers: { Authorization: "Bearer " + accessToken } });
        if (response.status === 200 && response.data && response.data.item) {
            res.json({
                isPlaying: true,
                title: response.data.item.name,
                artist: response.data.item.artists.map((a) => a.name).join(", "),
                albumArtUrl: response.data.item.album.images[0].url,
                songUrl: response.data.item.external_urls.spotify,
                progress_ms: response.data.progress_ms,
                duration_ms: response.data.item.duration_ms,
            });
        } else {
            res.json({ isPlaying: false });
        }
    } catch (error) {
        res.json({ isPlaying: false });
    }
});

app.get("/api/recently-played", ensureToken, async (req, res) => {
    try {
        const response = await axios.get("https://api.spotify.com/v1/me/player/recently-played?limit=6", { headers: { Authorization: "Bearer " + accessToken } });
        const tracks = response.data.items.map((item) => ({
            title: item.track.name,
            artist: item.track.artists.map((a) => a.name).join(", "),
            albumArtUrl: item.track.album.images[0].url,
            songUrl: item.track.external_urls.spotify,
        }));
        res.json(tracks);
    } catch (error) {
        res.status(500).json({ error: "Could not fetch recent tracks." });
    }
});

app.get("/api/github-repos", async (req, res) => {
    const GITHUB_USERNAME = "k-eren-k";
    const API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&direction=desc&per_page=100`;
    if (!GITHUB_TOKEN) return res.status(500).json({ message: "GitHub token not configured." });
    try {
        const response = await axios.get(API_URL, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });
        res.json(response.data.filter((repo) => !repo.fork));
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch from GitHub." });
    }
});

app.get("/api/npm-packages", async (req, res) => {
    const NPM_USERNAME = "dis.dev";
    // querystring yerine URLSearchParams kullanılarak URL oluşturuldu.
    const params = new URLSearchParams({
        text: `maintainer:${NPM_USERNAME}`,
        size: 250
    });
    const SEARCH_API_URL = `https://registry.npmjs.org/-/v1/search?${params.toString()}`;
    try {
        const searchResponse = await axios.get(SEARCH_API_URL);
        const basePackages = searchResponse.data.objects.map((pkg) => pkg.package);
        const today = new Date().toISOString().split("T")[0];
        const downloadPromises = basePackages.map((pkg) => {
            const DOWNLOAD_API_URL = `https://api.npmjs.org/downloads/range/2015-01-01:${today}/${pkg.name}`;
            return axios.get(DOWNLOAD_API_URL).then((response) => {
                const totalDownloads = response.data.downloads.reduce((sum, dailyData) => sum + dailyData.downloads, 0);
                return { ...pkg, downloads: totalDownloads };
            }).catch(() => ({ ...pkg, downloads: 0 }));
        });
        const packagesWithDownloads = await Promise.all(downloadPromises);
        res.json(packagesWithDownloads);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch data from NPM." });
    }
});

module.exports = app;
