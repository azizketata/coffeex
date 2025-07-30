sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
], function(Controller, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return Controller.extend("coffeex.controller.user.Home", {
        onInit: function() {
            // Initialize view model
            const viewModel = new JSONModel({
                hours: new Date().getHours(),
                todayCount: 0,
                machineStatus: "online",
                beansLevel: 75,
                selectedSize: "single"
            });
            this.getView().setModel(viewModel);

            // Refresh balance on load
            this.refreshBalance();
            this.loadTodayCount();
            this.checkMachineStatus();
        },

        refreshBalance: function() {
            const userModel = this.getOwnerComponent().getModel("user");
            const userId = userModel.getProperty("/userId");
            
            if (!userId) return;

            // Fetch latest user data
            jQuery.ajax({
                url: `/backend/odata/v4/Users('${userId}')`,
                method: "GET",
                success: (data) => {
                    userModel.setProperty("/balance", data.balance);
                },
                error: (xhr) => {
                    console.error("Failed to refresh balance:", xhr);
                }
            });
        },

        loadTodayCount: function() {
            const userModel = this.getOwnerComponent().getModel("user");
            const userId = userModel.getProperty("/userId");
            
            if (!userId) return;

            // Get today's coffee count - using timestamp range for today
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
            
            const startISO = startOfDay.toISOString();
            const endISO = endOfDay.toISOString();
            
            jQuery.ajax({
                url: `/backend/odata/v4/CoffeeTx?$filter=userId eq '${userId}' and timestamp ge ${startISO} and timestamp lt ${endISO}&$count=true`,
                method: "GET",
                success: (data) => {
                    this.getView().getModel().setProperty("/todayCount", data["@odata.count"] || 0);
                },
                error: (xhr) => {
                    console.error("Failed to load today's count:", xhr);
                    // Set to 0 if error
                    this.getView().getModel().setProperty("/todayCount", 0);
                }
            });
        },

        checkMachineStatus: function() {
            // Check if there are any machines
            jQuery.ajax({
                url: "/backend/odata/v4/Machines",
                method: "GET",
                success: (data) => {
                    if (data.value && data.value.length > 0) {
                        this.getView().getModel().setProperty("/machineStatus", "online");
                        // Simulate beans level - in real app this would come from machine
                        this.getView().getModel().setProperty("/beansLevel", Math.floor(Math.random() * 100));
                    } else {
                        this.getView().getModel().setProperty("/machineStatus", "offline");
                    }
                }
            });
        },

        onNavHome: function() {
            // Already on home
        },

        onNavProfile: function() {
            this.getOwnerComponent().getRouter().navTo("userProfile");
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

        onSelectSingle: function() {
            this.getView().getModel().setProperty("/selectedSize", "single");
            MessageToast.show("Single shot selected");
        },

        onSelectDouble: function() {
            this.getView().getModel().setProperty("/selectedSize", "double");
            MessageToast.show("Double shot selected");
        },

        onOrderCoffee: function() {
            const userModel = this.getOwnerComponent().getModel("user");
            const userId = userModel.getProperty("/userId");
            const balance = userModel.getProperty("/balance");

            if (balance < 1) {
                MessageBox.error("Insufficient balance. Please top up first.");
                return;
            }

            sap.ui.core.BusyIndicator.show(0);

            // Get first available machine
            jQuery.ajax({
                url: "/backend/odata/v4/Machines?$top=1",
                method: "GET",
                success: (data) => {
                    if (!data.value || data.value.length === 0) {
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.error("No coffee machine available.");
                        return;
                    }

                    const machineId = data.value[0].machineId;

                    // Call Tap action
                    jQuery.ajax({
                        url: "/backend/odata/v4/Tap",
                        method: "POST",
                        contentType: "application/json",
                        data: JSON.stringify({
                            machineId: machineId,
                            userId: userId
                        }),
                        success: () => {
                            sap.ui.core.BusyIndicator.hide();
                            MessageToast.show("☕ Coffee ordered successfully!");
                            this.refreshBalance();
                            this.loadTodayCount();
                        },
                        error: (xhr) => {
                            sap.ui.core.BusyIndicator.hide();
                            const error = xhr.responseJSON?.error?.message || "Failed to order coffee";
                            MessageBox.error(error);
                        }
                    });
                },
                error: () => {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error("Failed to connect to coffee machine.");
                }
            });
        },

        onTopUpBalance: function() {
            // Create a simple dialog for top-up
            if (!this._topUpDialog) {
                this._topUpDialog = new sap.m.Dialog({
                    title: "Top Up Balance",
                    content: [
                        new sap.m.VBox({
                            items: [
                                new sap.m.Text({ text: "Select amount to add:" }).addStyleClass("sapUiSmallMarginBottom"),
                                new sap.m.HBox({
                                    items: [
                                        new sap.m.Button({ text: "€5", press: () => this._topUp(5) }).addStyleClass("sapUiTinyMarginEnd"),
                                        new sap.m.Button({ text: "€10", press: () => this._topUp(10) }).addStyleClass("sapUiTinyMarginEnd"),
                                        new sap.m.Button({ text: "€20", press: () => this._topUp(20) })
                                    ]
                                })
                            ]
                        }).addStyleClass("sapUiContentPadding")
                    ],
                    endButton: new sap.m.Button({
                        text: "Cancel",
                        press: () => this._topUpDialog.close()
                    })
                });
            }
            this._topUpDialog.open();
        },

        _topUp: function(amount) {
            const userId = this.getOwnerComponent().getModel("user").getProperty("/userId");
            
            sap.ui.core.BusyIndicator.show(0);
            
            jQuery.ajax({
                url: "/backend/odata/v4/TopUp",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify({
                    amount: amount
                }),
                success: (data) => {
                    sap.ui.core.BusyIndicator.hide();
                    this._topUpDialog.close();
                    
                    if (data.value) {
                        // Redirect to PayPal
                        window.open(data.value, "_blank");
                        MessageToast.show("Redirecting to PayPal...");
                        
                        // Refresh balance after a delay
                        setTimeout(() => this.refreshBalance(), 5000);
                    }
                },
                error: (xhr) => {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error("Top-up failed. Please try again.");
                }
            });
        },

        onTerms: function() {
            MessageToast.show("Terms of Service");
        }
    });
}); 