# CoreConnect Technical Stack

## Project Info

| Key | Value |
|------|------|
| Group ID | `com.eba` |
| Artifact ID | `coreConnect` |
| Version | `2023.02.07-SNAPSHOT` |
| Packaging | `WAR` |
| Java | `17` |
| Organization | `EBA Connect` |

---

# Architecture

- Backend: Jakarta EE 10
- Frontend: Next.js
- Build Tool: Maven
- Database: MySQL(UserName : root, Password: Password1)
- API Style: SOAP / JAX-WS
- Deployment: WAR based application

---

# Core Technologies

## Backend

| Technology | Version |
|---|---|
| Jakarta EE API | `10.0.0` |
| Java | `17` |

## Frontend

| Technology |
|---|
| Next.js |

---

# API & Integration

| Technology | Version |
|---|---|
| Apache CXF | `4.1.0` |
| CXF CDI Integration | `4.1.0` |
| CXF JAX-WS Frontend | `4.1.0` |
| CXF HTTP Transport | `4.1.0` |
| CXF WS-Security | `4.1.0` |

---

# Database & Persistence

| Technology | Version |
|---|---|
| MyBatis | `3.5.19` |
| MyBatis CDI | `2.0.2` |
| MySQL Connector/J | `9.2.0` |
| HikariCP | `6.3.0` |

---

# Messaging & Scheduling

| Technology | Version |
|---|---|
| ActiveMQ | `6.1.4` |
| Quartz Scheduler | `2.5.0` |

---

# Search & Document Processing

| Technology | Version |
|---|---|
| Apache SolrJ | `9.8.1` |
| Apache Tika | `2.9.2` |
| Zip4j | `2.11.5` |

---

# Reporting & PDF

| Technology | Version |
|---|---|
| JasperReports | `7.0.0` |
| iText PDF | `5.5.13.4` |
| OpenPDF | `1.3.40` |

---

# File Processing

| Technology | Version |
|---|---|
| OpenCSV | `5.10` |
| JXLS Reader | `2.1.0` |
| JXLS POI | `3.0.0` |

---

# Cloud Services

| Technology | Version |
|---|---|
| AWS S3 SDK | `1.12.782` |

---

# Validation & Utilities

| Technology | Version |
|---|---|
| Hibernate Validator | `8.0.2.Final` |
| MapStruct | `1.6.3` |
| Gson | `2.12.1` |
| Commons Lang | `3.17.0` |
| Joda-Time | `2.13.1` |
| ICU4J | `77.1` |

---

# Security

| Technology | Version |
|---|---|
| Jasypt | `1.9.3` |
| CXF WS-Security | `4.1.0` |

---

# Logging

| Technology | Version |
|---|---|
| Log4j | `3.0.0-alpha1` |
| SLF4J | `2.1.0-alpha1` |

---

# Build Plugins

| Plugin | Version |
|---|---|
| Maven Compiler Plugin | `3.14.0` |
| Maven WAR Plugin | `3.4.0` |
| Maven Assembly Plugin | `3.7.1` |
| Maven Deploy Plugin | `4.0.0-beta-2` |
| Maven Release Plugin | `3.1.1` |

---

# Build Configuration

| Setting | Value |
|---|---|
| Final WAR Name | `coreConnect` |
| Compiler Source | `17` |
| Compiler Target | `17` |
| Development Mode | `true` |

---

# Maven Profiles

| Profile | Purpose |
|---|---|
| `apache` | Production assembly profile |

---

# Important Notes

- Several dependencies use `provided` scope.
- Runtime container supplies Jakarta EE and related libraries.
- SOAP services are implemented using Apache CXF.
- Reports are compiled from `.jrxml` to `.jasper`.
- Connection pooling handled by HikariCP.
- WAR deployment architecture.