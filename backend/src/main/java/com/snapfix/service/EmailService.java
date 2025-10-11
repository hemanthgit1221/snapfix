package com.snapfix.service;

import com.snapfix.entity.Ticket;
import com.snapfix.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username}")
    private String fromEmail;
    
    @Value("${app.name:SnapFix}")
    private String appName;
    
    public void sendTicketCreatedNotification(Ticket ticket) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(ticket.getUser().getEmail());
            message.setSubject("Ticket Created - " + ticket.getTicketId());
            
            String body = String.format(
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
            
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            // Log error but don't throw exception to avoid breaking the main flow
            System.err.println("Failed to send email notification: " + e.getMessage());
        }
    }
    
    public void sendTicketStatusUpdateNotification(Ticket ticket, User updatedBy) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(ticket.getUser().getEmail());
            message.setSubject("Ticket Status Update - " + ticket.getTicketId());
            
            String body = String.format(
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
            
            message.setText(body);
            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("Failed to send email notification: " + e.getMessage());
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
}
