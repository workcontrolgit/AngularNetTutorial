# Duende IdentityServer AdminUI

A comprehensive identity and access management solution built on **Duende IdentityServer v7** with administrative UI for managing OAuth2/OpenID Connect clients, users, and configuration.

## Overview

This project provides a complete identity management platform featuring:

- **OAuth2/OpenID Connect Provider** - Secure token service and authentication
- **Administrative Web Interface** - User-friendly UI for managing identities and clients
- **REST API** - Programmatic access to administrative functions
- **Multi-database Support** - SQL Server, PostgreSQL, and MySQL
- **Container-ready** - Docker compose setup for easy deployment
- **Audit Logging** - Comprehensive activity tracking
- **Multi-tenant Ready** - Configurable for various deployment scenarios

## Architecture

### Components

| Component | Description | Port |
|-----------|-------------|------|
| **Duende.STS.Identity** | Security Token Service and Identity Provider | 44310 |
| **Duende.Admin** | Administrative Web Interface | 44303 |
| **Duende.Admin.Api** | Administrative REST API | 44302 |
| **Database** | SQL Server/PostgreSQL/MySQL backend | 7900 |
| **Nginx** | Reverse proxy for containerized setup | 80/443 |

### Database Contexts

- **IdentityServerConfigurationDbContext** - Client and resource configuration
- **IdentityServerPersistedGrantDbContext** - Grants, codes, and tokens
- **AdminIdentityDbContext** - ASP.NET Core Identity users and roles
- **AdminAuditLogDbContext** - Audit trail and activity logging
- **AdminLogDbContext** - Application logging
- **DataProtectionDbContext** - ASP.NET Core Data Protection keys

## Quick Start

### Prerequisites

- .NET 8.0 SDK
- SQL Server LocalDB (or Docker)
- Visual Studio 2022 or VS Code
- Node.js (for frontend assets)

### Development Setup

1. **Clone and Navigate**
   ```bash
   git clone <repository>
   cd Duende
   ```

2. **Restore Dependencies**
   ```bash
   dotnet restore
   npm install
   ```

3. **Database Setup**
   ```bash
   # Apply migrations and seed data
   dotnet run --project src/Duende.Admin -- /seed
   ```

4. **Run Applications**
   ```bash
   # Terminal 1 - Identity Server
   dotnet run --project src/Duende.STS.Identity

   # Terminal 2 - Admin UI
   dotnet run --project src/Duende.Admin

   # Terminal 3 - Admin API (optional)
   dotnet run --project src/Duende.Admin.Api
   ```

5. **Access Applications**
   - **Admin UI**: https://localhost:44303
   - **Identity Server**: https://localhost:44310
   - **Admin API**: https://localhost:44302 (Swagger UI available)

### Docker Setup

1. **Start with Docker Compose**
   ```bash
   docker-compose up -d
   ```

2. **Access via Local Domains**
   Add to your hosts file:
   ```
   127.0.0.1 sts.skoruba.local
   127.0.0.1 admin.skoruba.local
   127.0.0.1 admin-api.skoruba.local
   ```

3. **URLs**
   - **Admin UI**: https://admin.skoruba.local
   - **Identity Server**: https://sts.skoruba.local
   - **Admin API**: https://admin-api.skoruba.local

## Configuration

### Database Providers

Switch database providers by updating `DatabaseProviderConfiguration.ProviderType` in `appsettings.json`:

- `SqlServer` (default)
- `PostgreSQL` 
- `MySql`

### Connection Strings

Update connection strings in `appsettings.json` or environment variables:

```json
{
  "ConnectionStrings": {
    "ConfigurationDbConnection": "Server=(localdb)\\mssqllocaldb;Database=IdentityServerAdminDB7Master;...",
    "PersistedGrantDbConnection": "...",
    "IdentityDbConnection": "...",
    "AdminLogDbConnection": "...",
    "AdminAuditLogDbConnection": "...",
    "DataProtectionDbConnection": "..."
  }
}
```

### Client Configuration

Configure OIDC client settings in `AdminConfiguration` section:

```json
{
  "AdminConfiguration": {
    "IdentityServerBaseUrl": "https://localhost:44310",
    "IdentityAdminRedirectUri": "https://localhost:44303/signin-oidc",
    "ClientId": "MyClientId",
    "ClientSecret": "MyClientSecret",
    "AdministrationRole": "MyRole"
  }
}
```


## Development Workflow

### Adding New Features

1. **Update Entity Models** in `Duende.Admin.EntityFramework.Shared`
2. **Add Migrations** for each affected context
3. **Update DTOs** in `Duende.Shared`
4. **Implement Services** in respective projects
5. **Add Controllers/Views** in Admin or API projects
6. **Update Configuration** if needed

### Testing

```bash
# Run unit tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"
```

### Code Quality

```bash
# Format code
dotnet format

# Analyze code
dotnet build --verbosity normal
```

## Security Features

- **OAuth2/OpenID Connect** compliant
- **JWT Token** validation
- **PKCE** support
- **Mutual TLS** ready
- **Content Security Policy** configured
- **Audit logging** for all administrative actions
- **Role-based access control**

## Production Considerations

### Environment Variables

Set these for production deployment:

```bash
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__ConfigurationDbConnection=<production-db>
AdminConfiguration__IdentityServerBaseUrl=<production-sts-url>
AdminConfiguration__RequireHttpsMetadata=true
```

### SSL/TLS

- Configure proper certificates
- Enable HTTPS redirection
- Set `RequireHttpsMetadata=true`

### Database

- Use connection pooling
- Configure proper backup strategies
- Monitor performance

### Logging

- Configure structured logging with Serilog
- Set up centralized log aggregation
- Monitor audit logs

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify connection strings
   - Check database server status
   - Ensure migrations are applied

2. **Authentication Failures**
   - Verify client configuration
   - Check redirect URIs
   - Validate certificates

3. **Docker Issues**
   - Check container logs: `docker-compose logs`
   - Verify network connectivity
   - Ensure proper host file entries

### Logs Location

- **Development**: `src/*/Log/` directories
- **Docker**: Container logs via `docker-compose logs`
- **Database**: Check `AdminLogDbConnection` tables

## License

This project is based on Duende IdentityServer and follows its licensing terms.
