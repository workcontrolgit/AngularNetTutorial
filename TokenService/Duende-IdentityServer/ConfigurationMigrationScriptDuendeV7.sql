BEGIN TRANSACTION;
GO

ALTER TABLE [Clients] ADD [DPoPClockSkew] time NOT NULL DEFAULT '00:00:00';
GO

ALTER TABLE [Clients] ADD [DPoPValidationMode] int NOT NULL DEFAULT 0;
GO

ALTER TABLE [Clients] ADD [InitiateLoginUri] nvarchar(2000) NULL;
GO

ALTER TABLE [Clients] ADD [PushedAuthorizationLifetime] int NULL;
GO

ALTER TABLE [Clients] ADD [RequireDPoP] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

ALTER TABLE [Clients] ADD [RequirePushedAuthorization] bit NOT NULL DEFAULT CAST(0 AS bit);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20240206133328_IdentityServerV7', N'8.0.6');
GO

COMMIT;
GO

