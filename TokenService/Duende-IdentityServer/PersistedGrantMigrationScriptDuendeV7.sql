BEGIN TRANSACTION;
GO

ALTER TABLE [ServerSideSessions] DROP CONSTRAINT [PK_ServerSideSessions];
GO

DECLARE @var0 sysname;
SELECT @var0 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[ServerSideSessions]') AND [c].[name] = N'Id');
IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [ServerSideSessions] DROP CONSTRAINT [' + @var0 + '];');
ALTER TABLE [ServerSideSessions] ALTER COLUMN [Id] bigint NOT NULL;
GO

ALTER TABLE [ServerSideSessions] ADD CONSTRAINT [PK_ServerSideSessions] PRIMARY KEY ([Id]);
GO

CREATE TABLE [PushedAuthorizationRequests] (
    [Id] bigint NOT NULL IDENTITY,
    [ReferenceValueHash] nvarchar(64) NOT NULL,
    [ExpiresAtUtc] datetime2 NOT NULL,
    [Parameters] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_PushedAuthorizationRequests] PRIMARY KEY ([Id])
);
GO

CREATE INDEX [IX_PushedAuthorizationRequests_ExpiresAtUtc] ON [PushedAuthorizationRequests] ([ExpiresAtUtc]);
GO

CREATE UNIQUE INDEX [IX_PushedAuthorizationRequests_ReferenceValueHash] ON [PushedAuthorizationRequests] ([ReferenceValueHash]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20240206133332_IdentityServerV7', N'8.0.6');
GO

COMMIT;
GO

