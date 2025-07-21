sap.ui.define([
    "sap/ui/core/mvc/Controller"
  ], function (Controller) {
    "use strict";
  
    return Controller.extend("coffee-frontend.controller.OrderSuccess", {
      onInit: function () {
        // Optional: any logic on init
      },
      onNavHome: function () {
        this.getOwnerComponent().getRouter().navTo("home");
      }
      
    });
  });
  