@description('Name of the App Service Plan')
param appServicePlanName string

@description('Azure region for all resources')
param location string

resource appServicePlan 'Microsoft.Web/serverfarms@2023-01-01' = {
  name: appServicePlanName
  location: location
  sku: {
    name: 'B1'
    tier: 'Basic'
  }
  properties: {
    reserved: false // Windows
  }
}

output id string = appServicePlan.id
