# CAT Pattern Tutorial - Angular/.NET Stack

This repository demonstrates the **Client, API Resource, and Token Service (CAT)** pattern using Angular and .NET technologies.

**Repository**: https://github.com/workcontrolgit/AngularNetTutotial.git

## Repository Structure

```
medium/
├── Clients/
│   └── TalentManagement-Angular-Material/    # Angular Material client
├── ApiResources/
│   └── TalentManagement-API/                 # ASP.NET Core Web API
└── TokenService/
    └── Duende-IdentityServer/                # Duende IdentityServer
```

## Technology Stack

| Component | Technology | Version | Repository |
|-----------|------------|---------|------------|
| Client | Angular + Material Design | 20.x | [TalentManagement-Angular-Material](https://github.com/workcontrolgit/TalentManagement-Angular-Material) |
| API | ASP.NET Core Web API | .NET 10 | [TalentManagement-API](https://github.com/workcontrolgit/TalentManagement-API) |
| Identity | Duende IdentityServer | 7.0 | [Duende-IdentityServer](https://github.com/workcontrolgit/Duende-IdentityServer) |

## Getting Started

### Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/) and npm
- [Git](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/) or your preferred IDE

### Clone with Submodules

This repository uses Git submodules to manage the individual components. Clone everything with:

```bash
git clone --recurse-submodules https://github.com/workcontrolgit/AngularNetTutotial.git
cd AngularNetTutotial
```

Or if you've already cloned without submodules:

```bash
git clone https://github.com/workcontrolgit/AngularNetTutotial.git
cd AngularNetTutotial
git submodule update --init --recursive
```

### Running the Application

#### 1. Start the Token Service (Identity Server)

```bash
cd TokenService/Duende-IdentityServer
dotnet restore
dotnet run
```

Default URL: `https://localhost:5001`

#### 2. Start the API Resource

```bash
cd ApiResources/TalentManagement-API
dotnet restore
dotnet run
```

Default URL: `https://localhost:7001`

#### 3. Start the Angular Client

```bash
cd Clients/TalentManagement-Angular-Material
npm install
npm start
```

Default URL: `http://localhost:4200`

## Architecture Overview

### CAT Pattern

The **CAT (Client, API Resource, Token Service)** pattern separates concerns:

- **Client**: User interface (Angular with Material Design)
- **API Resource**: Business logic and data access (.NET Core Web API)
- **Token Service**: Authentication and authorization (Duende IdentityServer)

### Authentication Flow

1. User authenticates via the Angular client
2. Client redirects to IdentityServer for login
3. IdentityServer issues tokens (ID token, access token)
4. Client uses access token to call API
5. API validates token with IdentityServer

## Project Structure Details

### Clients Folder

Contains different client implementations. Currently includes:
- **TalentManagement-Angular-Material**: Angular application with Material Design components

Future additions may include:
- React client
- Blazor WebAssembly client

### ApiResources Folder

Contains the backend API that serves data to clients. The API:
- Protects endpoints using JWT bearer authentication
- Validates tokens issued by IdentityServer
- Implements business logic and data access

### TokenService Folder

Contains the identity and authentication server:
- Issues tokens (JWT)
- Manages user authentication
- Handles OAuth 2.0 and OpenID Connect flows
- Manages API scopes and client configurations

## Configuration

Each component has its own configuration:

- **IdentityServer**: `appsettings.json` - Configure clients, API resources, and identity resources
- **API**: `appsettings.json` - Configure database connections and IdentityServer authority
- **Angular Client**: `environment.ts` - Configure API and IdentityServer URLs

## Development Workflow

1. Make changes in the appropriate submodule
2. Test locally
3. Commit changes within the submodule
4. Push submodule changes to its remote repository
5. Update the parent repository to reference the new submodule commit

```bash
# In the submodule directory
cd ApiResources/TalentManagement-API
git add .
git commit -m "Your changes"
git push

# In the parent directory
cd ../..
git add ApiResources/TalentManagement-API
git commit -m "Update API submodule"
git push
```

## Troubleshooting

### Submodule Issues

If submodules aren't initialized:
```bash
git submodule update --init --recursive
```

To pull latest changes from all submodules:
```bash
git submodule update --remote --merge
```

### Port Conflicts

If default ports are in use, update the configuration:
- IdentityServer: `Properties/launchSettings.json`
- API: `Properties/launchSettings.json`
- Angular: `angular.json` or use `ng serve --port <port>`

## Learning Resources

- [OAuth 2.0 and OpenID Connect](https://oauth.net/2/)
- [Duende IdentityServer Documentation](https://docs.duendesoftware.com/)
- [ASP.NET Core Documentation](https://docs.microsoft.com/aspnet/core/)
- [Angular Documentation](https://angular.dev/)

## License

[Specify your license here]

## Contributing

[Specify contribution guidelines]

## Contact

[Your contact information]
