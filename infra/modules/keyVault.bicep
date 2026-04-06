@description('Name of the Key Vault')
param keyVaultName string

@description('Azure region for the Key Vault')
param location string

@description('Principal IDs of managed identities to grant secret read access')
param readerPrincipalIds array = []

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
    enabledForDeployment: false
    enabledForTemplateDeployment: false
    enabledForDiskEncryption: false
  }
}

// Grant each managed identity the Key Vault Secrets User role (read secrets)
@batchSize(1)
resource secretsUserRoleAssignment 'Microsoft.Authorization/roleAssignments@2022-04-01' = [for (principalId, i) in readerPrincipalIds: {
  // Role assignment scope must be the vault resource
  scope: keyVault
  // Deterministic GUID: vaultId + principalId
  name: guid(keyVault.id, principalId, '4633458b-17de-408a-b874-0445c86b69e6')
  properties: {
    // Key Vault Secrets User built-in role
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', '4633458b-17de-408a-b874-0445c86b69e6')
    principalId: principalId
    principalType: 'ServicePrincipal'
  }
}]

output id string = keyVault.id
output name string = keyVault.name
output uri string = keyVault.properties.vaultUri
