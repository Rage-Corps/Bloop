## ADDED Requirements

### Requirement: Stars Page Sorting
The stars page SHALL allow users to sort cast members by name or media count.

#### Scenario: Sort by name ascending
- **GIVEN** the stars page with multiple cast members
- **WHEN** user selects "Name A-Z" from the sort dropdown
- **THEN** cast members SHALL be sorted alphabetically from A to Z

#### Scenario: Sort by name descending
- **GIVEN** the stars page with multiple cast members
- **WHEN** user selects "Name Z-A" from the sort dropdown
- **THEN** cast members SHALL be sorted alphabetically from Z to A

#### Scenario: Sort by media count (most)
- **GIVEN** the stars page with cast members having varying media counts
- **WHEN** user selects "Most Media" from the sort dropdown
- **THEN** cast members SHALL be sorted by media count in descending order

#### Scenario: Sort by media count (least)
- **GIVEN** the stars page with cast members having varying media counts
- **WHEN** user selects "Least Media" from the sort dropdown
- **THEN** cast members SHALL be sorted by media count in ascending order

### Requirement: Hide Stars Without Images Filter
The stars page SHALL provide a toggle to hide cast members that have no associated images.

#### Scenario: Enable filter
- **GIVEN** the stars page with cast members some having images and some not
- **WHEN** user enables "Hide stars without images" toggle
- **THEN** only cast members with `imageUrl` not null SHALL be displayed

#### Scenario: Disable filter
- **GIVEN** the stars page with "Hide stars without images" filter enabled
- **WHEN** user disables the toggle
- **THEN** all cast members SHALL be displayed regardless of image status

### Requirement: Media Count Display
The `CastMemberCard` component SHALL display the number of media items each star is associated with.

#### Scenario: Display media count
- **GIVEN** a cast member associated with 5 media items
- **WHEN** the `CastMemberCard` is rendered
- **THEN** a badge showing "5" SHALL be displayed next to the star's name

#### Scenario: No media count
- **GIVEN** a cast member with no media associations
- **WHEN** the `CastMemberCard` is rendered
- **THEN** no media count badge SHALL be displayed

### Requirement: Sort and Filter Preference Persistence
The stars page SHALL persist user's sort order and filter preferences.

#### Scenario: Save preferences
- **GIVEN** user selects "Most Media" sort and enables "Hide stars without images"
- **WHEN** preferences change
- **THEN** settings SHALL be saved to user configuration

#### Scenario: Restore preferences
- **GIVEN** user has saved "Least Media" sort and disabled filter
- **WHEN** user navigates to the stars page
- **THEN** page SHALL load with saved preferences applied

## MODIFIED Requirements

### Requirement: Stars Page
The system SHALL provide a dedicated page at `/stars` to browse media by cast member.

#### Scenario: No Discover Images button
- **GIVEN** the stars page
- **WHEN** page is rendered
- **THEN** it SHALL NOT contain a "Discover Images" button

#### Scenario: Browse with sorting and filtering
- **GIVEN** the stars page with sort dropdown and filter toggle
- **WHEN** page is rendered
- **THEN** it SHALL display a sort dropdown with options for Name (A-Z, Z-A) and Media (Most, Least)
- **AND** it SHALL display a "Hide stars without images" toggle
- **AND** each cast member card SHALL show a media count badge
