package com.tripmates.backend.common.service.email;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Dictionary;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;

@Service
public class EmailService {

	private final JavaMailSender mailSender;

	private final String fromEmail;

	private final String frontendRedirectionBaseUrl;

	public EmailService(JavaMailSender mailSender, @Value("${GMAIL_NAME:test_example.com}") String fromEmail,
			@Value("${FRONTEND_URL_BASE:http://localhost:5173}") String frontendRedirectionBaseUrl) {
		this.mailSender = mailSender;
		this.fromEmail = fromEmail;
		this.frontendRedirectionBaseUrl = frontendRedirectionBaseUrl;
	}

	public void sendEmail(String to, String subject, String text) {
		SimpleMailMessage message = new SimpleMailMessage();
		message.setFrom(fromEmail);
		message.setTo(to);
		message.setSubject(subject);
		message.setText(text);
		mailSender.send(message);
	}

	public void sendHtmlInvitationEmail(String to, String subject, String htmlContentFileName,
			Dictionary<String, String> variables) {
		try {
			ClassPathResource resource = new ClassPathResource(htmlContentFileName);
			String htmlTemplate = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);

			String planId = variables.get("planId");
			String toUsername = variables.get("toUsername");
			String planName = variables.get("planName");
			String ownerUsername = variables.get("ownerUsername");

			String invitationPlanUrl = frontendRedirectionBaseUrl + "/accept-invitation/" + planId;

			Map<String, String> substitutionMap = new HashMap<>();
			substitutionMap.put("toUsername", toUsername);
			substitutionMap.put("planName", planName);
			substitutionMap.put("ownerUsername", ownerUsername);
			substitutionMap.put("invitationPlanUrl", invitationPlanUrl);

			String htmlContent = htmlTemplate;
			for (Map.Entry<String, String> entry : substitutionMap.entrySet()) {
				String placeholderRegex = "\\{\\{\\s*" + Pattern.quote(entry.getKey()) + "\\s*}}";
				htmlContent = htmlContent.replaceAll(placeholderRegex, Matcher.quoteReplacement(entry.getValue()));
			}

			MimeMessage message = mailSender.createMimeMessage();
			MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

			helper.setFrom(fromEmail);
			helper.setTo(to);
			helper.setSubject(subject);
			helper.setText(htmlContent, true);

			mailSender.send(message);

		}
		catch (IOException e) {
			System.out.println("Error: No se pudo leer el archivo de plantilla HTML (" + htmlContentFileName
					+ "). Asegúrate de que existe en src/main/resources. " + e.getMessage());
		}
		catch (MessagingException e) {
			System.out.println("Error al enviar el email: " + e.getMessage());
		}
	}

	public void sendHtmlAchievementEmail(String to, String subject, String achievementName, String toUsername) {
        try {
            ClassPathResource resource = new ClassPathResource("achievement_unlocked.html");
            String htmlTemplate = StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);


			//cambiar esto
            String achievementUrl = frontendRedirectionBaseUrl + "/achievements/" + achievementName.replaceAll(" ", "-").toLowerCase();

            Map<String, String> substitutionMap = new HashMap<>();
            substitutionMap.put("toUsername", toUsername);
            substitutionMap.put("achievementName", achievementName);
            substitutionMap.put("achievementUrl", achievementUrl);

            String htmlContent = htmlTemplate;
            for (Map.Entry<String, String> entry : substitutionMap.entrySet()) {
                String placeholderRegex = "\\{\\{\\s*" + Pattern.quote(entry.getKey()) + "\\s*}}";
                htmlContent = htmlContent.replaceAll(placeholderRegex, Matcher.quoteReplacement(entry.getValue()));
            }

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);

        } catch (IOException e) {
            System.out.println("Error: No se pudo leer el archivo de plantilla HTML (achievement_unlocked.html). Asegúrate de que existe en src/main/resources. " + e.getMessage());
        } catch (MessagingException e) {
            System.out.println("Error al enviar el email: " + e.getMessage());
        }
    }
}