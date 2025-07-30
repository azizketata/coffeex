sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast"
], function(Controller, JSONModel, MessageBox, MessageToast) {
    "use strict";

    return Controller.extend("coffeex.controller.user.History", {
        onInit: function() {
            // Initialize view model
            const viewModel = new JSONModel({
                transactions: [],
                totalAmount: "0.00"
            });
            this.getView().setModel(viewModel);
            
            // Load data when view is shown
            this.getOwnerComponent().getRouter().getRoute("userHistory").attachPatternMatched(this._onRouteMatched, this);
        },
        
        _onRouteMatched: function() {
            this.loadTransactions();
        },
        
        loadTransactions: function() {
            const userModel = this.getOwnerComponent().getModel("user");
            const userId = userModel.getProperty("/userId");
            
            if (!userId) return;
            
            // Fetch user's transactions with machine details
            jQuery.ajax({
                url: `/backend/odata/v4/CoffeeTx?$filter=userId eq '${userId}'&$expand=machine&$orderby=createdAt desc`,
                method: "GET",
                success: (data) => {
                    const transactions = data.value || [];
                    
                    // Calculate total amount
                    const total = transactions.reduce((sum, tx) => sum + (tx.price || 0), 0);
                    
                    this.getView().getModel().setData({
                        transactions: transactions,
                        totalAmount: total.toFixed(2)
                    });
                },
                error: (xhr) => {
                    console.error("Failed to load transactions:", xhr);
                    MessageToast.show("Failed to load transaction history");
                }
            });
        },
        
        formatTitle: function(coffeeType, createdAt) {
            const type = coffeeType === 'DOUBLE' ? 'Double Shot' : 'Normal Shot';
            const date = new Date(createdAt);
            const dateStr = date.toLocaleDateString();
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return `${type} - ${dateStr} ${timeStr}`;
        },
        
        formatLocation: function(location) {
            return location || "Unknown location";
        },
        
        formatPrice: function(price) {
            return `€${parseFloat(price || 0).toFixed(2)}`;
        },
        
        formatPaymentState: function(status) {
            switch(status) {
                case 'PAID':
                    return 'Success';
                case 'OPEN':
                    return 'Warning';
                case 'FAILED':
                    return 'Error';
                default:
                    return 'None';
            }
        },
        
        onTransactionPress: function(oEvent) {
            const source = oEvent.getSource();
            const txId = source.data("txId");
            const transaction = this.getView().getModel().getProperty(source.getBindingContextPath());
            
            // Show transaction details
            MessageBox.information(
                `Transaction Details:\n\n` +
                `Type: ${transaction.coffeeType === 'DOUBLE' ? 'Double Shot' : 'Normal Shot'}\n` +
                `Price: €${transaction.price}\n` +
                `Machine: ${transaction.machine?.location || 'Unknown'}\n` +
                `Beans Used: ${transaction.beansUsed || 7}g\n` +
                `Payment Status: ${transaction.paymentStatus}\n` +
                `Date: ${new Date(transaction.createdAt).toLocaleString()}`,
                {
                    title: "Transaction Details"
                }
            );
        },
        
        onNavBack: function() {
            this.getOwnerComponent().getRouter().navTo("userProfile");
        }
    });
});