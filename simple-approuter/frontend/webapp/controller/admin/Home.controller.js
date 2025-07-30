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
                }
            });

            // Load total machines
            jQuery.ajax({
                url: "/backend/odata/v4/Machines?$count=true&$top=0",
                method: "GET",
                success: (data) => {
                    this.getView().getModel().setProperty("/totalMachines", data["@odata.count"] || 0);
                }
            });

            // Load today's sales - using timestamp range
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            
            const startISO = startOfDay.toISOString();
            const endISO = endOfDay.toISOString();
            
            jQuery.ajax({
                url: `/backend/odata/v4/CoffeeTx?$filter=timestamp ge ${startISO} and timestamp lt ${endISO}`,
                method: "GET",
                success: (data) => {
                    const totalSales = (data.value || []).reduce((sum, tx) => sum + (tx.amount || 0), 0);
                    this.getView().getModel().setProperty("/todaySales", totalSales.toFixed(2));
                },
                error: (xhr) => {
                    console.error("Failed to load today's sales:", xhr);
                    this.getView().getModel().setProperty("/todaySales", "0.00");
                }
            });
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
        },

        onCheckLowBalances: function() {
            sap.ui.core.BusyIndicator.show(0);
            
            jQuery.ajax({
                url: "/backend/odata/v4/CheckLowBalances",
                method: "POST",
                contentType: "application/json",
                success: (data) => {
                    sap.ui.core.BusyIndicator.hide();
                    const count = data.value || 0;
                    MessageBox.success(`Found ${count} users with low balance. Notifications sent.`);
                },
                error: (xhr) => {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error("Failed to check low balances.");
                }
            });
        },

        onRunForecast: function() {
            sap.ui.core.BusyIndicator.show(0);
            
            jQuery.ajax({
                url: "/backend/odata/v4/Forecast",
                method: "POST",
                contentType: "application/json",
                success: (data) => {
                    sap.ui.core.BusyIndicator.hide();
                    const days = data.value || 0;
                    MessageBox.information(`Forecast: Coffee supply will last approximately ${days} days.`);
                },
                error: (xhr) => {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error("Failed to run forecast.");
                }
            });
        },

        onBatchPayment: function() {
            MessageBox.confirm("Process batch payment for all pending transactions?", {
                onClose: (action) => {
                    if (action === MessageBox.Action.OK) {
                        sap.ui.core.BusyIndicator.show(0);
                        
                        jQuery.ajax({
                            url: "/backend/odata/v4/BatchPay",
                            method: "POST",
                            contentType: "application/json",
                            success: (data) => {
                                sap.ui.core.BusyIndicator.hide();
                                const processed = data.value || 0;
                                MessageBox.success(`Successfully processed ${processed} transactions.`);
                                this.loadStats(); // Refresh stats
                            },
                            error: (xhr) => {
                                sap.ui.core.BusyIndicator.hide();
                                MessageBox.error("Failed to process batch payment.");
                            }
                        });
                    }
                }
            });
        }
    });
}); 