package com.eba.common.config;

import org.glassfish.jersey.jackson.JacksonFeature;
import org.glassfish.jersey.server.ResourceConfig;

public class PropertyManagementApplication extends ResourceConfig {
    public PropertyManagementApplication() {
        packages("com.eba");
        register(JacksonFeature.class);
        DatabaseConfig.sqlSessionFactory();
    }
}
