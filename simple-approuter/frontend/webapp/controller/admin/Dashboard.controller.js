sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function(Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("coffeex.controller.admin.Dashboard", {
        onInit: function() {
            // Initialize the view model
            const viewModel = new JSONModel({
                monthlyOrders: [],
                totalOrders: 0,
                avgOrdersPerMonth: 0,
                totalRevenue: 0
            });
            this.getView().setModel(viewModel);
            
            // Load the data
            this.loadMonthlyOrders();
        },
        
        loadMonthlyOrders: function() {
            // Fetch all coffee transactions
            jQuery.ajax({
                url: "/backend/odata/v4/CoffeeTx?$expand=user,machine&$orderby=createdAt",
                method: "GET",
                success: (data) => {
                    const transactions = data.value || [];
                    
                    // Process monthly data
                    const monthlyData = this._processMonthlyData(transactions);
                    
                    // Update the model
                    const viewModel = this.getView().getModel();
                    viewModel.setData({
                        monthlyOrders: monthlyData.chartData,
                        totalOrders: monthlyData.totalOrders,
                        avgOrdersPerMonth: monthlyData.avgOrdersPerMonth,
                        totalRevenue: monthlyData.totalRevenue
                    });
                    
                    // Update chart properties
                    this._updateChartProperties();
                },
                error: (xhr) => {
                    console.error("Failed to load orders:", xhr);
                    MessageToast.show("Failed to load order data");
                }
            });
        },
        
        _processMonthlyData: function(transactions) {
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                              "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            
            // Initialize monthly counters for last 12 months
            const monthlyMap = new Map();
            const now = new Date();
            
            // Initialize last 12 months
            for (let i = 11; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                const label = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
                monthlyMap.set(key, { 
                    month: label, 
                    orders: 0, 
                    revenue: 0,
                    sortKey: key 
                });
            }
            
            // Count orders by month
            let totalRevenue = 0;
            transactions.forEach(tx => {
                if (tx.createdAt) {
                    const date = new Date(tx.createdAt);
                    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    
                    if (monthlyMap.has(key)) {
                        const monthData = monthlyMap.get(key);
                        monthData.orders++;
                        monthData.revenue += parseFloat(tx.price || 0);
                    }
                    
                    totalRevenue += parseFloat(tx.price || 0);
                }
            });
            
            // Convert to array and sort
            const chartData = Array.from(monthlyMap.values())
                .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
                .map(item => ({
                    month: item.month,
                    orders: item.orders
                }));
            
            const totalOrders = transactions.length;
            const avgOrdersPerMonth = Math.round(totalOrders / 12);
            
            return {
                chartData,
                totalOrders,
                avgOrdersPerMonth,
                totalRevenue: totalRevenue.toFixed(2)
            };
        },
        
        _updateChartProperties: function() {
            const vizFrame = this.byId("idVizFrame");
            if (vizFrame) {
                vizFrame.setVizProperties({
                    plotArea: {
                        colorPalette: ['#5899DA'],
                        dataLabel: {
                            visible: true,
                            showTotal: false
                        }
                    },
                    valueAxis: {
                        title: {
                            visible: true,
                            text: "Number of Orders"
                        }
                    },
                    categoryAxis: {
                        title: {
                            visible: true,
                            text: "Month"
                        }
                    },
                    title: {
                        visible: false
                    }
                });
            }
        },
        
        onNavBack: function() {
            this.getOwnerComponent().getRouter().navTo("adminHome");
        }
    });
}); 