sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/Fragment"  // ✅ You forgot this line
], function(Controller, Fragment) {
  "use strict";

  return Controller.extend("coffee-frontend.controller.Profile", {
    onInit: function () {
      var oView = this.getView();

      Fragment.load({
        id: oView.getId(),
        name: "coffee-frontend.view.fragment.NavigationBar",
        controller: this
      }).then(function (oFragment) {
        oView.byId("navbarContainer2").destroyContentLeft();
        oView.byId("navbarContainer2").addContentLeft(oFragment);
      });
    },


    onListItemPress: function (oEvent) {
      var oItem = oEvent.getParameter("listItem");
      var sTitle = oItem.getProperty("title");
    
      switch (sTitle) {
        case "Transaction History":
          this.getOwnerComponent().getRouter().navTo("history");
          break;
        case "Data Privacy":
          this.getOwnerComponent().getRouter().navTo("privacy");
          break;
        // Add more cases if needed
      }
    
      // You can add more navigation logic for other list items if needed
    },
    
    onNavHome: function () {
      this.getOwnerComponent().getRouter().navTo("home");
    },

    onNavProfile: function () {
      this.getOwnerComponent().getRouter().navTo("profile");
    },
    onNavAdmin: function () {
      this.getOwnerComponent().getRouter().navTo("admin");
    },
  });
});
