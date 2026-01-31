FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG TARGETARCH
WORKDIR /src
COPY ["src/Duende.Admin.Api/Duende.Admin.Api.csproj", "src/Duende.Admin.Api/"]
COPY ["src/Duende.Admin.EntityFramework.Shared/Duende.Admin.EntityFramework.Shared.csproj", "src/Duende.Admin.EntityFramework.Shared/"]
COPY ["src/Duende.Admin.EntityFramework.SqlServer/Duende.Admin.EntityFramework.SqlServer.csproj", "src/Duende.Admin.EntityFramework.SqlServer/"]
COPY ["src/Duende.Shared/Duende.Shared.csproj", "src/Duende.Shared/"]
COPY ["src/Duende.Admin.EntityFramework.PostgreSQL/Duende.Admin.EntityFramework.PostgreSQL.csproj", "src/Duende.Admin.EntityFramework.PostgreSQL/"]
COPY ["src/Duende.Admin.EntityFramework.MySql/Duende.Admin.EntityFramework.MySql.csproj", "src/Duende.Admin.EntityFramework.MySql/"]
RUN dotnet restore -a $TARGETARCH "src/Duende.Admin.Api/Duende.Admin.Api.csproj"
COPY . .
WORKDIR "/src/src/Duende.Admin.Api"
RUN dotnet build -a $TARGETARCH "Duende.Admin.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -a $TARGETARCH "Duende.Admin.Api.csproj" -c Release --no-restore -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_FORWARDEDHEADERS_ENABLED=true
ENTRYPOINT ["dotnet", "Duende.Admin.Api.dll"]