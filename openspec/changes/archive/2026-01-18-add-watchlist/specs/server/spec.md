# server Specification Delta (add-watchlist)

## ADDED Requirements

### Requirement: Watchlist API Endpoints
The backend SHALL provide endpoints for users to manage their watchlists.

#### Scenario: Get Watchlist
- **GIVEN** an authenticated user
- **WHEN** they request `GET /api/watchlist`
- **THEN** the server SHALL return a list of media items in their watchlist
- **AND** the response SHALL include full media metadata (sources, categories, cast)

#### Scenario: Add to Watchlist
- **GIVEN** an authenticated user and a valid `mediaId`
- **WHEN** they request `POST /api/watchlist` with `{ "mediaId": "some-id" }`
- **THEN** the server SHALL add the media to their watchlist
- **AND** return a 201 status

#### Scenario: Remove from Watchlist
- **GIVEN** an authenticated user and a watchlisted `mediaId`
- **WHEN** they request `DELETE /api/watchlist/:mediaId`
- **THEN** the server SHALL remove the media from their watchlist
- **AND** return a 200 status

### Requirement: Authentication for Watchlist
All watchlist endpoints SHALL require user authentication.

#### Scenario: Unauthorized Access
- **GIVEN** an unauthenticated request
- **WHEN** any watchlist endpoint is accessed
- **THEN** the server SHALL return a 401 Unauthorized status
