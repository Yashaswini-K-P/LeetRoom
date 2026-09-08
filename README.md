# LeetRoom

A real-time hosting platform for custom LeetCode contests. It allows admins to create private rooms with custom problem sets and point weights, while participants join via room codes, have their LeetCode handles automatically verified, and compete on a live-updating leaderboard driven by real-time background submission polling.

---

## **Key Features**
- **Custom Room Creation & Slugging**: Admins can configure custom problem sets by providing LeetCode problem titles, which are automatically normalized into slugs with customizable point allocations.
- **Automated LeetCode Verification**: Validates participant usernames against LeetCode profile endpoints in real-time during socket handshakes to ensure handle authenticity.
- **Real-Time State & Timer Synchronization**: Background interval loops automatically transition contest phases (`upcoming` -> `Ongoing` -> `Ended`) and broadcast updates to all connected clients.
- **Live Leaderboard Polling Engine**: Periodically fetches user submissions, validates timestamps against contest windows, calculates custom points, evaluates tie-breakers, and pushes real-time leaderboard states via WebSockets.
- **Persistent Storage & Cleanup**: Integrates MongoDB (Mongoose) for durable room configurations and participant states, paired with in-memory caching (`roomManager.js`) for high-performance active contest processing.

---

## **Tech Stack**
- **Backend**: Node.js, Express, Socket.io, Mongoose
- **Database**: MongoDB Atlas
- **Frontend**: React, Material-UI (MUI), socket.io-client
- **External Services**: LeetCode API wrappers / profile endpoints for submission tracking

---

## **Project Architecture & Milestones**

The repository has been built iteratively across structured functional milestones:

| Phase | Component | Key Implementations |
| :--- | :--- | :--- |
| **Core Setup** | Express & Socket.io | Modular folder structure, room generation endpoints, and in-memory `Set` validation. |
| **Room Mechanics** | Mongoose & Sockets | MongoDB room schema integration, participant mapping (`roomParticipants`), and dynamic status calculation. |
| **Contest Engine** | Polling & RAM State | `roomManager.js` RAM tracking, `contestPoller.js` submission fetching, tie-breakers, and live `leaderboard-update` broadcasting. |
| **Frontend Integration** | React & MUI | Room views, handle verification flow, and the `LeaderboardModal` component with tabular rankings. |

---

## **Getting Started**

### **Prerequisites**
- Node.js (v18+ recommended)
- MongoDB Atlas URI or local MongoDB instance

### **Installation & Setup**
1. Clone the repository:
   ```bash
   git clone [https://github.com/your-username/leetcode-contest-platform.git](https://github.com/your-username/leetcode-contest-platform.git)
   cd leetcode-contest-platform```
2. Install dependencies for both backend and frontend:
    ```bash
    # Install backend dependencies
    npm install

    # Install frontend dependencies
    cd client
    npm install
     ```

3. Configure Environment Variables:
Create a .env file in the root directory and add your configuration:
    ```bash
    PORT=5000
    MONGO_URI=your_mongodb_connection_string_here
    ```

4. Run the Application:
    ```bash
    npm run dev
    ```
    
## API & Socket Events
**HTTP Routes**
POST /api/rooms - Create a new contest room with custom problems and timers.

GET /api/rooms/check/:roomCode - Validate whether a room code exists before entry.

## Socket Events
**join-room** - Authenticates user handle, verifies LeetCode profile, and adds client to the socket channel.

**room-update** - Broadcasts live participant lists, timers, and contest statuses.

**leaderboard-update** - Pushes real-time score updates and rankings calculated by the background poller.
