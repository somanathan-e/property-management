package com.eba.common.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.List;
import javax.sql.DataSource;
import org.apache.ibatis.builder.xml.XMLMapperBuilder;
import org.apache.ibatis.mapping.Environment;
import org.apache.ibatis.session.Configuration;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.apache.ibatis.transaction.jdbc.JdbcTransactionFactory;

public final class DatabaseConfig {
    private static final List<String> MAPPERS = List.of(
        "com/eba/property/mappers/PropertyMapper.xml",
        "com/eba/tower/mappers/TowerMapper.xml",
        "com/eba/unit/mappers/UnitMapper.xml",
        "com/eba/amenity/mappers/AmenityMapper.xml",
        "com/eba/customer/mappers/CustomerMapper.xml",
        "com/eba/contact/mappers/ContactMapper.xml",
        "com/eba/lease/mappers/LeaseMapper.xml",
        "com/eba/reservation/mappers/ReservationMapper.xml",
        "com/eba/tenant/mappers/TenantMapper.xml",
        "com/eba/asset/mappers/AssetMapper.xml",
        "com/eba/lead/mappers/LeadMapper.xml",
        "com/eba/opportunity/mappers/OpportunityMapper.xml",
        "com/eba/prospect/mappers/ProspectMapper.xml",
        "com/eba/dashboard/mappers/DashboardMapper.xml",
        "com/eba/auth/mappers/AuthMapper.xml"
    );

    private static final HikariDataSource DATA_SOURCE = createDataSource();
    private static final SqlSessionFactory SQL_SESSION_FACTORY = createSqlSessionFactory(DATA_SOURCE);

    static {
        initializeSchema(DATA_SOURCE);
    }

    private DatabaseConfig() {
    }

    public static SqlSessionFactory sqlSessionFactory() {
        return SQL_SESSION_FACTORY;
    }

    private static HikariDataSource createDataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(System.getenv().getOrDefault("JDBC_URL", "jdbc:h2:mem:property_management;MODE=MySQL;DB_CLOSE_DELAY=-1"));
        config.setUsername(System.getenv().getOrDefault("JDBC_USER", "sa"));
        config.setPassword(System.getenv().getOrDefault("JDBC_PASSWORD", ""));
        config.setMaximumPoolSize(5);
        config.setPoolName("property-management-pool");
        return new HikariDataSource(config);
    }

    private static SqlSessionFactory createSqlSessionFactory(DataSource dataSource) {
        Configuration configuration = new Configuration();
        configuration.setMapUnderscoreToCamelCase(true);
        configuration.setEnvironment(new Environment("development", new JdbcTransactionFactory(), dataSource));
        configuration.addMapper(com.eba.property.mappers.PropertyMapper.class);
        configuration.addMapper(com.eba.tower.mappers.TowerMapper.class);
        configuration.addMapper(com.eba.unit.mappers.UnitMapper.class);
        configuration.addMapper(com.eba.amenity.mappers.AmenityMapper.class);
        configuration.addMapper(com.eba.customer.mappers.CustomerMapper.class);
        configuration.addMapper(com.eba.contact.mappers.ContactMapper.class);
        configuration.addMapper(com.eba.lease.mappers.LeaseMapper.class);
        configuration.addMapper(com.eba.reservation.mappers.ReservationMapper.class);
        configuration.addMapper(com.eba.tenant.mappers.TenantMapper.class);
        configuration.addMapper(com.eba.asset.mappers.AssetMapper.class);
        configuration.addMapper(com.eba.lead.mappers.LeadMapper.class);
        configuration.addMapper(com.eba.opportunity.mappers.OpportunityMapper.class);
        configuration.addMapper(com.eba.prospect.mappers.ProspectMapper.class);
        configuration.addMapper(com.eba.dashboard.mappers.DashboardMapper.class);
        configuration.addMapper(com.eba.auth.mappers.AuthMapper.class);

        for (String resource : MAPPERS) {
            try (InputStream inputStream = DatabaseConfig.class.getClassLoader().getResourceAsStream(resource)) {
                if (inputStream == null) {
                    throw new IllegalStateException("Missing mapper resource: " + resource);
                }
                XMLMapperBuilder mapperBuilder = new XMLMapperBuilder(inputStream, configuration, resource, configuration.getSqlFragments());
                mapperBuilder.parse();
            } catch (IOException exception) {
                throw new IllegalStateException("Failed to load mapper resource " + resource, exception);
            }
        }

        return new SqlSessionFactoryBuilder().build(configuration);
    }

    private static void initializeSchema(DataSource dataSource) {
        try (Connection connection = dataSource.getConnection(); Statement statement = connection.createStatement()) {
            String sql = loadResource("db/schema.sql");
            for (String command : sql.split(";")) {
                String trimmed = command.trim();
                if (!trimmed.isEmpty()) {
                    statement.execute(trimmed);
                }
            }
        } catch (SQLException exception) {
            throw new IllegalStateException("Failed to initialize database schema", exception);
        }
    }

    private static String loadResource(String resource) {
        try (InputStream inputStream = DatabaseConfig.class.getClassLoader().getResourceAsStream(resource)) {
            if (inputStream == null) {
                throw new IllegalStateException("Missing resource: " + resource);
            }
            return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException exception) {
            throw new IllegalStateException("Failed to read resource: " + resource, exception);
        }
    }
}
