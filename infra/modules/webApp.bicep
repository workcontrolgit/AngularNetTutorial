@description('Name of the Web App')
param webAppName string

@description('Azure region for the Web App')
param location string

@description('Resource ID of the App Service Plan')
param appServicePlanId string

resource webApp 'Microsoft.Web/sites@2023-01-01' = {
  name: webAppName
  location: location
  identity: {
    type: 'SystemAssigned'
  }
  properties: {
    serverFarmId: appServicePlanId
    httpsOnly: true
    siteConfig: {
      netFrameworkVersion: 'v10.0'
      http20Enabled: true
      minTlsVersion: '1.2'
      ftpsState: 'Disabled'
    }
  }
}

output id string = webApp.id
output defaultHostName string = webApp.properties.defaultHostName
output url string = 'https://${webApp.properties.defaultHostName}'
output principalId string = webApp.identity.principalId
