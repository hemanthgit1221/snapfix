package com.snapfix.service;

import com.snapfix.entity.Ticket;
import com.snapfix.entity.User;
import com.snapfix.entity.UserRole;
import com.snapfix.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.util.List;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Autowired
    private UserRepository userRepository;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${app.name:SnapFix}")
    private String appName;
    
    public void sendTicketCreatedNotification(Ticket ticket) {
        try {
            // Send notification to ticket creator
            SimpleMailMessage userMessage = new SimpleMailMessage();
            userMessage.setFrom(fromEmail);
            userMessage.setTo(ticket.getUser().getEmail());
            userMessage.setSubject("Ticket Created - " + ticket.getTicketId());
            
            String userBody = String.format(
                "Hello %s,\n\n" +
                "Your ticket has been successfully created!\n\n" +
                "Ticket Details:\n" +
                "Ticket ID: %s\n" +
                "Room: %s\n" +
                "Category: %s\n" +
                "Description: %s\n" +
                "Status: %s\n\n" +
                "We'll notify you once it's assigned to our staff.\n\n" +
                "Thank you for using %s!",
                ticket.getUser().getName(),
                ticket.getTicketId(),
                ticket.getRoomNumber(),
                ticket.getCategory(),
                ticket.getDescription(),
                ticket.getStatus(),
                appName
            );
            
            userMessage.setText(userBody);
            mailSender.send(userMessage);
            
            // Send notification to all admins
            sendTicketCreatedAdminNotification(ticket);
            
        } catch (Exception e) {
            // Log error but don't throw exception to avoid breaking the main flow
            System.err.println("Failed to send email notification: " + e.getMessage());
        }
    }
    
    public void sendTicketCreatedAdminNotification(Ticket ticket) {
        try {
            List<User> admins = userRepository.findByRole(UserRole.ADMIN);
            
            for (User admin : admins) {
                if (admin.getEmail() != null && !admin.getEmail().isEmpty()) {
                    SimpleMailMessage message = new SimpleMailMessage();
                    message.setFrom(fromEmail);
                    message.setTo(admin.getEmail());
                    message.setSubject("New Ticket Created - " + ticket.getTicketId());
                    
                    String body = String.format(
                        "Hello %s,\n\n" +
                        "A new ticket has been created and requires your attention.\n\n" +
                        "Ticket Details:\n" +
                        "Ticket ID: %s\n" +
                        "Reported by: %s (%s)\n" +
                        "Room: %s\n" +
                        "Floor: %s\n" +
                        "Building: %s\n" +
                        "Category: %s\n" +
                        "Priority: %s\n" +
                        "Description: %s\n" +
                        "Status: %s\n" +
                        "Created: %s\n\n" +
                        "Please log in to the admin dashboard to review and assign this ticket.\n\n" +
                        "Thank you!",
                        admin.getName(),
                        ticket.getTicketId(),
                        ticket.getUser().getName(),
                        ticket.getUser().getEmail(),
                        ticket.getRoomNumber(),
                        ticket.getFloor() != null ? ticket.getFloor() : "N/A",
                        ticket.getBuilding() != null ? ticket.getBuilding() : "N/A",
                        ticket.getCategory(),
                        ticket.getPriority(),
                        ticket.getDescription(),
                        ticket.getStatus(),
                        ticket.getCreatedAt().toString()
                    );
                    
                    message.setText(body);
                    mailSender.send(message);
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to send admin notification: " + e.getMessage());
        }
    }
    
    public void sendTicketStatusUpdateNotification(Ticket ticket, User updatedBy) {
        try {
            // Send notification to ticket creator
            SimpleMailMessage userMessage = new SimpleMailMessage();
            userMessage.setFrom(fromEmail);
            userMessage.setTo(ticket.getUser().getEmail());
            userMessage.setSubject("Ticket Status Update - " + ticket.getTicketId());
            
            String userBody = String.format(
                "Hello %s,\n\n" +
                "Your ticket status has been updated!\n\n" +
                "Ticket Details:\n" +
                "Ticket ID: %s\n" +
                "Room: %s\n" +
                "New Status: %s\n" +
                "Updated by: %s\n\n" +
                "%s",
                ticket.getUser().getName(),
                ticket.getTicketId(),
                ticket.getRoomNumber(),
                ticket.getStatus(),
                updatedBy.getName(),
                getStatusMessage(ticket.getStatus())
            );
            
            userMessage.setText(userBody);
            mailSender.send(userMessage);
            
            // If ticket is resolved, also notify admins
            if (ticket.getStatus() == com.snapfix.entity.TicketStatus.RESOLVED) {
                sendTicketResolvedNotification(ticket, updatedBy);
            }
            
        } catch (Exception e) {
            System.err.println("Failed to send email notification: " + e.getMessage());
        }
    }
    
    public void sendTicketApprovalNotification(Ticket ticket, User adminUser) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(ticket.getUser().getEmail());
            message.setSubject("Ticket Approved - " + ticket.getTicketId());
            
            String body = String.format(
                "Hello %s,\n\n" +
                "Great news! Your ticket has been approved and confirmed.\n\n" +
                "Ticket Details:\n" +
                "Ticket ID: %s\n" +
                "Room: %s\n" +
                "Category: %s\n" +
                "Status: %s\n" +
                "Approved by: %s\n\n" +
                "Your ticket is now in our system and will be assigned to our staff shortly. " +
                "You'll receive another notification once it's assigned.\n\n" +
                "Thank you for using %s!",
                ticket.getUser().getName(),
                ticket.getTicketId(),
                ticket.getRoomNumber(),
                ticket.getCategory(),
                ticket.getStatus(),
                adminUser.getName(),
                appName
            );
            
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send approval notification: " + e.getMessage());
        }
    }
    
    public void sendTicketResolvedNotification(Ticket ticket, User resolvedBy) {
        try {
            // Notify the ticket creator
            SimpleMailMessage userMessage = new SimpleMailMessage();
            userMessage.setFrom(fromEmail);
            userMessage.setTo(ticket.getUser().getEmail());
            userMessage.setSubject("Ticket Resolved - " + ticket.getTicketId());
            
            String userBody = String.format(
                "Hello %s,\n\n" +
                "Great news! Your ticket has been resolved!\n\n" +
                "Ticket Details:\n" +
                "Ticket ID: %s\n" +
                "Room: %s\n" +
                "Category: %s\n" +
                "Status: %s\n" +
                "Resolved by: %s\n" +
                "Resolved at: %s\n\n" +
                "If you have any concerns or if the issue persists, please don't hesitate to create a new ticket.\n\n" +
                "Thank you for using %s!",
                ticket.getUser().getName(),
                ticket.getTicketId(),
                ticket.getRoomNumber(),
                ticket.getCategory(),
                ticket.getStatus(),
                resolvedBy.getName(),
                ticket.getResolvedAt() != null ? ticket.getResolvedAt().toString() : "N/A",
                appName
            );
            
            userMessage.setText(userBody);
            mailSender.send(userMessage);
            
            // Notify all admins about the resolution
            List<User> admins = userRepository.findByRole(UserRole.ADMIN);
            
            for (User admin : admins) {
                if (admin.getEmail() != null && !admin.getEmail().isEmpty()) {
                    SimpleMailMessage adminMessage = new SimpleMailMessage();
                    adminMessage.setFrom(fromEmail);
                    adminMessage.setTo(admin.getEmail());
                    adminMessage.setSubject("Ticket Resolved - " + ticket.getTicketId());
                    
                    String adminBody = String.format(
                        "Hello %s,\n\n" +
                        "A ticket has been resolved by our staff.\n\n" +
                        "Ticket Details:\n" +
                        "Ticket ID: %s\n" +
                        "Reported by: %s (%s)\n" +
                        "Room: %s\n" +
                        "Category: %s\n" +
                        "Status: %s\n" +
                        "Resolved by: %s\n" +
                        "Resolved at: %s\n\n" +
                        "The ticket has been successfully closed.\n\n" +
                        "Thank you!",
                        admin.getName(),
                        ticket.getTicketId(),
                        ticket.getUser().getName(),
                        ticket.getUser().getEmail(),
                        ticket.getRoomNumber(),
                        ticket.getCategory(),
                        ticket.getStatus(),
                        resolvedBy.getName(),
                        ticket.getResolvedAt() != null ? ticket.getResolvedAt().toString() : "N/A"
                    );
                    
                    adminMessage.setText(adminBody);
                    mailSender.send(adminMessage);
                }
            }
            
        } catch (Exception e) {
            System.err.println("Failed to send resolution notification: " + e.getMessage());
        }
    }
    
    public void sendTicketAssignmentNotification(Ticket ticket, User adminUser) {
        try {
            // Notify the ticket creator
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(ticket.getUser().getEmail());
            message.setSubject("Ticket Assigned - " + ticket.getTicketId());
            
            String body = String.format(
                "Hello %s,\n\n" +
                "Your ticket has been assigned to our staff!\n\n" +
                "Ticket Details:\n" +
                "Ticket ID: %s\n" +
                "Room: %s\n" +
                "Assigned to: %s\n" +
                "Status: %s\n\n" +
                "Our staff will work on resolving your issue shortly.\n\n" +
                "Thank you for using %s!",
                ticket.getUser().getName(),
                ticket.getTicketId(),
                ticket.getRoomNumber(),
                ticket.getAssignedTo().getName(),
                ticket.getStatus(),
                appName
            );
            
            message.setText(body);
            mailSender.send(message);
            
            // Notify the assigned staff member
            if (ticket.getAssignedTo() != null) {
                SimpleMailMessage staffMessage = new SimpleMailMessage();
                staffMessage.setFrom(fromEmail);
                staffMessage.setTo(ticket.getAssignedTo().getEmail());
                staffMessage.setSubject("New Ticket Assignment - " + ticket.getTicketId());
                
                String staffBody = String.format(
                    "Hello %s,\n\n" +
                    "You have been assigned a new ticket!\n\n" +
                    "Ticket Details:\n" +
                    "Ticket ID: %s\n" +
                    "Room: %s\n" +
                    "Category: %s\n" +
                    "Priority: %s\n" +
                    "Description: %s\n" +
                    "Reported by: %s\n\n" +
                    "Please log in to the system to view more details and update the status.\n\n" +
                    "Thank you!",
                    ticket.getAssignedTo().getName(),
                    ticket.getTicketId(),
                    ticket.getRoomNumber(),
                    ticket.getCategory(),
                    ticket.getPriority(),
                    ticket.getDescription(),
                    ticket.getUser().getName()
                );
                
                staffMessage.setText(staffBody);
                mailSender.send(staffMessage);
            }
        } catch (Exception e) {
            System.err.println("Failed to send email notification: " + e.getMessage());
        }
    }
    
    private String getStatusMessage(com.snapfix.entity.TicketStatus status) {
        switch (status) {
            case IN_PROGRESS:
                return "Our staff is now working on your ticket. We'll keep you updated on the progress.";
            case RESOLVED:
                return "Great news! Your ticket has been resolved. Please let us know if you need any further assistance.";
            case CLOSED:
                return "Your ticket has been closed. If you have any concerns, please create a new ticket.";
            default:
                return "We'll update you as soon as there are any changes to your ticket.";
        }
    }
    
    public void sendRewardNotification(com.snapfix.entity.Reward reward) {
        try {
            if (reward.getUser().getEmail() != null) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true);
                
                helper.setTo(reward.getUser().getEmail());
                helper.setSubject("🎉 You've earned " + reward.getPoints() + " points!");
                
                String body = String.format(
                    "Congratulations %s!\n\n" +
                    "You have earned %d points for your contribution to SnapFix.\n\n" +
                    "Reward Details:\n" +
                    "Points: %d\n" +
                    "Reason: %s\n" +
                    "Date: %s\n\n" +
                    "Keep up the great work! You can redeem your points for exciting vouchers in the Rewards section.\n\n" +
                    "Thank you for helping make our campus better!",
                    reward.getUser().getName(),
                    reward.getPoints(),
                    reward.getPoints(),
                    reward.getTicket() != null ? "Ticket " + reward.getTicket().getTicketId() + " resolved" : "Special reward",
                    reward.getCreatedAt().toString()
                );
                
                helper.setText(body);
                mailSender.send(message);
            }
        } catch (Exception e) {
            System.err.println("Error sending reward notification email: " + e.getMessage());
        }
    }
    
    public void sendVoucherRedemptionNotification(com.snapfix.entity.VoucherRedemption redemption) {
        try {
            if (redemption.getUser().getEmail() != null) {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true);
                
                helper.setTo(redemption.getUser().getEmail());
                helper.setSubject("🎁 Your voucher is ready!");
                
                String body = String.format(
                    "Hello %s!\n\n" +
                    "Your voucher redemption was successful!\n\n" +
                    "Voucher Details:\n" +
                    "Name: %s\n" +
                    "Description: %s\n" +
                    "Discount: %s\n" +
                    "Points Used: %d\n" +
                    "Voucher Code: %s\n" +
                    "Valid Until: %s\n\n" +
                    "Please save this voucher code and present it when using your discount.\n\n" +
                    "Thank you for being a valued member of SnapFix!",
                    redemption.getUser().getName(),
                    redemption.getVoucher().getName(),
                    redemption.getVoucher().getDescription(),
                    redemption.getVoucher().getDiscount(),
                    redemption.getPointsUsed(),
                    redemption.getVoucherCode(),
                    redemption.getExpiryDate().toString()
                );
                
                helper.setText(body);
                mailSender.send(message);
            }
        } catch (Exception e) {
            System.err.println("Error sending voucher redemption notification email: " + e.getMessage());
        }
    }
}
