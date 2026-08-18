## [Milestone 1] Server & Socket Setup - July 23, 2026

- Initialized Express backend and Socket.io.
- Decided on modular folder structure to avoid single-file bloat.

## [Milestone 2] Room Creation API - July 24, 2026

- Added modular controller and route files for room management.
- Implemented random room code generator endpoint and hooked routes into `server.js`.

## [Milestone 3] Room Validation & In-Memory Storage - July 24, 2026

- Added an in-memory `Set` (`activeRooms`) to track active room codes.
- Implemented `checkRoom` controller and a GET route with route parameters (`/check/:roomCode`) to validate rooms before joining.

## [Milestone 4] Socket.io Room Joining - July 24, 2026

- Configured Socket.io connection and disconnection handlers.
- Implemented `join-room` event listener so clients can join specific room channels.

## [Milestone 6] Participant Mapping & Room State - July 25, 2026

- Implemented `roomParticipants` Map to track users by room code and socket ID.
- Added validation for room existence on join-room.
- Handled clean disconnection tracking and real-time room participant broadcasting.

## [Milestone 7] Room Creation & Participant Storage Integration - July 25, 2026

- Connected roomState across the HTTP router and Socket.io server.
- Stored adminProblems on room creation.
- Captured leetcodeUsername properly when a client joins a room.

## [Milestone 8] Contest Timing Configuration - July 25, 2026

- Updated room creation logic to accept and store contest start and end timestamps in roomState.
- Prepared the room structure for future time-bound submission validation during leaderboard calculation.

## [Milestone 10] Contest Status and Timer Synchronization - July 25, 2026

- Implemented getContestStatus utility to dynamically evaluate whether a contest is "upcoming", "Ongoing", or "Ended" based on current system time versus startTime and endTime.
- Updated socket connection handler on join-room to calculate and emit the contest status along with timestamps and participants.

## [Milestone 11] Modularized Socket Handlers & Periodic Status Check - July 26, 2026

- Successfully refactored socket logic into roomSocket.js.
- Integrated a periodic setInterval loop to automatically broadcast state transitions `(upcoming -> Ongoing -> Ended)` to all participants in a room.

## [Milestone 12] MongoDB Integration for Rooms - July 28, 2026

-- Connected Mongoose to MongoDB Atlas before starting the Express and Socket.io server.
-- Created the Room schema with support for roomCode, adminProblems, contest timings, status tracking, and embedded participant structures.
--Updated roomcontroller.js to handle asynchronous room creation and validation against MongoDB.

## [Milestone 13] Updated Socket Handlers with MongoDB Support - July 29, 2026

-- Successfully integrated MongoDB queries and mutations into roomSocket.js.
-- Implemented robust join-room, disconnect, and periodic status check workflows using Mongoose models.

## [Milestone 14] Frontend Initialization & Client-Side Integration - August 5, 2026

-- Initialized and connected the frontend interface to the backend server.
-- Integrated socket.io-client to handle real-time events like room-update and user joins.
-- Built initial client views for room joining, username entry, and live status updates.

## [Milestone 16] Structured Admin Room Configuration & Slugging Logic - August 18, 2026

-- Updated MongoDB schema (room.js) to support an array of structured problem objects containing titleSlug and custom points.
-- Implemented robust input validation and formatting logic in roomController.js to normalize problem titles (lowercase + space-to-hyphen conversion) and assign point weights automatically.
-- Enhanced frontend creation views with dynamic row generation for custom questions and point allocations.

## [Milestone 17] LeetCode Username Validation & Socket Room Gateway - August 18, 2026

-- Integrated automated LeetCode profile verification (verifyLeetcodeUser) into the backend socket connection handlers to ensure participants enter valid handles.
-- Updated roomsocket.js and Home.jsx to process async socket acknowledgments and cleanly surface validation errors.
--Secured room-entry flows against invalid user handles and non-existent room codes.
