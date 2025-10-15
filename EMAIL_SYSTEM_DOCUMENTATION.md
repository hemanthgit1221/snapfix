# SnapFix Email System Documentation

## Overview
The SnapFix email system provides comprehensive email notifications for all ticket lifecycle events. The system automatically sends emails to relevant stakeholders when tickets are created, approved, assigned, and resolved.

## Email Flow

### 1. Ticket Creation
**When:** A user creates a new ticket
**Recipients:** 
- Ticket creator (confirmation email)
- All admins (notification email)

**Email Details:**
- **To User:** Confirmation with ticket details and status
- **To Admins:** Detailed ticket information requiring admin attention

### 2. Ticket Approval
**When:** Admin approves a ticket
**Recipients:** 
- Ticket creator (approval confirmation)

**Email Details:**
- Confirmation that ticket is approved and will be assigned soon
- Ticket details and approved by information

### 3. Ticket Assignment
**When:** Admin assigns ticket to staff member
**Recipients:**
- Ticket creator (assignment notification)
- Assigned staff member (new assignment notification)

**Email Details:**
- **To User:** Notification that ticket is assigned to staff
- **To Staff:** Detailed ticket information and assignment details

### 4. Ticket Resolution
**When:** Staff marks ticket as resolved
**Recipients:**
- Ticket creator (resolution notification)
- All admins (resolution summary)

**Email Details:**
- **To User:** Resolution confirmation with details
- **To Admins:** Resolution summary for tracking

## Configuration

### Environment Variables
Set these environment variables for email configuration:

```bash
# Email Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
```

### Application Properties
The system uses the following configuration in `application.yml`:

```yaml
spring:
  mail:
    host: ${MAIL_HOST:smtp.gmail.com}
    port: ${MAIL_PORT:587}
    username: ${MAIL_USERNAME:}
    password: ${MAIL_PASSWORD:}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
          connectiontimeout: 5000
          timeout: 3000
          writetimeout: 5000
    default-encoding: UTF-8

app:
  name: SnapFix
```

## API Endpoints

### Ticket Approval
```
PUT /api/tickets/{id}/approve
```
**Authorization:** ADMIN, DEPARTMENT_HEAD
**Description:** Approves a ticket and sends approval notification

### Ticket Assignment
```
PUT /api/tickets/{id}/assign?assignedToId={staffId}
```
**Authorization:** ADMIN, DEPARTMENT_HEAD
**Description:** Assigns ticket to staff and sends assignment notifications

### Ticket Status Update
```
PUT /api/tickets/{id}/status?status={status}
```
**Authorization:** ADMIN, DEPARTMENT_HEAD, STAFF
**Description:** Updates ticket status and sends appropriate notifications

## Email Service Methods

### Core Methods
- `sendTicketCreatedNotification(Ticket ticket)` - Sends creation notifications
- `sendTicketApprovalNotification(Ticket ticket, User adminUser)` - Sends approval notification
- `sendTicketAssignmentNotification(Ticket ticket, User adminUser)` - Sends assignment notifications
- `sendTicketStatusUpdateNotification(Ticket ticket, User updatedBy)` - Sends status update notifications
- `sendTicketResolvedNotification(Ticket ticket, User resolvedBy)` - Sends resolution notifications

### Admin Notification Methods
- `sendTicketCreatedAdminNotification(Ticket ticket)` - Notifies all admins of new tickets
- `sendTicketResolvedNotification(Ticket ticket, User resolvedBy)` - Notifies admins of resolutions

## Ticket Status Flow

1. **PENDING** - Initial status when ticket is created
2. **APPROVED** - When admin approves the ticket
3. **IN_PROGRESS** - When ticket is assigned to staff
4. **AT_SITE** - When staff is working on-site
5. **WAITING_FOR_MATERIAL** - When waiting for materials
6. **RESOLVED** - When issue is fixed
7. **CLOSED** - When ticket is closed
8. **REJECTED** - When ticket is rejected

## Error Handling

The email system includes comprehensive error handling:
- Email failures don't break the main ticket flow
- Errors are logged to console for debugging
- Graceful degradation ensures system continues to function

## Testing

To test the email system:

1. Set up email configuration with valid SMTP credentials
2. Create a test ticket
3. Check that both user and admin receive appropriate emails
4. Test approval, assignment, and resolution flows
5. Verify email content and formatting

## Security Considerations

- Email credentials should be stored as environment variables
- Use app-specific passwords for Gmail
- Consider using a dedicated email service for production
- Implement rate limiting for email sending if needed

## Troubleshooting

### Common Issues
1. **Emails not sending:** Check SMTP credentials and network connectivity
2. **Authentication errors:** Verify email username/password
3. **Timeout errors:** Check network connectivity and SMTP server status
4. **Missing emails:** Check spam folders and email filters

### Debug Mode
Enable debug logging to troubleshoot email issues:
```yaml
logging:
  level:
    org.springframework.mail: DEBUG
```

## Future Enhancements

Potential improvements for the email system:
- HTML email templates
- Email templates customization
- Email scheduling and queuing
- Email delivery tracking
- User email preferences
- Email digests and summaries


