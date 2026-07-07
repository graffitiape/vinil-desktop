# Vinil — Azure Cloud Setup Guide

Step-by-step tutorial to set up the full Azure backend for the Vinil music app.

## Prerequisites

- An Azure account ([create free account](https://azure.microsoft.com/free/))
- Azure CLI installed
- Node.js 20+
- npm

---

## Step 0: Install & Login to Azure CLI

### 0.1 — Install Azure CLI

**macOS:**
```bash
brew install azure-cli
```

### 0.2 — Login

```bash
az login
```

This opens a browser window. Sign in with your Azure account.

### 0.3 — Verify

```bash
az account show --query name -o tsv
```

You should see your subscription name.

---

## Step 1: Create a Resource Group

A Resource Group is a container that holds all your Azure resources together.

```bash
az group create \
  --name vinil-rg \
  --location eastus
```

> Pick a region close to you. Common options: `eastus`, `westeurope`, `southeastasia`.
> Run `az account list-locations -o table` to see all options.

**Verify:**
```bash
az group list -o table
```

---

## Step 2: Set Up Azure SQL Database (Metadata)

Azure SQL will store your albums, tracks, playlists, and player state using
a proper relational schema with JOINs and foreign keys.

### 2.1 — Create a SQL Server

```bash
az sql server create \
  --name vinil-sql-server \
  --resource-group vinil-rg \
  --location eastus \
  --admin-user viniladmin \
  --admin-password '<YourStrongPassword123!>'
```

> Replace `<YourStrongPassword123!>` with a strong password (min 8 chars, upper+lower+number+special).
> The server name must be globally unique. If taken, try `vinil-sql-server-123`.

### 2.2 — Create the Database (Free Tier)

```bash
az sql db create \
  --name vinil-db \
  --resource-group vinil-rg \
  --server vinil-sql-server \
  --free-limit exhaustion-behavior AutoPause \
  --free-limit-type FreeLimitExhaustionBehavior \
  --sku-name GP_S_Gen5 \
  --capacity 1 \
  --compute-model Serverless \
  --auto-pause-delay 60 \
  --max-size 32GB
```

> The free tier gives you 100,000 vCore seconds/month and 32 GB of storage — more than
> enough for metadata. The database auto-pauses after 60 min of inactivity to save credits.

### 2.3 — Allow Your IP Through the Firewall

```bash
# Allow your current IP
MY_IP=$(curl -s ifconfig.me)
az sql server firewall-rule create \
  --name AllowMyIP \
  --resource-group vinil-rg \
  --server vinil-sql-server \
  --start-ip-address "$MY_IP" \
  --end-ip-address "$MY_IP"

# Allow Azure services (needed for App Service to connect)
az sql server firewall-rule create \
  --name AllowAzureServices \
  --resource-group vinil-rg \
  --server vinil-sql-server \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### 2.4 — Create the Tables

Connect to the database using `sqlcmd` (install via `brew install sqlcmd` on macOS):

```bash
sqlcmd -S vinil-sql-server.database.windows.net -d vinil-db \
  -U viniladmin -P '<YourStrongPassword123!>' \
  -Q "
CREATE TABLE albums (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  title NVARCHAR(255) NOT NULL,
  artist NVARCHAR(255) NOT NULL,
  artwork_url NVARCHAR(500),
  year INT,
  genre NVARCHAR(100),
  quality NVARCHAR(50),
  created_at DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE tracks (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  title NVARCHAR(255) NOT NULL,
  artist NVARCHAR(255) NOT NULL,
  album_id UNIQUEIDENTIFIER REFERENCES albums(id) ON DELETE CASCADE,
  duration INT NOT NULL,
  quality NVARCHAR(50),
  genre NVARCHAR(100),
  year INT,
  file_path NVARCHAR(500),
  artwork_url NVARCHAR(500),
  track_number INT,
  created_at DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE playlists (
  id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
  name NVARCHAR(255) NOT NULL,
  artwork_url NVARCHAR(500),
  created_at DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE playlist_tracks (
  playlist_id UNIQUEIDENTIFIER REFERENCES playlists(id) ON DELETE CASCADE,
  track_id UNIQUEIDENTIFIER REFERENCES tracks(id) ON DELETE CASCADE,
  position INT NOT NULL,
  PRIMARY KEY (playlist_id, track_id)
);

CREATE TABLE player_state (
  user_id NVARCHAR(255) PRIMARY KEY,
  track_id UNIQUEIDENTIFIER REFERENCES tracks(id),
  position_ms INT DEFAULT 0,
  is_playing BIT DEFAULT 0,
  updated_at DATETIME2 DEFAULT GETUTCDATE()
);
"
```

> If you don't have `sqlcmd`, you can also run this SQL in the Azure Portal:
> Go to your SQL Database → **Query editor (preview)** → paste and run the SQL above.

### 2.5 — Get Your Connection String

```bash
az sql db show-connection-string \
  --server vinil-sql-server \
  --name vinil-db \
  --client node \
  -o tsv
```

This outputs something like:
```
Server=vinil-sql-server.database.windows.net;Database=vinil-db;User ID=viniladmin;Password=<your-password>;Encrypt=true;TrustServerCertificate=false;
```

Replace `<your-password>` with your actual password. Save this — you'll need it for the API server.

---

## Step 3: Set Up Azure Blob Storage (Audio + Artwork)

### 3.1 — Create a Storage Account

```bash
az storage account create \
  --name vinilstorage \
  --resource-group vinil-rg \
  --location eastus \
  --sku Standard_LRS \
  --access-tier Cool
```

> Storage account names must be globally unique, all lowercase, 3-24 characters, numbers and letters only.
> If `vinilstorage` is taken, try `vinilstorage123` or similar.

### 3.2 — Create Blob Containers

```bash
# Get storage key
STORAGE_KEY=$(az storage account keys list \
  --account-name vinilstorage \
  --resource-group vinil-rg \
  --query "[0].value" -o tsv)

# Container for audio files
az storage container create \
  --name audio \
  --account-name vinilstorage \
  --account-key "$STORAGE_KEY"

# Container for artwork images
az storage container create \
  --name artwork \
  --account-name vinilstorage \
  --account-key "$STORAGE_KEY"
```

### 3.3 — Enable CORS (so your app can access files)

```bash
az storage cors add \
  --services b \
  --methods GET HEAD OPTIONS PUT \
  --origins "*" \
  --allowed-headers "*" \
  --exposed-headers "*" \
  --max-age 3600 \
  --account-name vinilstorage \
  --account-key "$STORAGE_KEY"
```

> In production, replace `"*"` in origins with your actual domain.

### 3.4 — Get Your Connection String

```bash
az storage account show-connection-string \
  --name vinilstorage \
  --resource-group vinil-rg \
  --query connectionString \
  -o tsv
```

Save this — you'll need it for the API server.

### 3.5 — Test: Upload a File

```bash
# Upload a test file
echo "test" > /tmp/test.txt
az storage blob upload \
  --account-name vinilstorage \
  --account-key "$STORAGE_KEY" \
  --container-name audio \
  --name test.txt \
  --file /tmp/test.txt

# Verify it's there
az storage blob list \
  --account-name vinilstorage \
  --account-key "$STORAGE_KEY" \
  --container-name audio \
  -o table

# Clean up test file
az storage blob delete \
  --account-name vinilstorage \
  --account-key "$STORAGE_KEY" \
  --container-name audio \
  --name test.txt
```

---

## Step 4: Set Up Azure SignalR Service (Real-Time Sync)

### 4.1 — Create SignalR Service (Free Tier)

```bash
az signalr create \
  --name vinil-signalr \
  --resource-group vinil-rg \
  --sku Free_F1 \
  --unit-count 1 \
  --service-mode Default \
  --location eastus
```

> Free tier: 20 concurrent connections, 20,000 messages/day — plenty for personal use.

### 4.2 — Get Connection String

```bash
az signalr key list \
  --name vinil-signalr \
  --resource-group vinil-rg \
  --query primaryConnectionString \
  -o tsv
```

Save this.

### 4.3 — Enable CORS

```bash
az signalr cors add \
  --name vinil-signalr \
  --resource-group vinil-rg \
  --allowed-origins "http://localhost:5173" "http://localhost:1420"
```

> `5173` is your Vite dev server, `1420` is common for Tauri dev.
> Add your production URL later.

---

## Step 5: Create the API Server (Azure App Service)

The API server sits between your app and Azure services. It handles auth, data access, and hosts the SignalR hub.

### 5.1 — Create the API Project

From your project root:

```bash
mkdir -p server
cd server
npm init -y
npm install express cors dotenv mssql \
  @azure/storage-blob
npm install -D typescript @types/express @types/cors @types/node ts-node nodemon
```

### 5.2 — Create tsconfig.json

Create `server/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2021",
    "module": "commonjs",
    "lib": ["ES2021"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"]
}
```

### 5.3 — Create Environment File

Create `server/.env`:
```env
PORT=3001
SQL_SERVER=vinil-sql-server.database.windows.net
SQL_DATABASE=vinil-db
SQL_USER=viniladmin
SQL_PASSWORD=<YourStrongPassword123!>
STORAGE_CONNECTION_STRING=<your-storage-connection-string>
STORAGE_ACCOUNT_NAME=vinilstorage
SIGNALR_CONNECTION_STRING=<your-signalr-connection-string>
```

> Paste the values you saved from Steps 2, 3, and 4.

Add `server/.env` to your `.gitignore`:
```bash
echo "server/.env" >> ../.gitignore
```

### 5.4 — Create the Database Connection

Create `server/src/db.ts`:
```typescript
import sql from "mssql";
import dotenv from "dotenv";

dotenv.config();

const config: sql.config = {
  server: process.env.SQL_SERVER!,
  database: process.env.SQL_DATABASE!,
  user: process.env.SQL_USER!,
  password: process.env.SQL_PASSWORD!,
  options: {
    encrypt: true,
    trustServerCertificate: false,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getDb(): Promise<sql.ConnectionPool> {
  if (!pool) {
    pool = await sql.connect(config);
    console.log("Connected to Azure SQL Database");
  }
  return pool;
}
```

### 5.5 — Create the API Server

Create `server/src/index.ts`:
```typescript
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import sql from "mssql";
import {
  BlobServiceClient,
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import { getDb } from "./db";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ── Blob Storage Setup ──
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.STORAGE_CONNECTION_STRING!
);
const audioContainerClient = blobServiceClient.getContainerClient("audio");
const artworkContainerClient = blobServiceClient.getContainerClient("artwork");

// ═══════════════════════════════════════
//  ALBUM ROUTES
// ═══════════════════════════════════════

// GET /api/albums — list all albums
app.get("/api/albums", async (_req, res) => {
  try {
    const db = await getDb();
    const result = await db.query`
      SELECT * FROM albums ORDER BY created_at DESC
    `;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch albums" });
  }
});

// GET /api/albums/:id — get single album with tracks
app.get("/api/albums/:id", async (req, res) => {
  try {
    const db = await getDb();
    const album = await db.request()
      .input("id", sql.UniqueIdentifier, req.params.id)
      .query("SELECT * FROM albums WHERE id = @id");

    if (album.recordset.length === 0) {
      return res.status(404).json({ error: "Album not found" });
    }

    const tracks = await db.request()
      .input("albumId", sql.UniqueIdentifier, req.params.id)
      .query("SELECT * FROM tracks WHERE album_id = @albumId ORDER BY track_number");

    res.json({ ...album.recordset[0], tracks: tracks.recordset });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch album" });
  }
});

// POST /api/albums — create album
app.post("/api/albums", async (req, res) => {
  try {
    const { title, artist, artwork_url, year, genre, quality } = req.body;
    const db = await getDb();
    const result = await db.request()
      .input("title", sql.NVarChar, title)
      .input("artist", sql.NVarChar, artist)
      .input("artwork_url", sql.NVarChar, artwork_url || null)
      .input("year", sql.Int, year || null)
      .input("genre", sql.NVarChar, genre || null)
      .input("quality", sql.NVarChar, quality || null)
      .query(`
        INSERT INTO albums (title, artist, artwork_url, year, genre, quality)
        OUTPUT INSERTED.*
        VALUES (@title, @artist, @artwork_url, @year, @genre, @quality)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create album" });
  }
});

// DELETE /api/albums/:id
app.delete("/api/albums/:id", async (req, res) => {
  try {
    const db = await getDb();
    await db.request()
      .input("id", sql.UniqueIdentifier, req.params.id)
      .query("DELETE FROM albums WHERE id = @id");
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete album" });
  }
});

// ═══════════════════════════════════════
//  TRACK ROUTES
// ═══════════════════════════════════════

// GET /api/tracks — list all tracks
app.get("/api/tracks", async (_req, res) => {
  try {
    const db = await getDb();
    const result = await db.query`SELECT * FROM tracks`;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch tracks" });
  }
});

// POST /api/tracks — create track metadata
app.post("/api/tracks", async (req, res) => {
  try {
    const { title, artist, album_id, duration, quality, genre, year, file_path, artwork_url, track_number } = req.body;
    const db = await getDb();
    const result = await db.request()
      .input("title", sql.NVarChar, title)
      .input("artist", sql.NVarChar, artist)
      .input("album_id", sql.UniqueIdentifier, album_id || null)
      .input("duration", sql.Int, duration)
      .input("quality", sql.NVarChar, quality || null)
      .input("genre", sql.NVarChar, genre || null)
      .input("year", sql.Int, year || null)
      .input("file_path", sql.NVarChar, file_path || null)
      .input("artwork_url", sql.NVarChar, artwork_url || null)
      .input("track_number", sql.Int, track_number || null)
      .query(`
        INSERT INTO tracks (title, artist, album_id, duration, quality, genre, year, file_path, artwork_url, track_number)
        OUTPUT INSERTED.*
        VALUES (@title, @artist, @album_id, @duration, @quality, @genre, @year, @file_path, @artwork_url, @track_number)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create track" });
  }
});

// ═══════════════════════════════════════
//  PLAYLIST ROUTES
// ═══════════════════════════════════════

// GET /api/playlists — list all playlists with track count
app.get("/api/playlists", async (_req, res) => {
  try {
    const db = await getDb();
    const result = await db.query`
      SELECT p.*, COUNT(pt.track_id) AS track_count
      FROM playlists p
      LEFT JOIN playlist_tracks pt ON p.id = pt.playlist_id
      GROUP BY p.id, p.name, p.artwork_url, p.created_at
    `;
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch playlists" });
  }
});

// GET /api/playlists/:id — get playlist with its tracks (JOIN!)
app.get("/api/playlists/:id", async (req, res) => {
  try {
    const db = await getDb();
    const playlist = await db.request()
      .input("id", sql.UniqueIdentifier, req.params.id)
      .query("SELECT * FROM playlists WHERE id = @id");

    if (playlist.recordset.length === 0) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    const tracks = await db.request()
      .input("playlistId", sql.UniqueIdentifier, req.params.id)
      .query(`
        SELECT t.*, pt.position
        FROM tracks t
        JOIN playlist_tracks pt ON t.id = pt.track_id
        WHERE pt.playlist_id = @playlistId
        ORDER BY pt.position
      `);

    res.json({ ...playlist.recordset[0], tracks: tracks.recordset });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch playlist" });
  }
});

// POST /api/playlists — create playlist
app.post("/api/playlists", async (req, res) => {
  try {
    const { name, artwork_url } = req.body;
    const db = await getDb();
    const result = await db.request()
      .input("name", sql.NVarChar, name)
      .input("artwork_url", sql.NVarChar, artwork_url || null)
      .query(`
        INSERT INTO playlists (name, artwork_url)
        OUTPUT INSERTED.*
        VALUES (@name, @artwork_url)
      `);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create playlist" });
  }
});

// POST /api/playlists/:id/tracks — add track to playlist
app.post("/api/playlists/:id/tracks", async (req, res) => {
  try {
    const { track_id } = req.body;
    const db = await getDb();

    // Get next position
    const posResult = await db.request()
      .input("playlistId", sql.UniqueIdentifier, req.params.id)
      .query("SELECT ISNULL(MAX(position), 0) + 1 AS next_pos FROM playlist_tracks WHERE playlist_id = @playlistId");

    const nextPos = posResult.recordset[0].next_pos;

    await db.request()
      .input("playlistId", sql.UniqueIdentifier, req.params.id)
      .input("trackId", sql.UniqueIdentifier, track_id)
      .input("position", sql.Int, nextPos)
      .query("INSERT INTO playlist_tracks (playlist_id, track_id, position) VALUES (@playlistId, @trackId, @position)");

    res.status(201).json({ playlist_id: req.params.id, track_id, position: nextPos });
  } catch (err) {
    res.status(500).json({ error: "Failed to add track to playlist" });
  }
});

// DELETE /api/playlists/:id/tracks/:trackId — remove track from playlist
app.delete("/api/playlists/:id/tracks/:trackId", async (req, res) => {
  try {
    const db = await getDb();
    await db.request()
      .input("playlistId", sql.UniqueIdentifier, req.params.id)
      .input("trackId", sql.UniqueIdentifier, req.params.trackId)
      .query("DELETE FROM playlist_tracks WHERE playlist_id = @playlistId AND track_id = @trackId");
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to remove track from playlist" });
  }
});

// ═══════════════════════════════════════
//  UPLOAD ROUTES (Blob Storage)
// ═══════════════════════════════════════

// GET /api/upload/sas?container=audio&filename=song.flac
// Returns a temporary upload URL the client can PUT to directly
app.get("/api/upload/sas", async (req, res) => {
  const { container, filename } = req.query as {
    container: string;
    filename: string;
  };

  if (!container || !filename) {
    return res.status(400).json({ error: "container and filename required" });
  }

  const containerClient =
    container === "audio" ? audioContainerClient : artworkContainerClient;
  const blobClient = containerClient.getBlockBlobClient(filename);

  // Parse credentials from connection string for SAS generation
  const connStr = process.env.STORAGE_CONNECTION_STRING!;
  const accountName = connStr.match(/AccountName=([^;]+)/)?.[1]!;
  const accountKey = connStr.match(/AccountKey=([^;]+)/)?.[1]!;
  const credential = new StorageSharedKeyCredential(accountName, accountKey);

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName: container,
      blobName: filename,
      permissions: BlobSASPermissions.parse("cw"), // create + write
      expiresOn: new Date(Date.now() + 30 * 60 * 1000), // 30 min
    },
    credential
  ).toString();

  res.json({
    uploadUrl: `${blobClient.url}?${sasToken}`,
    blobUrl: blobClient.url,
  });
});

// ═══════════════════════════════════════
//  STREAM ROUTE (generate read-only URL)
// ═══════════════════════════════════════

// GET /api/stream/:filename — returns a temporary URL to stream audio
app.get("/api/stream/:filename", async (req, res) => {
  const blobClient = audioContainerClient.getBlockBlobClient(
    req.params.filename
  );

  const connStr = process.env.STORAGE_CONNECTION_STRING!;
  const accountName = connStr.match(/AccountName=([^;]+)/)?.[1]!;
  const accountKey = connStr.match(/AccountKey=([^;]+)/)?.[1]!;
  const credential = new StorageSharedKeyCredential(accountName, accountKey);

  const sasToken = generateBlobSASQueryParameters(
    {
      containerName: "audio",
      blobName: req.params.filename,
      permissions: BlobSASPermissions.parse("r"), // read only
      expiresOn: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    },
    credential
  ).toString();

  res.json({ streamUrl: `${blobClient.url}?${sasToken}` });
});

// ═══════════════════════════════════════
//  PLAYER STATE (for real-time sync)
// ═══════════════════════════════════════

// GET /api/player-state/:userId
app.get("/api/player-state/:userId", async (req, res) => {
  try {
    const db = await getDb();
    const result = await db.request()
      .input("userId", sql.NVarChar, req.params.userId)
      .query("SELECT * FROM player_state WHERE user_id = @userId");
    res.json(result.recordset[0] || {});
  } catch (err) {
    res.json({});
  }
});

// PUT /api/player-state/:userId
app.put("/api/player-state/:userId", async (req, res) => {
  try {
    const { track_id, position_ms, is_playing } = req.body;
    const db = await getDb();
    const result = await db.request()
      .input("userId", sql.NVarChar, req.params.userId)
      .input("trackId", sql.UniqueIdentifier, track_id || null)
      .input("positionMs", sql.Int, position_ms || 0)
      .input("isPlaying", sql.Bit, is_playing ? 1 : 0)
      .query(`
        MERGE player_state AS target
        USING (SELECT @userId AS user_id) AS source
        ON target.user_id = source.user_id
        WHEN MATCHED THEN
          UPDATE SET track_id = @trackId, position_ms = @positionMs,
                     is_playing = @isPlaying, updated_at = GETUTCDATE()
        WHEN NOT MATCHED THEN
          INSERT (user_id, track_id, position_ms, is_playing)
          VALUES (@userId, @trackId, @positionMs, @isPlaying)
        OUTPUT INSERTED.*;
      `);
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to update player state" });
  }
});

// ═══════════════════════════════════════
//  START SERVER
// ═══════════════════════════════════════

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Vinil API running on http://localhost:${PORT}`);
});
```

### 5.6 — Add Scripts to package.json

Update `server/package.json` scripts:
```json
{
  "scripts": {
    "dev": "nodemon --exec ts-node src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

### 5.7 — Test Locally

```bash
cd server
npm run dev
```

In another terminal, test:
```bash
# Create an album
curl -X POST http://localhost:3001/api/albums \
  -H "Content-Type: application/json" \
  -d '{"title":"Dark Side of the Moon","artist":"Pink Floyd","year":1973,"genre":"Progressive Rock"}'

# List albums
curl http://localhost:3001/api/albums
```

---

## Step 6: Add SignalR Hub (Real-Time Playback Sync)

### 6.1 — Install SignalR Package

```bash
cd server
npm install @microsoft/signalr @azure/web-pubsub
```

### 6.2 — Add SignalR Hub to the Server

Add the following to `server/src/index.ts` **before** `app.listen()`:

```typescript
import { createServer } from "http";

// Replace the simple app.listen() with:
const server = createServer(app);

// ── SignalR-style hub using WebSocket ──
import { WebSocket, WebSocketServer } from "ws";
// npm install ws @types/ws

const wss = new WebSocketServer({ server, path: "/hub/player" });

const connectedClients = new Map<string, Set<WebSocket>>();

wss.on("connection", (ws, req) => {
  const url = new URL(req.url!, `http://${req.headers.host}`);
  const userId = url.searchParams.get("userId") || "anonymous";

  // Add to user's connection set
  if (!connectedClients.has(userId)) {
    connectedClients.set(userId, new Set());
  }
  connectedClients.get(userId)!.add(ws);

  console.log(`Client connected: ${userId}`);

  ws.on("message", (data) => {
    const message = JSON.parse(data.toString());

    // Broadcast to all other devices of the same user
    const userClients = connectedClients.get(userId);
    if (userClients) {
      for (const client of userClients) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
        }
      }
    }
  });

  ws.on("close", () => {
    connectedClients.get(userId)?.delete(ws);
    if (connectedClients.get(userId)?.size === 0) {
      connectedClients.delete(userId);
    }
    console.log(`Client disconnected: ${userId}`);
  });
});

server.listen(PORT, () => {
  console.log(`Vinil API + WebSocket running on http://localhost:${PORT}`);
});
```

> **Note:** For local dev we use a simple WebSocket server. When deployed to Azure,
> you can swap this to use Azure SignalR Service as a managed WebSocket hub for
> better scalability. The client code stays the same.

### 6.3 — Client-Side Hook (for your React app)

Create `src/app/hooks/usePlayerSync.ts` in your Vinil frontend:

```typescript
import { useEffect, useRef, useCallback } from "react";

interface PlayerState {
  trackId: string;
  position: number;
  isPlaying: boolean;
  timestamp: number;
}

export function usePlayerSync(userId: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const onSyncRef = useRef<((state: PlayerState) => void) | null>(null);

  useEffect(() => {
    const ws = new WebSocket(
      `ws://localhost:3001/hub/player?userId=${userId}`
    );

    ws.onopen = () => console.log("Player sync connected");

    ws.onmessage = (event) => {
      const state: PlayerState = JSON.parse(event.data);
      onSyncRef.current?.(state);
    };

    ws.onclose = () => {
      console.log("Player sync disconnected");
      // Reconnect after 3 seconds
      setTimeout(() => {
        wsRef.current = new WebSocket(
          `ws://localhost:3001/hub/player?userId=${userId}`
        );
      }, 3000);
    };

    wsRef.current = ws;
    return () => ws.close();
  }, [userId]);

  const broadcastState = useCallback((state: PlayerState) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(state));
    }
  }, []);

  const onSync = useCallback((callback: (state: PlayerState) => void) => {
    onSyncRef.current = callback;
  }, []);

  return { broadcastState, onSync };
}
```

**Usage in PlayerContext:**
```typescript
const { broadcastState, onSync } = usePlayerSync("user-123");

// When local playback changes, broadcast to other devices
broadcastState({
  trackId: currentTrack.id,
  position: currentPosition,
  isPlaying: true,
  timestamp: Date.now(),
});

// When receiving state from another device
onSync((state) => {
  setCurrentTrack(state.trackId);
  seekTo(state.position);
  state.isPlaying ? play() : pause();
});
```

---

## Step 7: Deploy API to Azure App Service

### 7.1 — Create App Service (Free Tier)

```bash
# Create an App Service plan (free tier)
az appservice plan create \
  --name vinil-plan \
  --resource-group vinil-rg \
  --sku F1 \
  --is-linux

# Create the web app
az webapp create \
  --name vinil-api \
  --resource-group vinil-rg \
  --plan vinil-plan \
  --runtime "NODE:20-lts"
```

> `vinil-api` must be globally unique. If taken, try `vinil-api-123`.

### 7.2 — Configure Environment Variables

```bash
az webapp config appsettings set \
  --name vinil-api \
  --resource-group vinil-rg \
  --settings \
    SQL_SERVER="vinil-sql-server.database.windows.net" \
    SQL_DATABASE="vinil-db" \
    SQL_USER="viniladmin" \
    SQL_PASSWORD="<YourStrongPassword123!>" \
    STORAGE_CONNECTION_STRING="<your-storage-connection-string>" \
    STORAGE_ACCOUNT_NAME="vinilstorage" \
    SIGNALR_CONNECTION_STRING="<your-signalr-connection-string>"
```

### 7.3 — Enable WebSockets

```bash
az webapp config set \
  --name vinil-api \
  --resource-group vinil-rg \
  --web-sockets-enabled true
```

### 7.4 — Deploy

```bash
cd server

# Build TypeScript
npm run build

# Deploy using zip deploy
zip -r deploy.zip dist/ package.json package-lock.json

az webapp deploy \
  --name vinil-api \
  --resource-group vinil-rg \
  --src-path deploy.zip \
  --type zip
```

### 7.5 — Verify Deployment

```bash
# Check the app is running
curl https://vinil-api.azurewebsites.net/api/albums
```

---

## Step 8: Connect Your Vinil Frontend to the API

### 8.1 — Create an API Client

Create `src/app/services/api.ts`:

```typescript
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// Albums
export const api = {
  getAlbums: () => request<Album[]>("/api/albums"),
  getAlbum: (id: string) => request<Album>(`/api/albums/${id}`),
  createAlbum: (album: Partial<Album>) =>
    request<Album>("/api/albums", {
      method: "POST",
      body: JSON.stringify(album),
    }),

  // Tracks
  getTracks: () => request<Track[]>("/api/tracks"),
  createTrack: (track: Partial<Track>) =>
    request<Track>("/api/tracks", {
      method: "POST",
      body: JSON.stringify(track),
    }),

  // Playlists
  getPlaylists: () => request<Playlist[]>("/api/playlists"),
  createPlaylist: (playlist: Partial<Playlist>) =>
    request<Playlist>("/api/playlists", {
      method: "POST",
      body: JSON.stringify(playlist),
    }),

  // Upload
  getUploadUrl: (container: string, filename: string) =>
    request<{ uploadUrl: string; blobUrl: string }>(
      `/api/upload/sas?container=${container}&filename=${encodeURIComponent(filename)}`
    ),

  // Streaming
  getStreamUrl: (filename: string) =>
    request<{ streamUrl: string }>(`/api/stream/${encodeURIComponent(filename)}`),

  // Player state
  getPlayerState: (userId: string) =>
    request<PlayerState>(`/api/player-state/${userId}`),
  updatePlayerState: (userId: string, state: Partial<PlayerState>) =>
    request<PlayerState>(`/api/player-state/${userId}`, {
      method: "PUT",
      body: JSON.stringify(state),
    }),
};
```

### 8.2 — Add Environment Variable

Create `src/.env` (or update existing):
```env
VITE_API_URL=http://localhost:3001
```

For production, set:
```env
VITE_API_URL=https://vinil-api.azurewebsites.net
```

---

## Summary: All Resources Created

| Resource | Azure Service | Tier | Monthly Cost |
|----------|--------------|------|-------------|
| Metadata DB | Azure SQL Database | Free (Serverless) | $0.00 |
| Audio + Artwork | Blob Storage | Cool | ~$0.50 (50 GB) |
| Real-time sync | SignalR Service | Free | $0.00 |
| API Server | App Service | Free (F1) | $0.00 |
| **Total** | | | **~$0.50/mo** |

## All Connection Strings Needed

Run these anytime to retrieve your credentials:

```bash
# Azure SQL
az sql db show-connection-string \
  --server vinil-sql-server \
  --name vinil-db \
  --client node \
  -o tsv

# Blob Storage
az storage account show-connection-string \
  --name vinilstorage \
  --resource-group vinil-rg \
  --query connectionString -o tsv

# SignalR
az signalr key list \
  --name vinil-signalr \
  --resource-group vinil-rg \
  --query primaryConnectionString -o tsv
```

## Cleanup (if you want to tear everything down)

```bash
az group delete --name vinil-rg --yes --no-wait
```

This deletes ALL resources in the group at once.

---

## Next Steps

- [ ] Set up Azure Entra ID for authentication
- [ ] Add CDN in front of Blob Storage for faster streaming
- [ ] Set up CI/CD with GitHub Actions to auto-deploy the API
- [ ] Build the mobile app (React Native) with the same API client
- [ ] Add Azure Application Insights for monitoring
