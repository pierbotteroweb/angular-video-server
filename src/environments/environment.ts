// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  BASE_URL:"http://shuffletv.ddns.net:1984/api/assets/dvds/",
  API: 'http://localhost:3000/',
  firebase: {
    apiKey: "AIzaSyCwnQT7_QChY_ce7z3uoiFWy6GMqlF--1c",
    authDomain: "shuffletv-dec45.firebaseapp.com",
    projectId: "shuffletv-dec45",
    storageBucket: "shuffletv-dec45.appspot.com",
    messagingSenderId: "255968457120",
    appId: "1:255968457120:web:b6eab2c4fd190bc80d74c5"
  }
};
''
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.