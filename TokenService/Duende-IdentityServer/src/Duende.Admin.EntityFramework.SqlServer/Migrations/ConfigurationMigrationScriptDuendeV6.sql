BEGIN TRANSACTION;
GO

ALTER TABLE [ApiClaims] DROP CONSTRAINT [FK_ApiClaims_ApiResources_ApiResourceId];
GO

ALTER TABLE [ApiProperties] DROP CONSTRAINT [FK_ApiProperties_ApiResources_ApiResourceId];
GO

ALTER TABLE [ApiScopeClaims] DROP CONSTRAINT [FK_ApiScopeClaims_ApiScopes_ApiScopeId];
GO

ALTER TABLE [ApiScopes] DROP CONSTRAINT [FK_ApiScopes_ApiResources_ApiResourceId];
GO

ALTER TABLE [IdentityProperties] DROP CONSTRAINT [FK_IdentityProperties_IdentityResources_IdentityResourceId];
GO

DROP INDEX [IX_ApiScopes_ApiResourceId] ON [ApiScopes];
GO

DROP INDEX [IX_ApiScopeClaims_ApiScopeId] ON [ApiScopeClaims];
GO

ALTER TABLE [IdentityProperties] DROP CONSTRAINT [PK_IdentityProperties];
GO

ALTER TABLE [ApiProperties] DROP CONSTRAINT [PK_ApiProperties];
GO

ALTER TABLE [ApiClaims] DROP CONSTRAINT [PK_ApiClaims];
GO

EXEC sp_rename N'[IdentityProperties]', N'IdentityResourceProperties';
GO

EXEC sp_rename N'[ApiProperties]', N'ApiResourceProperties';
GO

EXEC sp_rename N'[ApiClaims]', N'ApiResourceClaims';
GO

EXEC sp_rename N'[IdentityResourceProperties].[IX_IdentityProperties_IdentityResourceId]', N'IX_IdentityResourceProperties_IdentityResourceId', N'INDEX';
GO

EXEC sp_rename N'[ApiResourceProperties].[IX_ApiProperties_ApiResourceId]', N'IX_ApiResourceProperties_ApiResourceId', N'INDEX';
GO

EXEC sp_rename N'[ApiResourceClaims].[IX_ApiClaims_ApiResourceId]', N'IX_ApiResourceClaims_ApiResourceId', N'INDEX';
GO

ALTER TABLE [Clients] ADD [AllowedIdentityTokenSigningAlgorithms] nvarchar(100) NULL;
GO

ALTER TABLE [Clients] ADD [RequireRequestObject] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

ALTER TABLE [ApiScopes] ADD [Enabled] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

ALTER TABLE [ApiScopeClaims] ADD [ScopeId] int NOT NULL DEFAULT 0;
GO

ALTER TABLE [ApiResources] ADD [AllowedAccessTokenSigningAlgorithms] nvarchar(100) NULL;
GO

ALTER TABLE [ApiResources] ADD [ShowInDiscoveryDocument] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

ALTER TABLE [IdentityResourceProperties] ADD CONSTRAINT [PK_IdentityResourceProperties] PRIMARY KEY ([Id]);
GO

ALTER TABLE [ApiResourceProperties] ADD CONSTRAINT [PK_ApiResourceProperties] PRIMARY KEY ([Id]);
GO

ALTER TABLE [ApiResourceClaims] ADD CONSTRAINT [PK_ApiResourceClaims] PRIMARY KEY ([Id]);
GO

CREATE TABLE [ApiResourceScopes] (
    [Id] int NOT NULL IDENTITY,
    [Scope] nvarchar(200) NOT NULL,
    [ApiResourceId] int NOT NULL,
    CONSTRAINT [PK_ApiResourceScopes] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ApiResourceScopes_ApiResources_ApiResourceId] FOREIGN KEY ([ApiResourceId]) REFERENCES [ApiResources] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [ApiResourceSecrets] (
    [Id] int NOT NULL IDENTITY,
    [Description] nvarchar(1000) NULL,
    [Value] nvarchar(4000) NOT NULL,
    [Expiration] datetime2 NULL,
    [Type] nvarchar(250) NOT NULL,
    [Created] datetime2 NOT NULL,
    [ApiResourceId] int NOT NULL,
    CONSTRAINT [PK_ApiResourceSecrets] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ApiResourceSecrets_ApiResources_ApiResourceId] FOREIGN KEY ([ApiResourceId]) REFERENCES [ApiResources] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [ApiScopeProperties] (
    [Id] int NOT NULL IDENTITY,
    [Key] nvarchar(250) NOT NULL,
    [Value] nvarchar(2000) NOT NULL,
    [ScopeId] int NOT NULL,
    CONSTRAINT [PK_ApiScopeProperties] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_ApiScopeProperties_ApiScopes_ScopeId] FOREIGN KEY ([ScopeId]) REFERENCES [ApiScopes] ([Id]) ON DELETE CASCADE
);
GO

CREATE TABLE [IdentityResourceClaims] (
    [Id] int NOT NULL IDENTITY,
    [Type] nvarchar(200) NOT NULL,
    [IdentityResourceId] int NOT NULL,
    CONSTRAINT [PK_IdentityResourceClaims] PRIMARY KEY ([Id]),
    CONSTRAINT [FK_IdentityResourceClaims_IdentityResources_IdentityResourceId] FOREIGN KEY ([IdentityResourceId]) REFERENCES [IdentityResources] ([Id]) ON DELETE CASCADE
);
GO

CREATE INDEX [IX_ApiScopeClaims_ScopeId] ON [ApiScopeClaims] ([ScopeId]);
GO

CREATE INDEX [IX_ApiResourceScopes_ApiResourceId] ON [ApiResourceScopes] ([ApiResourceId]);
GO

CREATE INDEX [IX_ApiResourceSecrets_ApiResourceId] ON [ApiResourceSecrets] ([ApiResourceId]);
GO

CREATE INDEX [IX_ApiScopeProperties_ScopeId] ON [ApiScopeProperties] ([ScopeId]);
GO

CREATE INDEX [IX_IdentityResourceClaims_IdentityResourceId] ON [IdentityResourceClaims] ([IdentityResourceId]);
GO

ALTER TABLE [ApiResourceClaims] ADD CONSTRAINT [FK_ApiResourceClaims_ApiResources_ApiResourceId] FOREIGN KEY ([ApiResourceId]) REFERENCES [ApiResources] ([Id]) ON DELETE CASCADE;
GO

ALTER TABLE [ApiResourceProperties] ADD CONSTRAINT [FK_ApiResourceProperties_ApiResources_ApiResourceId] FOREIGN KEY ([ApiResourceId]) REFERENCES [ApiResources] ([Id]) ON DELETE CASCADE;
GO

SET IDENTITY_INSERT ApiResourceSecrets ON;  
GO


INSERT INTO ApiResourceSecrets
 (Id, [Description], [Value], Expiration, [Type], Created, ApiResourceId)
SELECT 
 Id, [Description], [Value], Expiration, [Type], Created, ApiResourceId
FROM ApiSecrets
GO


SET IDENTITY_INSERT ApiResourceSecrets OFF;  
GO

SET IDENTITY_INSERT IdentityResourceClaims ON;  
GO


INSERT INTO IdentityResourceClaims
 (Id, [Type], IdentityResourceId)
SELECT 
 Id, [Type], IdentityResourceId
FROM IdentityClaims
GO

SET IDENTITY_INSERT IdentityResourceClaims OFF; 
GO

INSERT INTO ApiResourceScopes 
 ([Scope], [ApiResourceId])
SELECT 
 [Name], [ApiResourceId]
FROM ApiScopes
GO

UPDATE ApiScopeClaims SET ScopeId = ApiScopeId
GO

UPDATE ApiScopes SET [Enabled] = 1
GO

DROP TABLE [ApiSecrets];
GO

DROP TABLE [IdentityClaims];
GO

DECLARE @var0 sysname;
SELECT @var0 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ApiScopes]') AND [c].[name] = N'ApiResourceId');
IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [ApiScopes] DROP CONSTRAINT [' + @var0 + '];');
ALTER TABLE [ApiScopes] DROP COLUMN [ApiResourceId];
GO

DECLARE @var1 sysname;
SELECT @var1 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ApiScopeClaims]') AND [c].[name] = N'ApiScopeId');
IF @var1 IS NOT NULL EXEC(N'ALTER TABLE [ApiScopeClaims] DROP CONSTRAINT [' + @var1 + '];');
ALTER TABLE [ApiScopeClaims] DROP COLUMN [ApiScopeId];
GO

ALTER TABLE [ApiScopeClaims] ADD CONSTRAINT [FK_ApiScopeClaims_ApiScopes_ScopeId] FOREIGN KEY ([ScopeId]) REFERENCES [ApiScopes] ([Id]) ON DELETE CASCADE;
GO

ALTER TABLE [IdentityResourceProperties] ADD CONSTRAINT [FK_IdentityResourceProperties_IdentityResources_IdentityResourceId] FOREIGN KEY ([IdentityResourceId]) REFERENCES [IdentityResources] ([Id]) ON DELETE CASCADE;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20201030101938_UpdateIdentityServerToVersion4', N'8.0.6');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [ApiResources] ADD [RequireResourceIndicator] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20210310151745_AddRequireResourceIndicator', N'8.0.6');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [IdentityProviders] (
    [Id] int NOT NULL IDENTITY,
    [Scheme] nvarchar(200) NOT NULL,
    [DisplayName] nvarchar(200) NULL,
    [Enabled] bit NOT NULL,
    [Type] nvarchar(20) NOT NULL,
    [Properties] nvarchar(max) NULL,
    CONSTRAINT [PK_IdentityProviders] PRIMARY KEY ([Id])
);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20211111141154_AddIdentityServerProviders', N'8.0.6');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

DROP INDEX [IX_IdentityResourceProperties_IdentityResourceId] ON [IdentityResourceProperties];
GO

DROP INDEX [IX_IdentityResourceClaims_IdentityResourceId] ON [IdentityResourceClaims];
GO

DROP INDEX [IX_ClientScopes_ClientId] ON [ClientScopes];
GO

DROP INDEX [IX_ClientRedirectUris_ClientId] ON [ClientRedirectUris];
GO

DROP INDEX [IX_ClientProperties_ClientId] ON [ClientProperties];
GO

DROP INDEX [IX_ClientPostLogoutRedirectUris_ClientId] ON [ClientPostLogoutRedirectUris];
GO

DROP INDEX [IX_ClientIdPRestrictions_ClientId] ON [ClientIdPRestrictions];
GO

DROP INDEX [IX_ClientGrantTypes_ClientId] ON [ClientGrantTypes];
GO

DROP INDEX [IX_ClientCorsOrigins_ClientId] ON [ClientCorsOrigins];
GO

DROP INDEX [IX_ClientClaims_ClientId] ON [ClientClaims];
GO

DROP INDEX [IX_ApiScopeProperties_ScopeId] ON [ApiScopeProperties];
GO

DROP INDEX [IX_ApiScopeClaims_ScopeId] ON [ApiScopeClaims];
GO

DROP INDEX [IX_ApiResourceScopes_ApiResourceId] ON [ApiResourceScopes];
GO

DROP INDEX [IX_ApiResourceProperties_ApiResourceId] ON [ApiResourceProperties];
GO

DROP INDEX [IX_ApiResourceClaims_ApiResourceId] ON [ApiResourceClaims];
GO

ALTER TABLE [IdentityProviders] ADD [Created] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

ALTER TABLE [IdentityProviders] ADD [LastAccessed] datetime2 NULL;
GO

ALTER TABLE [IdentityProviders] ADD [NonEditable] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

ALTER TABLE [IdentityProviders] ADD [Updated] datetime2 NULL;
GO

ALTER TABLE [Clients] ADD [CibaLifetime] int NULL;
GO

ALTER TABLE [Clients] ADD [PollingInterval] int NULL;
GO

DECLARE @var2 sysname;
SELECT @var2 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ClientRedirectUris]') AND [c].[name] = N'RedirectUri');
IF @var2 IS NOT NULL EXEC(N'ALTER TABLE [ClientRedirectUris] DROP CONSTRAINT [' + @var2 + '];');
ALTER TABLE [ClientRedirectUris] ALTER COLUMN [RedirectUri] nvarchar(400) NOT NULL;
GO

DECLARE @var3 sysname;
SELECT @var3 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ClientPostLogoutRedirectUris]') AND [c].[name] = N'PostLogoutRedirectUri');
IF @var3 IS NOT NULL EXEC(N'ALTER TABLE [ClientPostLogoutRedirectUris] DROP CONSTRAINT [' + @var3 + '];');
ALTER TABLE [ClientPostLogoutRedirectUris] ALTER COLUMN [PostLogoutRedirectUri] nvarchar(400) NOT NULL;
GO

ALTER TABLE [ApiScopes] ADD [Created] datetime2 NOT NULL DEFAULT '0001-01-01T00:00:00.0000000';
GO

ALTER TABLE [ApiScopes] ADD [LastAccessed] datetime2 NULL;
GO

ALTER TABLE [ApiScopes] ADD [NonEditable] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

ALTER TABLE [ApiScopes] ADD [Updated] datetime2 NULL;
GO

CREATE UNIQUE INDEX [IX_IdentityResourceProperties_IdentityResourceId_Key] ON [IdentityResourceProperties] ([IdentityResourceId], [Key]);
GO

CREATE UNIQUE INDEX [IX_IdentityResourceClaims_IdentityResourceId_Type] ON [IdentityResourceClaims] ([IdentityResourceId], [Type]);
GO

CREATE UNIQUE INDEX [IX_IdentityProviders_Scheme] ON [IdentityProviders] ([Scheme]);
GO

CREATE UNIQUE INDEX [IX_ClientScopes_ClientId_Scope] ON [ClientScopes] ([ClientId], [Scope]);
GO

CREATE UNIQUE INDEX [IX_ClientRedirectUris_ClientId_RedirectUri] ON [ClientRedirectUris] ([ClientId], [RedirectUri]);
GO

CREATE UNIQUE INDEX [IX_ClientProperties_ClientId_Key] ON [ClientProperties] ([ClientId], [Key]);
GO

CREATE UNIQUE INDEX [IX_ClientPostLogoutRedirectUris_ClientId_PostLogoutRedirectUri] ON [ClientPostLogoutRedirectUris] ([ClientId], [PostLogoutRedirectUri]);
GO

CREATE UNIQUE INDEX [IX_ClientIdPRestrictions_ClientId_Provider] ON [ClientIdPRestrictions] ([ClientId], [Provider]);
GO

CREATE UNIQUE INDEX [IX_ClientGrantTypes_ClientId_GrantType] ON [ClientGrantTypes] ([ClientId], [GrantType]);
GO

CREATE UNIQUE INDEX [IX_ClientCorsOrigins_ClientId_Origin] ON [ClientCorsOrigins] ([ClientId], [Origin]);
GO

CREATE UNIQUE INDEX [IX_ClientClaims_ClientId_Type_Value] ON [ClientClaims] ([ClientId], [Type], [Value]);
GO

CREATE UNIQUE INDEX [IX_ApiScopeProperties_ScopeId_Key] ON [ApiScopeProperties] ([ScopeId], [Key]);
GO

CREATE UNIQUE INDEX [IX_ApiScopeClaims_ScopeId_Type] ON [ApiScopeClaims] ([ScopeId], [Type]);
GO

CREATE UNIQUE INDEX [IX_ApiResourceScopes_ApiResourceId_Scope] ON [ApiResourceScopes] ([ApiResourceId], [Scope]);
GO

CREATE UNIQUE INDEX [IX_ApiResourceProperties_ApiResourceId_Key] ON [ApiResourceProperties] ([ApiResourceId], [Key]);
GO

CREATE UNIQUE INDEX [IX_ApiResourceClaims_ApiResourceId_Type] ON [ApiResourceClaims] ([ApiResourceId], [Type]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20220116154116_UpdateToIS6', N'8.0.6');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [Clients] ADD [CoordinateLifetimeWithUserSession] bit NULL;
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20221115182001_UpdateToIS61', N'8.0.6');
GO

COMMIT;
GO

