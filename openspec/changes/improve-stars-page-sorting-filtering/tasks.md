## 1. Backend Implementation
- [x] 1.1 Update `CastDao` to count media associations in `getAllCastMembers()` query
- [x] 1.2 Add `orderBy` parameter support to `getAllCastMembers()` (name_asc, name_desc, mediaCount_asc, mediaCount_desc)
- [x] 1.3 Add `hasImage` filter parameter to `getAllCastMembers()`
- [x] 1.4 Update `/api/cast` route handler to accept and pass new parameters to DAO
- [x] 1.5 Return `mediaCount` field in API response for each cast member

## 2. Type Definitions
- [x] 2.1 Update `CastMember` type in shared-types to include optional `mediaCount?: number`
- [x] 2.2 Update `FetchCastMembersOptions` type in shared-types to include `orderBy?: string` and `hasImage?: boolean`

## 3. Frontend Implementation - Stars Page
- [x] 3.1 Add sorting state and dropdown UI (Name A-Z, Name Z-A, Most Media, Least Media)
- [x] 3.2 Add "Hide stars without images" toggle/checkbox
- [x] 3.3 Update `loadStars()` to pass sort and filter parameters
- [x] 3.4 Persist sort/filter preferences in user config
- [x] 3.5 Load and apply saved preferences on mount

## 4. Frontend Implementation - CastMemberCard Component
- [x] 4.1 Update `CastMemberCard` to display media count badge next to name
- [x] 4.2 Handle display when `mediaCount` is 0 or undefined

## 5. Validation
- [x] 5.1 Test sorting by name (ascending/descending)
- [x] 5.2 Test sorting by media count (most/least)
- [x] 5.3 Test "Hide stars without images" filter
- [x] 5.4 Test persistence of preferences across page reloads
- [x] 5.5 Verify pagination works correctly with new filters
- [x] 5.6 Verify search functionality still works with new filters
