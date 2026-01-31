BEGIN TRANSACTION;
GO

ALTER TABLE [PersistedGrants] ADD [ConsumedTime] datetime2 NULL;
GO

ALTER TABLE [PersistedGrants] ADD [Description] nvarchar(200) NULL;
GO

ALTER TABLE [PersistedGrants] ADD [SessionId] nvarchar(100) NULL;
GO

ALTER TABLE [DeviceCodes] ADD [Description] nvarchar(200) NULL;
GO

ALTER TABLE [DeviceCodes] ADD [SessionId] nvarchar(100) NULL;
GO

CREATE INDEX [IX_PersistedGrants_SubjectId_SessionId_Type] ON [PersistedGrants] ([SubjectId], [SessionId], [Type]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20201030101834_UpdateIdentityServerToVersion4', N'8.0.6');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

CREATE TABLE [Keys] (
    [Id] nvarchar(450) NOT NULL,
    [Version] int NOT NULL,
    [Created] datetime2 NOT NULL,
    [Use] nvarchar(450) NULL,
    [Algorithm] nvarchar(100) NOT NULL,
    [IsX509Certificate] bit NOT NULL,
    [DataProtected] bit NOT NULL,
    [Data] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_Keys] PRIMARY KEY ([Id])
);
GO

CREATE INDEX [IX_PersistedGrants_ConsumedTime] ON [PersistedGrants] ([ConsumedTime]);
GO

CREATE INDEX [IX_Keys_Use] ON [Keys] ([Use]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20211111131819_AddIdentityServerKeys', N'8.0.6');
GO

COMMIT;
GO

BEGIN TRANSACTION;
GO

ALTER TABLE [PersistedGrants] DROP CONSTRAINT [PK_PersistedGrants];
GO

DECLARE @var0 sysname;
SELECT @var0 = [d].[name]
FROM [sys].[default_constraints] [d]
INNER JOIN [sys].[columns] [c] ON [d].[parent_column_id] = [c].[column_id] AND [d].[parent_object_id] = [c].[object_id]
WHERE ([d].[parent_object_id] = OBJECT_ID(N'[PersistedGrants]') AND [c].[name] = N'Key');
IF @var0 IS NOT NULL EXEC(N'ALTER TABLE [PersistedGrants] DROP CONSTRAINT [' + @var0 + '];');
ALTER TABLE [PersistedGrants] ALTER COLUMN [Key] nvarchar(200) NULL;
GO

ALTER TABLE [PersistedGrants] ADD [Id] bigint NOT NULL IDENTITY;
GO

ALTER TABLE [PersistedGrants] ADD CONSTRAINT [PK_PersistedGrants] PRIMARY KEY ([Id]);
GO

CREATE TABLE [ServerSideSessions] (
    [Id] int NOT NULL IDENTITY,
    [Key] nvarchar(100) NOT NULL,
    [Scheme] nvarchar(100) NOT NULL,
    [SubjectId] nvarchar(100) NOT NULL,
    [SessionId] nvarchar(100) NULL,
    [DisplayName] nvarchar(100) NULL,
    [Created] datetime2 NOT NULL,
    [Renewed] datetime2 NOT NULL,
    [Expires] datetime2 NULL,
    [Data] nvarchar(max) NOT NULL,
    CONSTRAINT [PK_ServerSideSessions] PRIMARY KEY ([Id])
);
GO

CREATE UNIQUE INDEX [IX_PersistedGrants_Key] ON [PersistedGrants] ([Key]) WHERE [Key] IS NOT NULL;
GO

CREATE INDEX [IX_ServerSideSessions_DisplayName] ON [ServerSideSessions] ([DisplayName]);
GO

CREATE INDEX [IX_ServerSideSessions_Expires] ON [ServerSideSessions] ([Expires]);
GO

CREATE UNIQUE INDEX [IX_ServerSideSessions_Key] ON [ServerSideSessions] ([Key]);
GO

CREATE INDEX [IX_ServerSideSessions_SessionId] ON [ServerSideSessions] ([SessionId]);
GO

CREATE INDEX [IX_ServerSideSessions_SubjectId] ON [ServerSideSessions] ([SubjectId]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20221115181936_UpdateToIS61', N'8.0.6');
GO

COMMIT;
GO

