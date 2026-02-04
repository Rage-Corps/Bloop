# ui Spec Delta

## MODIFIED Requirements

### Requirement: Stars Page

The system SHALL provide a dedicated page at `/stars` to browse media by cast member with gender filtering support.

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
- **AND** it SHALL include a dropdown or select for "Gender" with options: "All", "Female", "Male", "Transgender"
- **AND** it SHALL default "Gender" to "Female"
- **AND** it SHALL default "Hide stars without images" toggle to checked
