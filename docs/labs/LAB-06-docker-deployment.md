# LAB-06: Docker Containerization

## 🎯 Objective

Learn how to **containerize all three CAT Pattern components** (Angular Client, .NET API, IdentityServer) using Docker and Docker Compose. This lab demonstrates production-ready containerization with multi-stage builds, networking, and orchestration.

---

## 📋 Prerequisites

**Completed:**
- ✅ [LAB-01: Verify Setup](LAB-01-verify-setup.md)
- ✅ [LAB-02: Inspect JWT Tokens](LAB-02-inspect-tokens.md)
- ✅ [LAB-03: Extend API](LAB-03-extend-api.md)
- ✅ [LAB-04: Build Angular Component](LAB-04-build-component.md)
- ✅ [LAB-05: Write Unit Tests](LAB-05-write-tests.md)

**Required Tools:**
- **Docker Desktop** — [Download](https://www.docker.com/products/docker-desktop/)
- **Docker Compose** — Included with Docker Desktop

**Time Required:** 60-75 minutes

---

## 🐳 Why Docker?

**Benefits:**
✅ **Consistent Environments** — Dev, staging, production use identical containers
✅ **Easy Deployment** — Single command deploys entire stack
✅ **Isolation** — Each service runs in its own container
✅ **Scalability** — Scale services independently
✅ **Version Control** — Infrastructure as code with Dockerfiles

---

## 🚀 Part 1: Containerize Angular Client

### Step 1: Create Angular Dockerfile

Create file: `Clients/TalentManagement-Angular-Material/talent-management/Dockerfile`

```dockerfile
# Stage 1: Build Angular application
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (npm ci for clean install)
RUN npm ci

# Copy source code
COPY . .

# Build application for production
RUN npm run build -- --configuration production

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built application to nginx
COPY --from=build /app/dist/talent-management /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

### Step 2: Create Nginx Configuration

Create file: `Clients/TalentManagement-Angular-Material/talent-management/nginx.conf`

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Angular routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Cache static assets (js, css, images)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Don't cache index.html
    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        expires 0;
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

### Step 3: Create .dockerignore

Create file: `Clients/TalentManagement-Angular-Material/talent-management/.dockerignore`

```
node_modules
dist
.angular
.vscode
.git
*.md
.editorconfig
.gitignore
```

### Step 4: Build and Test Angular Image

```bash
cd Clients/TalentManagement-Angular-Material/talent-management

# Build Docker image
docker build -t talentmanagement-angular:latest .

# Run container
docker run -d -p 4200:80 --name angular-client talentmanagement-angular:latest

# Verify running
docker ps

# Test in browser
# Open: http://localhost:4200
```

### Step 5: Stop and Remove Test Container

```bash
docker stop angular-client
docker rm angular-client
```

---

## 🚀 Part 2: Containerize .NET API

### Step 6: Create API Dockerfile

Create file: `ApiResources/TalentManagement-API/Dockerfile`

```dockerfile
# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

# Copy solution file if exists
COPY ["TalentManagement.sln", "./"]

# Copy project files for restore
COPY ["TalentManagementAPI.Domain/TalentManagementAPI.Domain.csproj", "TalentManagementAPI.Domain/"]
COPY ["TalentManagementAPI.Application/TalentManagementAPI.Application.csproj", "TalentManagementAPI.Application/"]
COPY ["TalentManagementAPI.Infrastructure.Persistence/TalentManagementAPI.Infrastructure.Persistence.csproj", "TalentManagementAPI.Infrastructure.Persistence/"]
COPY ["TalentManagementAPI.Infrastructure.Shared/TalentManagementAPI.Infrastructure.Shared.csproj", "TalentManagementAPI.Infrastructure.Shared/"]
COPY ["TalentManagementAPI.WebApi/TalentManagementAPI.WebApi.csproj", "TalentManagementAPI.WebApi/"]

# Restore dependencies
RUN dotnet restore "TalentManagementAPI.WebApi/TalentManagementAPI.WebApi.csproj"

# Copy all source code
COPY . .

# Build
WORKDIR "/src/TalentManagementAPI.WebApi"
RUN dotnet build "TalentManagementAPI.WebApi.csproj" -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "TalentManagementAPI.WebApi.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /app

# Copy published files
COPY --from=publish /app/publish .

# Expose ports
EXPOSE 80
EXPOSE 443

# Set environment
ENV ASPNETCORE_URLS=http://+:80

# Start application
ENTRYPOINT ["dotnet", "TalentManagementAPI.WebApi.dll"]
```

### Step 7: Create API .dockerignore

Create file: `ApiResources/TalentManagement-API/.dockerignore`

```
**/bin
**/obj
**/.vs
**/.vscode
**/*.user
**/.git
**/node_modules
**/appsettings.Development.json
**/Logs
```

### Step 8: Build and Test API Image

```bash
cd ApiResources/TalentManagement-API

# Build Docker image
docker build -t talentmanagement-api:latest .

# Run container (without database for now)
docker run -d -p 5001:80 --name api-test talentmanagement-api:latest

# Check logs
docker logs api-test

# Stop and remove
docker stop api-test
docker rm api-test
```

---

## 🚀 Part 3: Containerize IdentityServer

### Step 9: Create IdentityServer Dockerfile

Create file: `TokenService/Duende-IdentityServer/Dockerfile`

```dockerfile
# Stage 1: Build
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

# Copy project files
COPY ["src/Duende.STS.Identity/Duende.STS.Identity.csproj", "src/Duende.STS.Identity/"]
COPY ["src/Duende.Admin/Duende.Admin.csproj", "src/Duende.Admin/"]
COPY ["src/Duende.Admin.Api/Duende.Admin.Api.csproj", "src/Duende.Admin.Api/"]

# Restore dependencies
RUN dotnet restore "src/Duende.STS.Identity/Duende.STS.Identity.csproj"

# Copy all source
COPY . .

# Build
WORKDIR "/src/src/Duende.STS.Identity"
RUN dotnet build "Duende.STS.Identity.csproj" -c Release -o /app/build

# Stage 2: Publish
FROM build AS publish
RUN dotnet publish "Duende.STS.Identity.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /app

# Copy published files
COPY --from=publish /app/publish .

# Expose ports
EXPOSE 80
EXPOSE 443

# Set environment
ENV ASPNETCORE_URLS=http://+:80

# Start application
ENTRYPOINT ["dotnet", "Duende.STS.Identity.dll"]
```

### Step 10: Create IdentityServer .dockerignore

Create file: `TokenService/Duende-IdentityServer/.dockerignore`

```
**/bin
**/obj
**/.vs
**/.vscode
**/*.user
**/.git
**/Logs
```

---

## 🚀 Part 4: Orchestrate with Docker Compose

### Step 11: Create Docker Compose File

Create file in root: `docker-compose.yml`

```yaml
version: '3.8'

services:
  # SQL Server Database
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: talentmanagement-sqlserver
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrong@Password123
      - MSSQL_PID=Developer
    ports:
      - "1433:1433"
    volumes:
      - sqlserver-data:/var/opt/mssql
    networks:
      - talentmanagement-network
    healthcheck:
      test: /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "YourStrong@Password123" -Q "SELECT 1"
      interval: 10s
      timeout: 3s
      retries: 10
      start_period: 40s

  # IdentityServer
  identityserver:
    build:
      context: ./TokenService/Duende-IdentityServer
      dockerfile: Dockerfile
    container_name: talentmanagement-identityserver
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ASPNETCORE_URLS=http://+:80
      - ConnectionStrings__DefaultConnection=Server=sqlserver;Database=IdentityServerDb;User Id=sa;Password=YourStrong@Password123;TrustServerCertificate=True;Encrypt=False
    ports:
      - "44310:80"
    depends_on:
      sqlserver:
        condition: service_healthy
    networks:
      - talentmanagement-network
    restart: unless-stopped

  # Web API
  api:
    build:
      context: ./ApiResources/TalentManagement-API
      dockerfile: Dockerfile
    container_name: talentmanagement-api
    environment:
      - ASPNETCORE_ENVIRONMENT=Development
      - ASPNETCORE_URLS=http://+:80
      - ConnectionStrings__DefaultConnection=Server=sqlserver;Database=TalentManagementDb;User Id=sa;Password=YourStrong@Password123;TrustServerCertificate=True;Encrypt=False
      - IdentityServer__Authority=http://identityserver:80
      - IdentityServer__RequireHttpsMetadata=false
    ports:
      - "44378:80"
    depends_on:
      - sqlserver
      - identityserver
    networks:
      - talentmanagement-network
    restart: unless-stopped

  # Angular Client
  angular:
    build:
      context: ./Clients/TalentManagement-Angular-Material/talent-management
      dockerfile: Dockerfile
    container_name: talentmanagement-angular
    ports:
      - "4200:80"
    depends_on:
      - api
      - identityserver
    networks:
      - talentmanagement-network
    restart: unless-stopped

networks:
  talentmanagement-network:
    driver: bridge

volumes:
  sqlserver-data:
```

### Step 12: Update Angular Environment for Docker

Update: `Clients/TalentManagement-Angular-Material/talent-management/src/environments/environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'http://localhost:44378/api/v1',
  identityServerUrl: 'http://localhost:44310',
  clientId: 'TalentManagement',
  scope: 'openid profile email roles app.api.talentmanagement.read app.api.talentmanagement.write',
  responseType: 'code',
  silentRenew: true,
  useRefreshToken: true,
  logLevel: 0
};
```

### Step 13: Start All Services with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

**Expected Output:**
```
[+] Building 245.3s (52/52) FINISHED
[+] Running 5/5
 ✔ Network talentmanagement-network        Created
 ✔ Container talentmanagement-sqlserver    Started
 ✔ Container talentmanagement-identityserver Started
 ✔ Container talentmanagement-api          Started
 ✔ Container talentmanagement-angular      Started
```

### Step 14: Verify All Services Running

```bash
# Check running containers
docker-compose ps

# View logs for all services
docker-compose logs

# View logs for specific service
docker-compose logs angular
docker-compose logs api
docker-compose logs identityserver

# Follow logs in real-time
docker-compose logs -f
```

### Step 15: Test Containerized Application

**URLs to Test:**
- **Angular:** http://localhost:4200
- **API Swagger:** http://localhost:44378/swagger
- **IdentityServer:** http://localhost:44310

**Test Flow:**
1. Open http://localhost:4200
2. Click "Login"
3. Login with: `ashtyn1` / `Pa$$word123`
4. Verify dashboard loads
5. Test CRUD operations

---

## 🔍 Docker Commands Reference

### Managing Containers

```bash
# Start services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v

# Restart specific service
docker-compose restart api

# Rebuild specific service
docker-compose up -d --build api
```

### Viewing Logs

```bash
# All service logs
docker-compose logs

# Specific service
docker-compose logs api

# Follow logs (real-time)
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail=100

# With timestamps
docker-compose logs -t
```

### Executing Commands in Containers

```bash
# Execute shell in running container
docker exec -it talentmanagement-api /bin/bash

# Run EF migrations in API container
docker exec talentmanagement-api dotnet ef database update

# Check API health
docker exec talentmanagement-api curl http://localhost:80/health
```

### Inspecting Containers

```bash
# View container details
docker inspect talentmanagement-api

# View container stats (CPU, memory)
docker stats

# View specific stats
docker stats talentmanagement-api
```

### Cleaning Up

```bash
# Stop all containers
docker-compose down

# Remove all containers and volumes
docker-compose down -v

# Remove unused images
docker image prune -a

# Remove all stopped containers
docker container prune

# Full system cleanup
docker system prune -a --volumes
```

---

## ✅ Verification Checklist

### Docker Images Built
- [ ] `talentmanagement-angular:latest` exists
- [ ] `talentmanagement-api:latest` exists
- [ ] `talentmanagement-identityserver:latest` exists
- [ ] SQL Server image pulled

### Containers Running
- [ ] `docker-compose ps` shows all services "Up"
- [ ] No restart loops (check with `docker-compose ps`)
- [ ] SQL Server health check passes

### Services Accessible
- [ ] Angular loads at http://localhost:4200
- [ ] API Swagger loads at http://localhost:44378/swagger
- [ ] IdentityServer loads at http://localhost:44310

### Functionality Works
- [ ] Can login via IdentityServer
- [ ] Dashboard loads after login
- [ ] API calls return data
- [ ] CRUD operations work

### Logs Clean
- [ ] No critical errors in `docker-compose logs`
- [ ] SQL Server connection successful
- [ ] IdentityServer database migrations applied
- [ ] API database migrations applied

---

## 🚨 Troubleshooting

### Issue: SQL Server Container Won't Start

**Symptoms:** Container exits immediately

**Solutions:**
```bash
# Check logs
docker-compose logs sqlserver

# Ensure password meets requirements
# Must contain: uppercase, lowercase, number, special char
# Minimum 8 characters

# Increase memory for Docker Desktop
# Docker Desktop → Settings → Resources → Memory (min 4GB)
```

### Issue: API Can't Connect to SQL Server

**Symptoms:** "Cannot open database" error

**Solutions:**
```bash
# Check SQL Server is healthy
docker-compose ps

# Wait for health check to pass (up to 40s)

# Check connection string
docker exec talentmanagement-api printenv ConnectionStrings__DefaultConnection

# Manually run migrations
docker exec talentmanagement-api dotnet ef database update
```

### Issue: IdentityServer Discovery Fails

**Symptoms:** Angular shows "invalid_issuer" error

**Solutions:**
1. Ensure IdentityServer is running:
   ```bash
   docker-compose logs identityserver
   ```

2. Check IdentityServer URL from Angular container:
   ```bash
   docker exec talentmanagement-angular wget -O- http://identityserver:80/.well-known/openid-configuration
   ```

3. Verify `environment.prod.ts` uses correct URL

### Issue: Angular Can't Reach API

**Symptoms:** API calls fail with CORS errors

**Solutions:**
1. Check API is running:
   ```bash
   docker-compose ps api
   ```

2. Test API from Angular container:
   ```bash
   docker exec talentmanagement-angular wget -O- http://api:80/api/v1/employees
   ```

3. Verify CORS configuration in API

### Issue: Port Already in Use

**Symptoms:** "Bind for 0.0.0.0:4200 failed: port is already allocated"

**Solutions:**
```bash
# Find process using port
# Windows:
netstat -ano | findstr :4200

# Linux/Mac:
lsof -i :4200

# Kill process or change port in docker-compose.yml
ports:
  - "4201:80"  # Use different host port
```

### Issue: Container Builds Slowly

**Solutions:**
```bash
# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1

# Build with no cache (if stale cache)
docker-compose build --no-cache

# Optimize .dockerignore files
# Exclude node_modules, bin, obj folders
```

---

## 🎓 Key Concepts Learned

### Multi-Stage Builds

**Why?** Smaller final images, faster deploys

```dockerfile
# Build stage (large, has SDKs)
FROM node:20-alpine AS build
RUN npm run build

# Runtime stage (small, only runtime)
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
```

### Docker Networking

**Bridge Network:** Containers can communicate by service name
- `identityserver` resolves to IdentityServer container IP
- `sqlserver` resolves to SQL Server container IP

### Health Checks

**Why?** Ensure dependencies are ready before starting dependent services

```yaml
healthcheck:
  test: /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P "password" -Q "SELECT 1"
  interval: 10s
  retries: 10
```

### Docker Volumes

**Persistent Data:** SQL Server data survives container restarts

```yaml
volumes:
  - sqlserver-data:/var/opt/mssql
```

### Container Dependencies

**Ordering:** Wait for SQL Server before starting API

```yaml
depends_on:
  sqlserver:
    condition: service_healthy
```

---

## 💡 Production Best Practices

### Security

1. **Don't hardcode secrets** in docker-compose.yml
   ```yaml
   environment:
     - SA_PASSWORD=${SQL_SA_PASSWORD}
   ```

2. **Use secrets management** (Docker Secrets, Azure Key Vault)

3. **Run as non-root user** in Dockerfile
   ```dockerfile
   USER appuser
   ```

4. **Scan images for vulnerabilities**
   ```bash
   docker scan talentmanagement-api:latest
   ```

### Performance

1. **Layer caching:** Copy package files before source code
   ```dockerfile
   COPY package*.json ./
   RUN npm ci
   COPY . .
   ```

2. **Use alpine images** when possible (smaller, faster)
   ```dockerfile
   FROM node:20-alpine
   ```

3. **Multi-stage builds:** Separate build and runtime

### Monitoring

1. **Container logs:** `docker-compose logs -f`
2. **Health endpoints:** Implement `/health` in all services
3. **Resource limits:**
   ```yaml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```

---

## 📖 Next Steps

Now that you've containerized the application:

1. **Push to Docker Hub**
   ```bash
   docker tag talentmanagement-api:latest yourusername/talentmanagement-api:latest
   docker push yourusername/talentmanagement-api:latest
   ```

2. **Deploy to cloud** (Azure Container Instances, AWS ECS, Google Cloud Run)

3. **Set up CI/CD** to automatically build and push images

4. **Implement Kubernetes** for production orchestration

5. **Add monitoring** with Prometheus + Grafana

---

## 🎉 Congratulations!

You've successfully containerized the entire CAT Pattern application! 

**What you've accomplished:**
✅ Created Dockerfiles for all three tiers
✅ Built Docker images
✅ Orchestrated services with Docker Compose
✅ Set up container networking
✅ Configured SQL Server in a container
✅ Verified end-to-end functionality

**You're now ready for:**
- Cloud deployment
- CI/CD pipelines
- Production orchestration
- Scaling and high availability

---

*[← LAB-05: Write Unit Tests](LAB-05-write-tests.md) | [Labs Home](README.md)*
