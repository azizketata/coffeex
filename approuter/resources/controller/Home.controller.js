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

    // 🔵 Runs when the view is loaded
    onInit: function () {
      const oView = this.getView();

      // ✅ Load the NavigationBar fragment dynamically into the header
      Fragment.load({
        id: oView.getId(),
        name: "coffee-frontend.view.fragment.NavigationBar",
        controller: this
      }).then(function (oFragment) {
        oView.byId("navbarContainer").destroyContentLeft();
        oView.byId("navbarContainer").addContentLeft(oFragment);
      });

      // ✅ Listen for user model changes
      const oComponent = this.getOwnerComponent();
      const userModel = oComponent.getModel("user");
      
      if (userModel) {
        // If user model already exists, refresh balance
        this.refreshBalance();
        
        // Also listen for future changes
        userModel.attachPropertyChange(() => {
          this.refreshBalance();
        });
      } else {
        // Wait for user model to be created
        const checkUserModel = setInterval(() => {
          const userModel = oComponent.getModel("user");
          if (userModel) {
            clearInterval(checkUserModel);
            this.refreshBalance();
            
            // Listen for future changes
            userModel.attachPropertyChange(() => {
              this.refreshBalance();
            });
          }
        }, 100); // Check every 100ms
        
        // Stop checking after 5 seconds
        setTimeout(() => clearInterval(checkUserModel), 5000);
      }
    },

    // ✅ Function to re-fetch the balance from backend and update the UI
    refreshBalance: function () {
      const userModel = this.getOwnerComponent().getModel("user");
      if (!userModel) {
        console.warn("User model not initialized yet.");
        return;
      }
      
      const userData = userModel.getData();
      if (!userData || !userData.userId) {
        console.warn("No user logged in, cannot refresh balance.");
        return;
      }

      const oModel = this.getView().getModel();

      oModel.read(`/User('${userData.userId}')`, {
        success: (oData) => {
          // ✅ Update balance model with latest value
          const balanceModel = this.getView().getModel("balanceModel") || new JSONModel();
          balanceModel.setData({ balance: oData.balance });
          this.getView().setModel(balanceModel, "balanceModel");

          console.log(`Balance refreshed: €${oData.balance}`);
        },
        error: (err) => {
          console.error("Failed to refresh balance:", err);
          MessageToast.show("Could not refresh balance.");
        }
      });
    },

    // 🔵 Navigation handlers
    onNavHome: function () {
      this.getOwnerComponent().getRouter().navTo("home");
    },

    onNavProfile: function () {
      this.getOwnerComponent().getRouter().navTo("profile");
    },

    // ✅ NEW: Navigation for Admin Dashboard
    onNavAdmin: function () {
      this.getOwnerComponent().getRouter().navTo("admin");
    },

    // 🔵 Coffee size selection
    onSelectSingle: function () {
      MessageToast.show("Single selected");
    },

    onSelectDouble: function () {
      MessageToast.show("Double selected");
    },

    // 🔵 Top-Up Dialog Logic
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

    // 🔵 Checkout Dialog Logic
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

    // 🟢 Pay for coffee button (deduct balance and send coffee order)
    onUseBalance: function () {
      const oView = this.getView();
      const oModel = oView.getModel();
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user.userId) {
        MessageBox.error("User not logged in.");
        return;
      }

      // Step 1: Get coffee machine info
      oModel.read("/Machine", {
        success: (oData) => {
          if (!oData.results.length) {
            MessageBox.error("No coffee machine found.");
            return;
          }

          const machineId = oData.results[0].machineId;

          // Step 2: Trigger CAP action 'Tap'
          oModel.callFunction("/Tap", {
            method: "POST",
            urlParameters: {
              userId: user.userId,
              machineId: machineId
            },
            success: () => {
              MessageToast.show("Coffee ordered successfully!");
              this.onCloseCheckoutDialog();
              this.refreshBalance();  // ✅ refresh balance after ordering coffee
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
    },

    // ------------------ ☕ TOP UP (PayPal) HANDLERS ------------------

    // ✅ Step 1: User clicks an amount (€5, €10, etc.)
    onSelectTopUpAmount: function (oEvent) {
      // remove selected style from all buttons
      const oParent = oEvent.getSource().getParent();
      oParent.getItems().forEach(btn => btn.removeStyleClass("selected"));

      // highlight the clicked button
      oEvent.getSource().addStyleClass("selected");

      // store amount
      const sAmount = oEvent.getSource().getText().replace("€", "").trim();
      this._selectedAmount = parseFloat(sAmount);

      MessageToast.show(`Selected €${this._selectedAmount}`);
    },

    // ✅ Step 2: User clicks “⏩ Pay”
    onPayTopUp: function () {
      const oView = this.getView();
      const oModel = oView.getModel();
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || !user.userId) {
        MessageBox.error("User not logged in.");
        return;
      }

      if (!this._selectedAmount) {
        MessageBox.error("Please select an amount first.");
        return;
      }

      sap.ui.core.BusyIndicator.show(0);

      // Call CAP OData action TopUp
      oModel.callFunction("/TopUp", {
        method: "POST",
        urlParameters: {
          userId: user.userId,
          amount: this._selectedAmount
        },
        success: (oData) => {
          sap.ui.core.BusyIndicator.hide();

          if (oData && typeof oData === "string") {
            // ✅ open PayPal checkout page
            window.open(oData, "_blank");
            MessageToast.show("Redirecting to PayPal...");

            // ✅ refresh balance in UI after initiating top-up
            this.refreshBalance();
          } else {
            MessageBox.warning("No PayPal URL returned.");
          }
        },
        error: (oError) => {
          sap.ui.core.BusyIndicator.hide();
          console.error(oError);
          MessageBox.error("Top-up failed.");
        }
      });
    }

  });
});
