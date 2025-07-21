sap.ui.define([
    "sap/ui/core/mvc/Controller"
  ], function (Controller) {
    "use strict";
  
    return Controller.extend("coffee-frontend.controller.Privacy", {
      onInit: function () {},
  
      onCancel: function () {
        this.getOwnerComponent().getRouter().navTo("profile");
      }
    });
  });
  