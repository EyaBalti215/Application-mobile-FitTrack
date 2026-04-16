package com.fittrack.service;

import com.fittrack.model.OtpType;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.MailException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class EmailService {
  private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

  private final JavaMailSender mailSender;
  private final String sender;
  private final boolean failOnError;
  private final String smtpUsername;
  private final String smtpPassword;
  private final boolean smtpAuthEnabled;
  private final AtomicBoolean missingSmtpConfigLogged = new AtomicBoolean(false);

  public EmailService(
      JavaMailSender mailSender,
      @Value("${app.otp.sender}") String sender,
      @Value("${app.mail.fail-on-error:false}") boolean failOnError,
      @Value("${spring.mail.username:}") String smtpUsername,
      @Value("${spring.mail.password:}") String smtpPassword,
      @Value("${spring.mail.properties.mail.smtp.auth:false}") boolean smtpAuthEnabled) {
    this.mailSender = mailSender;
    this.sender = sender;
    this.failOnError = failOnError;
    this.smtpUsername = smtpUsername;
    this.smtpPassword = smtpPassword;
    this.smtpAuthEnabled = smtpAuthEnabled;
  }

  public boolean sendOtp(String email, String code, OtpType type) {
    String subject = type == OtpType.LOGIN ? "FitTrack login code" : "FitTrack password reset";
    String body = "Your verification code is: " + code;

    return sendEmail(email, subject, body);
  }

  public boolean sendPasswordResetLink(String email, String code, String resetLink) {
    String subject = "FitTrack password reset";
    String body = "Your password reset code is: " + code
        + "\n\n"
        + "You can also reset with this link: " + resetLink;

    return sendEmail(email, subject, body);
  }

  private boolean sendEmail(String email, String subject, String body) {
    if (smtpAuthEnabled && (!StringUtils.hasText(smtpUsername) || !StringUtils.hasText(smtpPassword))) {
      if (missingSmtpConfigLogged.compareAndSet(false, true)) {
        logger.info("SMTP auth is enabled but MAIL_USERNAME/MAIL_PASSWORD are empty; skipping email delivery.");
      }
      return false;
    }

    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(sender);
    message.setTo(email);
    message.setSubject(subject);
    message.setText(body);

    try {
      mailSender.send(message);
      return true;
    } catch (MailException ex) {
      String msg = String.format(
          "Email delivery failed for %s: %s (check MAIL_HOST/MAIL_PORT/MAIL_USERNAME/MAIL_PASSWORD)",
          email,
          ex.getMessage());
      if (failOnError) {
        logger.warn(msg);
      } else {
        logger.info(msg);
      }
      if (failOnError) {
        throw ex;
      }
      return false;
    }
  }
}
