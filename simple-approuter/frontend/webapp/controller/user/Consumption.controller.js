sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function(Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("coffeex.controller.user.Consumption", {
        onInit: function() {
            // Initialize the view model
            const viewModel = new JSONModel({
                monthlyData: [],
                totalCoffees: 0,
                monthlyAverage: 0,
                totalSpent: 0,
                normalCount: 0,
                doubleCount: 0
            });
            this.getView().setModel(viewModel);
            
            // Load data when view is shown
            this.getOwnerComponent().getRouter().getRoute("userConsumption").attachPatternMatched(this._onRouteMatched, this);
        },
        
        _onRouteMatched: function() {
            this.loadConsumptionData();
        },
        
        loadConsumptionData: function() {
            const userModel = this.getOwnerComponent().getModel("user");
            const userId = userModel.getProperty("/userId");
            
            if (!userId) {
                MessageToast.show("User not found");
                return;
            }
            
            // Fetch user's coffee transactions
            jQuery.ajax({
                url: `/backend/odata/v4/CoffeeTx?$filter=userId eq '${userId}'&$orderby=createdAt`,
                method: "GET",
                success: (data) => {
                    const transactions = data.value || [];
                    this._processConsumptionData(transactions);
                },
                error: (xhr) => {
                    console.error("Failed to load consumption data:", xhr);
                    MessageToast.show("Failed to load consumption data");
                }
            });
        },
        
        _processConsumptionData: function(transactions) {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            
            // Initialize monthly data for last 12 months
            const monthlyMap = new Map();
            const now = new Date();
            
            for (let i = 11; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
                monthlyMap.set(key, { 
                    month: label, 
                    orders: 0
                });
            }
            
            // Process transactions
            let totalSpent = 0;
            let normalCount = 0;
            let doubleCount = 0;
            
            transactions.forEach(tx => {
                if (tx.createdAt) {
                    const date = new Date(tx.createdAt);
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    
                    if (monthlyMap.has(key)) {
                        monthlyMap.get(key).orders++;
                    }
                    
                    totalSpent += parseFloat(tx.price || 0);
                    
                    if (tx.coffeeType === 'DOUBLE') {
                        doubleCount++;
                    } else {
                        normalCount++;
                    }
                }
            });
            
            // Convert to array and calculate averages
            const monthlyData = Array.from(monthlyMap.values());
            const totalCoffees = transactions.length;
            const monthlyAverage = Math.round(totalCoffees / 12);
            
            // Update model
            this.getView().getModel().setData({
                monthlyData: monthlyData,
                totalCoffees: totalCoffees,
                monthlyAverage: monthlyAverage,
                totalSpent: totalSpent.toFixed(2),
                normalCount: normalCount,
                doubleCount: doubleCount
            });
            
            // Update chart properties
            this._updateChartProperties();
        },
        
        _updateChartProperties: function() {
            const vizFrame = this.byId("idVizFrame");
            if (vizFrame) {
                vizFrame.setVizProperties({
                    plotArea: {
                        colorPalette: ['#6b3d00'],
                        dataLabel: {
                            visible: true
                        }
                    },
                    valueAxis: {
                        title: {
                            visible: true,
                            text: "Number of Coffees"
                        }
                    },
                    categoryAxis: {
                        title: {
                            visible: true,
                            text: "Month"
                        }
                    },
                    title: {
                        visible: true,
                        text: "Monthly Coffee Consumption"
                    }
                });
            }
        },
        
        onNavBack: function() {
            this.getOwnerComponent().getRouter().navTo("userProfile");
        }
    });
});