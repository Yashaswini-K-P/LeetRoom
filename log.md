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
