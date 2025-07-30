sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function(Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("coffeex.controller.admin.Home", {
        onInit: function() {
            // Initialize view model
            const viewModel = new JSONModel({
                totalUsers: 0,
                totalMachines: 0,
                todaySales: 0
            });
            this.getView().setModel(viewModel);

            // Load stats
            this.loadStats();
        },

        loadStats: function() {
            // Load total users
            jQuery.ajax({
                url: "/backend/odata/v4/Users?$count=true&$top=0",
                method: "GET",
                success: (data) => {
                    this.getView().getModel().setProperty("/totalUsers", data["@odata.count"] || 0);
                },
                error: (xhr) => {
                    console.error("Failed to load users count:", xhr);
                }
            });

            // Load total machines
            jQuery.ajax({
                url: "/backend/odata/v4/Machines?$count=true&$top=0",
                method: "GET",
                success: (data) => {
                    this.getView().getModel().setProperty("/totalMachines", data["@odata.count"] || 0);
                },
                error: (xhr) => {
                    console.error("Failed to load machines count:", xhr);
                }
            });

            // For now, show estimated sales
            // TODO: Implement proper sales calculation when backend supports date filtering
            this.getView().getModel().setProperty("/todaySales", "42.50");
        },

        onNavHome: function() {
            // Already on home
        },

        onNavDashboard: function() {
            this.getOwnerComponent().getRouter().navTo("adminDashboard");
        },

        onLogout: function() {
            MessageBox.confirm("Are you sure you want to logout?", {
                onClose: (action) => {
                    if (action === MessageBox.Action.OK) {
                        window.location.href = "/logout";
                    }
                }
            });
        }
    });
}); 