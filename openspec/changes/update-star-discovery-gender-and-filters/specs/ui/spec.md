# ui Spec Delta

## MODIFIED Requirements

### Requirement: Stars Page Filtering

The stars page SHALL provide filters for gender and presence of images, with specific defaults.

#### Scenario: Gender filter

- **GIVEN** the stars page
- **WHEN** rendered
- **THEN** it SHALL include a dropdown or select for "Gender" with options: "All", "Female", "Male", "Transgender"
- **AND** it SHALL default to "Female"

#### Scenario: Default image filter

- **GIVEN** the stars page
- **WHEN** rendered for the first time
- **THEN** the "With images" (Hide stars without images) toggle SHALL be checked by default
