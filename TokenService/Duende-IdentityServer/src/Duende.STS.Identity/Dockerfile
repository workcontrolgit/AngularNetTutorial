FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG TARGETARCH
WORKDIR /src
COPY ["src/Duende.STS.Identity/Duende.STS.Identity.csproj", "src/Duende.STS.Identity/"]
COPY ["src/Duende.Admin.EntityFramework.Shared/Duende.Admin.EntityFramework.Shared.csproj", "src/Duende.Admin.EntityFramework.Shared/"]
COPY ["src/Duende.Shared/Duende.Shared.csproj", "src/Duende.Shared/"]
RUN dotnet restore -a $TARGETARCH "src/Duende.STS.Identity/Duende.STS.Identity.csproj"
COPY . .
WORKDIR "/src/src/Duende.STS.Identity"
RUN dotnet build -a $TARGETARCH "Duende.STS.Identity.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -a $TARGETARCH "Duende.STS.Identity.csproj" -c Release --no-restore -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENV ASPNETCORE_FORWARDEDHEADERS_ENABLED=true
ENTRYPOINT ["dotnet", "Duende.STS.Identity.dll"]