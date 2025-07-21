sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/Fragment",
  "sap/ui/core/CustomStyleClassSupport"
], function(Controller, Fragment) {
  "use strict";

  return Controller.extend("coffee-frontend.controller.Home", {
    onInit: function () {
      var oView = this.getView();

      // Load the NavigationBar fragment into the customHeader
      Fragment.load({
        id: oView.getId(),
        name: "coffee-frontend.view.fragment.NavigationBar",
        controller: this
      }).then(function (oFragment) {
        oView.byId("navbarContainer").destroyContentLeft();
        oView.byId("navbarContainer").addContentLeft(oFragment);
      });
    },

    // Placeholder button actions
    onSelectSingle: function () {
      sap.m.MessageToast.show("Single selected");
    },

    onSelectDouble: function () {
      sap.m.MessageToast.show("Double selected");
    },

    onTopUpBalance: function () {
      this.onOpenTopUpDialog(); // ✅ open the dialog here
    },

    // Navigation handlers
    onNavHome: function () {
      this.getOwnerComponent().getRouter().navTo("home");
    },

    onNavProfile: function () {
      this.getOwnerComponent().getRouter().navTo("profile");
    },

    // ✅ OPEN CHECKOUT DIALOG
    onOpenCheckoutDialog: function () {
      var oView = this.getView();

      if (!this._pDialog) {
        this._pDialog = Fragment.load({
          id: oView.getId(),
          name: "coffee-frontend.view.fragment.Checkout", // path to your fragment
          controller: this
        }).then(function (oDialog) {
          oView.addDependent(oDialog);
          oDialog.open();
          return oDialog;
        });
      } else {
        this._pDialog.then(function (oDialog) {
          oDialog.open();
        });
      }
    },

    // ✅ CLOSE CHECKOUT DIALOG
    onCloseCheckoutDialog: function () {
      if (this._pDialog) {
        this._pDialog.then(function (oDialog) {
          oDialog.close();
        });
      }
    },



    // Open Top Up Dialog
onOpenTopUpDialog: function () {
  var oView = this.getView();

  if (!this._pTopUpDialog) {
    this._pTopUpDialog = Fragment.load({
      id: oView.getId(),
      name: "coffee-frontend.view.fragment.TopUp", // Adjust path if needed
      controller: this
    }).then(function (oDialog) {
      oView.addDependent(oDialog);
      oDialog.open();
      return oDialog;
    });
  } else {
    this._pTopUpDialog.then(function (oDialog) {
      oDialog.open();
    });
  }
},

// Close Top Up Dialog
onCloseTopUpDialog: function () {
  if (this._pTopUpDialog) {
    this._pTopUpDialog.then(function (oDialog) {
      oDialog.close();
    });
  }
}

  });
});
