# config Specification Delta (add-watchlist)

## ADDED Requirements

### Requirement: Watchlist Database Table
The system SHALL have a `watchlist` table to store user-media associations.

#### Scenario: Schema Migration
- **GIVEN** the database schema
- **WHEN** the migration is applied
- **THEN** a `watchlist` table SHALL exist with `id`, `user_id`, `media_id`, and `created_at` columns
- **AND** `user_id` SHALL reference the `user` table
- **AND** `media_id` SHALL reference the `media` table
- **AND** both references SHALL have `ON DELETE CASCADE`
