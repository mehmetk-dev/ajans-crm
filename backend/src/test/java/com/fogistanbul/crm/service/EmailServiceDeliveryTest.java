package com.fogistanbul.crm.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import ch.qos.logback.classic.Level;
import ch.qos.logback.classic.Logger;
import ch.qos.logback.core.read.ListAppender;
import jakarta.mail.MessagingException;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

class EmailServiceDeliveryTest {

    @Test
    void notificationEmailDoesNotLogAnErrorWhenMailIsDisabled() {
        MailSettingsService mailSettingsService = mock(MailSettingsService.class);
        when(mailSettingsService.loadEffectiveSettings()).thenReturn(settings(false, 2525));
        EmailService emailService = new EmailService(mailSettingsService);
        Logger logger = (Logger) LoggerFactory.getLogger(EmailService.class);
        ListAppender<ch.qos.logback.classic.spi.ILoggingEvent> appender = new ListAppender<>();
        appender.start();
        logger.addAppender(appender);

        try {
            emailService.sendEmail("user@example.com", "Bildirim", "<p>Test</p>");

            assertThat(appender.list)
                    .noneMatch(event -> event.getLevel() == Level.ERROR);
        } finally {
            logger.detachAppender(appender);
        }
    }

    @Test
    void sendTestEmailDoesNotContactSmtpWhenMailIsDisabled() {
        MailSettingsService mailSettingsService = mock(MailSettingsService.class);
        when(mailSettingsService.loadEffectiveSettings()).thenReturn(settings(false, 2525));
        EmailService emailService = new EmailService(mailSettingsService);

        assertThatThrownBy(() -> emailService.sendTestEmail("user@example.com"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Mail sistemi pasif");
    }

    @Test
    void sendTestEmailDeliversToConfiguredSmtpServerWhenMailIsEnabled() throws Exception {
        try (FakeSmtpServer smtpServer = FakeSmtpServer.start()) {
            MailSettingsService mailSettingsService = mock(MailSettingsService.class);
            when(mailSettingsService.loadEffectiveSettings()).thenReturn(settings(true, smtpServer.port()));
            EmailService emailService = new EmailService(mailSettingsService);

            emailService.sendTestEmail("recipient@example.com");

            assertThat(smtpServer.awaitMessage()).isTrue();
            assertThat(smtpServer.commands())
                    .contains("MAIL FROM:<noreply@example.com>")
                    .contains("RCPT TO:<recipient@example.com>");
            assertThat(smtpServer.data()).contains("Subject: CRM SMTP Test");
        }
    }

    private MailSettingsService.EffectiveMailSettings settings(boolean enabled, int port) {
        return new MailSettingsService.EffectiveMailSettings(
                enabled,
                "127.0.0.1",
                port,
                null,
                null,
                "noreply@example.com",
                false,
                false
        );
    }

    private static final class FakeSmtpServer implements AutoCloseable {
        private final ServerSocket serverSocket;
        private final CountDownLatch messageReceived = new CountDownLatch(1);
        private final StringBuilder commands = new StringBuilder();
        private final StringBuilder data = new StringBuilder();
        private final Thread thread;

        private FakeSmtpServer(ServerSocket serverSocket) {
            this.serverSocket = serverSocket;
            this.thread = new Thread(this::serve, "fake-smtp-server");
            this.thread.start();
        }

        static FakeSmtpServer start() throws IOException {
            return new FakeSmtpServer(new ServerSocket(0));
        }

        int port() {
            return serverSocket.getLocalPort();
        }

        boolean awaitMessage() throws InterruptedException {
            return messageReceived.await(3, TimeUnit.SECONDS);
        }

        String commands() {
            return commands.toString();
        }

        String data() {
            return data.toString();
        }

        private void serve() {
            try (
                    Socket socket = serverSocket.accept();
                    BufferedReader reader = new BufferedReader(new InputStreamReader(
                            socket.getInputStream(),
                            StandardCharsets.ISO_8859_1
                    ));
                    PrintWriter writer = new PrintWriter(new OutputStreamWriter(
                            socket.getOutputStream(),
                            StandardCharsets.ISO_8859_1
                    ), true)
            ) {
                send(writer, "220 localhost");

                String line;
                while ((line = reader.readLine()) != null) {
                    commands.append(line).append('\n');

                    if (line.startsWith("EHLO") || line.startsWith("HELO")) {
                        send(writer, "250-localhost");
                        send(writer, "250 8BITMIME");
                    } else if (line.startsWith("MAIL FROM") || line.startsWith("RCPT TO")) {
                        send(writer, "250 OK");
                    } else if (line.equals("DATA")) {
                        send(writer, "354 End data with <CR><LF>.<CR><LF>");
                        readData(reader);
                        send(writer, "250 OK");
                        messageReceived.countDown();
                    } else if (line.equals("QUIT")) {
                        send(writer, "221 Bye");
                        return;
                    } else {
                        send(writer, "250 OK");
                    }
                }
            } catch (IOException ignored) {
                messageReceived.countDown();
            }
        }

        private void readData(BufferedReader reader) throws IOException {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.equals(".")) {
                    return;
                }
                data.append(line).append('\n');
            }
        }

        private void send(PrintWriter writer, String line) {
            writer.print(line + "\r\n");
            writer.flush();
        }

        @Override
        public void close() throws IOException {
            serverSocket.close();
        }
    }
}
