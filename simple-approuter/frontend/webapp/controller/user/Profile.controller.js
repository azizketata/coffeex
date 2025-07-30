sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function(Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("coffeex.controller.user.Profile", {
        onInit: function() {
            // Initialize view model
            const viewModel = new JSONModel({
                displayName: "",
                email: "",
                balance: 0,
                transactionCount: "(0)"
            });
            this.getView().setModel(viewModel);
            
            // Load user data when view is shown
            this.getOwnerComponent().getRouter().getRoute("userProfile").attachPatternMatched(this._onRouteMatched, this);
        },
        
        _onRouteMatched: function() {
            this.loadUserData();
            this.loadTransactionCount();
        },
        
        loadUserData: function() {
            const userModel = this.getOwnerComponent().getModel("user");
            const userId = userModel.getProperty("/userId");
            
            if (!userId) return;
            
            // Fetch full user details
            jQuery.ajax({
                url: `/backend/odata/v4/Users('${userId}')`,
                method: "GET",
                success: (data) => {
                    this.getView().getModel().setProperty("/displayName", 
                        `${data.firstName || ""} ${data.lastName || ""}`.trim() || data.email);
                    this.getView().getModel().setProperty("/email", data.email);
                    this.getView().getModel().setProperty("/balance", data.balance);
                },
                error: (xhr) => {
                    console.error("Failed to load user data:", xhr);
                }
            });
        },
        
        loadTransactionCount: function() {
            const userModel = this.getOwnerComponent().getModel("user");
            const userId = userModel.getProperty("/userId");
            
            if (!userId) return;
            
            // Fetch transaction count
            jQuery.ajax({
                url: `/backend/odata/v4/CoffeeTx?$filter=userId eq '${userId}'&$count=true&$top=0`,
                method: "GET",
                success: (data) => {
                    const count = data["@odata.count"] || 0;
                    this.getView().getModel().setProperty("/transactionCount", `(${count})`);
                },
                error: (xhr) => {
                    console.error("Failed to load transaction count:", xhr);
                }
            });
        },
        
        formatCurrency: function(value) {
            return parseFloat(value || 0).toFixed(2);
        },
        
        onListItemPress: function(oEvent) {
            const oItem = oEvent.getParameter("listItem");
            const sTitle = oItem.getProperty("title");
            
            switch (sTitle) {
                case "Transaction History":
                    this.getOwnerComponent().getRouter().navTo("userHistory");
                    break;
                case "Personal Coffee Consumption":
                    MessageToast.show("Coffee consumption analytics coming soon!");
                    break;
                case "Payment Method":
                    MessageToast.show("Payment methods management coming soon!");
                    break;
                case "Data Privacy":
                    MessageToast.show("Data privacy settings coming soon!");
                    break;
                case "Feedback":
                    MessageToast.show("Feedback form coming soon!");
                    break;
            }
        },
        
        onSignOut: function() {
            MessageBox.confirm("Are you sure you want to sign out?", {
                title: "Sign Out",
                onClose: (oAction) => {
                    if (oAction === MessageBox.Action.OK) {
                        window.location.href = "/logout";
                    }
                }
            });
        },
        
        onNavBack: function() {
            this.getOwnerComponent().getRouter().navTo("userHome");
        }
    });
}); 