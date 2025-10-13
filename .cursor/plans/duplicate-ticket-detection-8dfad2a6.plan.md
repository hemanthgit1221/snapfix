<!-- 8dfad2a6-7a01-49b2-a014-c8ffd11582ff 6464d6d6-7a10-49b5-8b56-6f1229277a2e -->
# Duplicate Ticket Detection System

## Implementation Strategy

### 1. Backend - Duplicate Detection Logic

**Add duplicate detection method to `TicketRepository.java`:**

```java
@Query("SELECT t FROM Ticket t WHERE t.roomNumber = :roomNumber " +
       "AND t.category = :category " +
       "AND t.status IN ('PENDING', 'IN_PROGRESS', 'AT_SITE', 'WAITING_FOR_MATERIAL') " +
       "ORDER BY t.createdAt DESC")
List<Ticket> findPotentialDuplicates(
    @Param("roomNumber") String roomNumber, 
    @Param("category") TicketCategory category
);
```

**Create new DTO `DuplicateCheckResponse.java`:**

```java
public class DuplicateCheckResponse {
    private boolean hasDuplicates;
    private List<TicketResponse> potentialDuplicates;
    private double similarityScore; // 0.0 to 1.0
}
```

**Add duplicate detection to `TicketService.java`:**

- New method `checkForDuplicates()` that:
  - Finds tickets with same room + category that are active
  - Calculates text similarity between descriptions using Levenshtein distance or Jaccard similarity
  - Returns matches with similarity > 70% threshold

**Add new endpoint to `TicketController.java`:**

```java
@PostMapping("/check-duplicate")
public ResponseEntity<DuplicateCheckResponse> checkDuplicate(
    @RequestBody CreateTicketRequest request,
    Authentication authentication
)
```

**Modify `createTicket()` in TicketService.java:**

- Add optional parameter `forcCreate` boolean
- If not forcing, check duplicates and throw exception with duplicate info
- If forcing, skip duplicate check and create ticket

### 2. Frontend - Duplicate Warning UI

**Create new component `DuplicateWarningModal.tsx`:**

- Display list of potential duplicate tickets
- Show similarity indicators for each match
- Options: "View Existing Ticket", "Proceed Anyway", "Cancel"
- Link to existing ticket details

**Modify `CreateTicket.tsx`:**

- Add duplicate check API call before submission
- If duplicates found, show `DuplicateWarningModal`
- Add "force create" flag when user chooses to proceed
- Handle both duplicate check response and force create flow

**Update `ticketService.ts`:**

- Add `checkDuplicates(ticketData)` function
- Modify `createTicket()` to accept optional `forceCreate` parameter

### 3. Text Similarity Algorithm

Implement simple Jaccard similarity in `TicketService.java`:

```java
private double calculateSimilarity(String desc1, String desc2) {
    Set<String> words1 = new HashSet<>(Arrays.asList(desc1.toLowerCase().split("\\s+")));
    Set<String> words2 = new HashSet<>(Arrays.asList(desc2.toLowerCase().split("\\s+")));
    Set<String> intersection = new HashSet<>(words1);
    intersection.retainAll(words2);
    Set<String> union = new HashSet<>(words1);
    union.addAll(words2);
    return union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();
}
```

### 4. Database Optimization

Add composite index to `schema.sql` for faster duplicate lookups:

```sql
CREATE INDEX idx_tickets_duplicate_check ON tickets(room_number, category, status);
```

## Files to Modify

**Backend:**

- `backend/src/main/java/com/snapfix/repository/TicketRepository.java`
- `backend/src/main/java/com/snapfix/service/TicketService.java`
- `backend/src/main/java/com/snapfix/controller/TicketController.java`
- `backend/src/main/java/com/snapfix/dto/DuplicateCheckResponse.java` (new)

**Frontend:**

- `frontend/src/components/tickets/CreateTicket.tsx`
- `frontend/src/components/tickets/DuplicateWarningModal.tsx` (new)
- `frontend/src/services/ticketService.ts`

**Database:**

- `database/schema.sql` (add index)
- `deployment/init.sql` (add index)

### To-dos

- [ ] Add duplicate detection query to TicketRepository.java
- [ ] Create DuplicateCheckResponse.java DTO with hasDuplicates, potentialDuplicates, and similarityScore fields
- [ ] Implement duplicate detection logic in TicketService.java with text similarity algorithm
- [ ] Add /check-duplicate endpoint and modify createTicket to support forceCreate parameter
- [ ] Create DuplicateWarningModal.tsx component to display potential duplicates with options
- [ ] Update CreateTicket.tsx to check duplicates before submission and handle force create flow
- [ ] Add checkDuplicates and update createTicket in ticketService.ts to support duplicate checking
- [ ] Add composite index for duplicate check optimization to schema.sql and init.sql