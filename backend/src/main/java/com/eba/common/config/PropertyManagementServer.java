package com.eba.common.config;

import java.io.IOException;
import java.net.URI;
import java.util.concurrent.CountDownLatch;
import org.glassfish.grizzly.http.server.HttpServer;
import org.glassfish.jersey.grizzly2.httpserver.GrizzlyHttpServerFactory;

public final class PropertyManagementServer {
    private PropertyManagementServer() {
    }

    public static void main(String[] args) throws IOException {
        HttpServer server = GrizzlyHttpServerFactory.createHttpServer(
            URI.create("http://0.0.0.0:8080/property-management/api/v1/"),
            new PropertyManagementApplication()
        );

        Runtime.getRuntime().addShutdownHook(new Thread(server::shutdownNow));
        System.out.println("Property Management backend started at http://0.0.0.0:8080/property-management/api/v1");
        try {
            new CountDownLatch(1).await();
        } catch (InterruptedException interruptedException) {
            Thread.currentThread().interrupt();
        }
        server.shutdownNow();
    }
}
