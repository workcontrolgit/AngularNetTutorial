// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  baseUrl: '',
  useHash: false,

  // API Configuration
  apiUrl: 'https://localhost:44378/api/v1',

  // Duende IdentityServer Configuration
  identityServerUrl: 'https://sts.skoruba.local',
  clientId: 'TalentManagement',
  scope: 'openid profile email app.api.talentmanagement.read',

  // Feature Flags
  allowAnonymousAccess: true,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
