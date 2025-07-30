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

            // For now, just set to 0 to avoid the error
            // TODO: Implement proper coffee count when CoffeeTx filtering is fixed in backend
            this.getView().getModel().setProperty("/todayCount", 0);
            
            // Note: The CoffeeTx entity might not support complex filtering
            // or the timestamp field might have a different name
            // Check with backend API documentation
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
                },
                error: (xhr) => {
                    console.error("Failed to check machines:", xhr);
                    this.getView().getModel().setProperty("/machineStatus", "offline");
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
            const selectedSize = this.getView().getModel().getProperty("/selectedSize");
            
            // Check if double shot selected
            const isDouble = selectedSize === "double";
            const price = isDouble ? 3.0 : 1.5;

            if (balance < price) {
                MessageBox.error(`Insufficient balance. You need €${price.toFixed(2)} for a ${selectedSize} shot. Please top up first.`);
                return;
            }

            sap.ui.core.BusyIndicator.show(0);

            // First fetch CSRF token
            jQuery.ajax({
                url: "/backend/odata/v4/",
                method: "GET",
                headers: {
                    "X-CSRF-Token": "Fetch"
                },
                success: (data, textStatus, xhr) => {
                    const csrfToken = xhr.getResponseHeader("X-CSRF-Token");
                    
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

                            // Call Tap action with coffeeType and CSRF token
                            jQuery.ajax({
                                url: "/backend/odata/v4/Tap",
                                method: "POST",
                                contentType: "application/json",
                                headers: {
                                    "X-CSRF-Token": csrfToken
                                },
                                data: JSON.stringify({
                                    machineId: machineId,
                                    userId: userId,
                                    coffeeType: isDouble ? "DOUBLE" : "NORMAL"
                                }),
                                success: () => {
                                    sap.ui.core.BusyIndicator.hide();
                                    MessageToast.show(`☕ ${selectedSize} shot ordered successfully!`);
                                    this.refreshBalance();
                                    
                                    // Update today count manually
                                    const currentCount = this.getView().getModel().getProperty("/todayCount");
                                    this.getView().getModel().setProperty("/todayCount", currentCount + 1);
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
                error: () => {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error("Failed to fetch CSRF token.");
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
            sap.ui.core.BusyIndicator.show(0);
            
            // First fetch CSRF token
            jQuery.ajax({
                url: "/backend/odata/v4/",
                method: "GET",
                headers: {
                    "X-CSRF-Token": "Fetch"
                },
                success: (data, textStatus, xhr) => {
                    const csrfToken = xhr.getResponseHeader("X-CSRF-Token");
                    
                    jQuery.ajax({
                        url: "/backend/odata/v4/TopUp",
                        method: "POST",
                        contentType: "application/json",
                        headers: {
                            "X-CSRF-Token": csrfToken
                        },
                        data: JSON.stringify({
                            amount: amount
                        }),
                        success: (data) => {
                            sap.ui.core.BusyIndicator.hide();
                            this._topUpDialog.close();
                            
                            // The backend returns a string (PayPal URL) directly
                            const paypalUrl = data.value || data;
                            if (paypalUrl) {
                                // Redirect to PayPal
                                window.open(paypalUrl, "_blank");
                                MessageToast.show("Redirecting to PayPal...");
                                
                                // Show message about checking balance
                                MessageBox.information("Please complete the payment in PayPal. Your balance will be updated once the payment is confirmed.");
                                
                                // Refresh balance periodically
                                const refreshInterval = setInterval(() => {
                                    this.refreshBalance();
                                }, 3000);
                                
                                // Stop refreshing after 30 seconds
                                setTimeout(() => clearInterval(refreshInterval), 30000);
                            }
                        },
                        error: (xhr) => {
                            sap.ui.core.BusyIndicator.hide();
                            const error = xhr.responseJSON?.error?.message || "Top-up failed. Please try again.";
                            MessageBox.error(error);
                        }
                    });
                },
                error: () => {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error("Failed to fetch CSRF token.");
                }
            });
        },

        onTerms: function() {
            MessageToast.show("Terms of Service");
        }
    });
}); 