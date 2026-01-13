# config Spec Delta

## MODIFIED Requirements

### Requirement: Media Query Parameters
The `MediaQuery` type SHALL include parameters for filtering by cast members.

#### Scenario: MediaQuery with cast
- **GIVEN** the `MediaQuery` interface
- **THEN** it SHALL include an optional `cast` property of type `string[]`
