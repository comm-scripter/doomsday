# Doomsday Meter — Server Setup & Management

## Server Details
- **Provider:** AWS EC2
- **OS:** Amazon Linux
- **Node.js:** v22 (via nvm)
- **Process manager:** PM2
- **Web server:** Nginx (separate game server also running)
- **App port:** 3001
- **Access:** `http://YOUR_IP:3001`

---

## Initial Setup (already done)

### 1. Install git
```bash
sudo yum install -y git
```

### 2. Install nvm and Node 22
Amazon Linux ships with Node 18 which is too old for Vite 8. Use nvm:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 22
nvm use 22
```

### 3. Clone the repo and build
```bash
cd /home/ec2-user
git clone https://github.com/comm-scripter/doomsday.git
cd doomsday/app
npm install
npm run build
```

### 4. Start with PM2
```bash
pm2 start "npm start" --name doomsday
pm2 save
```

### 5. AWS Security Group
Port 3001 must be open inbound:
- Type: Custom TCP
- Port: 3001
- Source: 0.0.0.0/0

---

## Deploying Updates

### Frontend changes (`app/src/` — React components, hooks, API files)
A rebuild is required:
```bash
cd /home/ec2-user/doomsday && git pull && cd app && npm run build && pm2 restart doomsday
```
Then hard-refresh the browser (Ctrl+Shift+R) to bust the cached old bundle.

### Server-only changes (`app/server/index.js`)
No rebuild needed — just pull and restart:
```bash
cd /home/ec2-user/doomsday && git pull && pm2 restart doomsday
```

When in doubt, run the full rebuild command — it's safe to run even when not strictly needed.

---

## Useful PM2 Commands

| Command | Purpose |
|---|---|
| `pm2 list` | See all running processes and their status |
| `pm2 logs doomsday --lines 20` | View recent app logs (errors + output) |
| `pm2 restart doomsday` | Restart the app |
| `pm2 stop doomsday` | Stop the app |
| `pm2 start doomsday` | Start a stopped app |
| `pm2 save` | Persist current process list across reboots |

---

## Architecture

```
Browser → AWS Security Group (port 3001)
       → Express server (server/index.js, port 3001)
         ├── /api/gdelt  → proxies to api.gdeltproject.org
         ├── /api/who/*  → proxies to who.int
         ├── /api/gdacs/* → proxies to gdacs.org
         └── /*          → serves built React app (app/dist/)
```

The Express server handles two jobs: proxying the external APIs (which block direct browser requests due to CORS) and serving the built frontend. There is no separate static file server.

---

## Notes

- nvm is not loaded by default in non-interactive shells. If PM2 restarts on reboot and can't find Node 22, add this to `/home/ec2-user/.bashrc` and re-run `pm2 startup`:
  ```bash
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  ```
- The app does **not** need to be rebuilt after most config changes — only after changes to `app/src/` (frontend code). Changes to `app/server/index.js` only require a `pm2 restart doomsday`.
- Nginx is running separately for the game server and does not need to be touched for this app.
