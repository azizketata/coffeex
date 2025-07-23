sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/Fragment",
  "sap/ui/core/CustomStyleClassSupport",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/ui/model/json/JSONModel"
], function (Controller, Fragment, CustomStyleClassSupport, MessageToast, MessageBox, JSONModel) {
  "use strict";

  return Controller.extend("coffee-frontend.controller.Home", {
    onInit: function () {
      const oView = this.getView();

      // Load the NavigationBar fragment into the customHeader
      Fragment.load({
        id: oView.getId(),
        name: "coffee-frontend.view.fragment.NavigationBar",
        controller: this
      }).then(function (oFragment) {
        oView.byId("navbarContainer").destroyContentLeft();
        oView.byId("navbarContainer").addContentLeft(oFragment);
      });

      // 🔔 Check balance on load
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && user.userId) {
        const oModel = this.getView().getModel();

        // Request user data from backend
        oModel.read(`/User('${user.userId}')`, {
          success: (oData) => {
            // Show warning if balance is low
            if (oData.balance < 5) {
              MessageToast.show(`⚠️ Your balance is low (€${oData.balance}). Please top up.`);
            }

            // Bind balance to a local JSON model for UI
            const balanceModel = new JSONModel({
              balance: oData.balance
            });
            this.getView().setModel(balanceModel, "balanceModel");
          },
          error: () => {
            console.warn("Could not fetch user data for balance check.");
          }
        });
      }
    },

    // Navigation handlers
    onNavHome: function () {
      this.getOwnerComponent().getRouter().navTo("home");
    },

    onNavProfile: function () {
      this.getOwnerComponent().getRouter().navTo("profile");
    },

    // Coffee size selection
    onSelectSingle: function () {
      MessageToast.show("Single selected");
    },

    onSelectDouble: function () {
      MessageToast.show("Double selected");
    },

    // Top-Up Dialog Logic
    onTopUpBalance: function () {
      this.onOpenTopUpDialog();
    },

    onOpenTopUpDialog: function () {
      const oView = this.getView();

      if (!this._pTopUpDialog) {
        this._pTopUpDialog = Fragment.load({
          id: oView.getId(),
          name: "coffee-frontend.view.fragment.TopUp",
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

    onCloseTopUpDialog: function () {
      if (this._pTopUpDialog) {
        this._pTopUpDialog.then(function (oDialog) {
          oDialog.close();
        });
      }
    },

    // Checkout Dialog Logic
    onOpenCheckoutDialog: function () {
      const oView = this.getView();

      if (!this._pDialog) {
        this._pDialog = Fragment.load({
          id: oView.getId(),
          name: "coffee-frontend.view.fragment.Checkout",
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

    onCloseCheckoutDialog: function () {
      if (this._pDialog) {
        this._pDialog.then(function (oDialog) {
          oDialog.close();
        });
      }
    },

    // 🟢 Pay for coffee (tap button) → call CAP action 'Tap'
    onUseBalance: function () {
      const oView = this.getView();
      const oModel = oView.getModel();
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user.userId) {
        MessageBox.error("User not logged in.");
        return;
      }

      // Step 1: Get the one machine from backend
      oModel.read("/Machine", {
        success: (oData) => {
          if (!oData.results.length) {
            MessageBox.error("No coffee machine found.");
            return;
          }

          const machineId = oData.results[0].machineId;

          // Step 2: Trigger CAP function 'Tap' with userId + machineId
          oModel.callFunction("/Tap", {
            method: "POST",
            urlParameters: {
              userId: user.userId,
              machineId: machineId
            },
            success: () => {
              MessageToast.show("Coffee ordered successfully!");
              this.onCloseCheckoutDialog();
            },
            error: (oError) => {
              const sMessage = oError?.responseText || "Payment failed.";
              MessageBox.error(sMessage);
            }
          });

        },
        error: () => {
          MessageBox.error("Failed to fetch machine.");
        }
      });
    }
  });
});
