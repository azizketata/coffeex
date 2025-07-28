sap.ui.define([
    "sap/ui/core/mvc/Controller"
  ], function(Controller) {
    "use strict";
  
    return Controller.extend("coffee-frontend.controller.Login", {
      onInit: function () {
        console.log("Login view initialized");
        jQuery.sap.includeStyleSheet("view/Login.view.css");
      },
      onSignIn: function () {
        // Navigate to the 'home' route defined in manifest.json
        this.getOwnerComponent().getRouter().navTo("home");
      }
      
    });
  });
  