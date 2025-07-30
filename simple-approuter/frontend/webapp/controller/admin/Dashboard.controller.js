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
                totalRevenue: 0,
                selectedMachine: "all",
                forecast: {
                    currentBeanLevel: 0,
                    estimatedBeansNextMonth: 0,
                    estimatedRefillsNeeded: 0,
                    normalCoffees: 0,
                    doubleCoffees: 0
                }
            });
            this.getView().setModel(viewModel);
            
            // Initialize machines model
            const machinesModel = new JSONModel({ machines: [] });
            this.getView().setModel(machinesModel, "machines");
            
            // Load the data
            this.loadMachines();
            this.loadMonthlyOrders();
            this.loadBeanForecast();
        },
        
        loadMonthlyOrders: function() {
            const selectedMachine = this.getView().getModel().getProperty("/selectedMachine");
            let url = "/backend/odata/v4/CoffeeTx?$expand=user,machine&$orderby=createdAt";
            
            // Add filter if specific machine is selected
            if (selectedMachine && selectedMachine !== "all") {
                url += `&$filter=machineId eq ${selectedMachine}`;
            }
            
            // Fetch coffee transactions
            jQuery.ajax({
                url: url,
                method: "GET",
                success: (data) => {
                    const transactions = data.value || [];
                    
                    // Process monthly data
                    const monthlyData = this._processMonthlyData(transactions);
                    
                    // Update the model (preserve existing data)
                    const viewModel = this.getView().getModel();
                    const currentData = viewModel.getData();
                    viewModel.setData({
                        ...currentData,
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
        
        loadMachines: function() {
            jQuery.ajax({
                url: "/backend/odata/v4/Machines",
                method: "GET",
                success: (data) => {
                    const machines = data.value || [];
                    const machineItems = [{
                        machineId: "all",
                        location: "All Machines"
                    }].concat(machines);
                    this.getView().getModel("machines").setData({ machines: machineItems });
                },
                error: (xhr) => {
                    console.error("Failed to load machines:", xhr);
                }
            });
        },
        
        loadBeanForecast: function() {
            jQuery.ajax({
                url: "/backend/odata/v4/ForecastBeans",
                method: "POST",
                contentType: "application/json",
                success: (data) => {
                    const forecasts = data.value || data || [];
                    this.forecastData = forecasts; // Store for later use
                    this._updateForecastDisplay(forecasts);
                },
                error: (xhr) => {
                    console.error("Failed to load bean forecast:", xhr);
                    MessageToast.show("Failed to load bean forecast data");
                }
            });
        },
        
        _updateForecastDisplay: function(forecasts) {
            const viewModel = this.getView().getModel();
            const selectedMachine = viewModel.getProperty("/selectedMachine");
            
            let forecastData;
            
            if (selectedMachine === "all") {
                // Aggregate data for all machines
                forecastData = {
                    currentBeanLevel: 0,
                    estimatedBeansNextMonth: 0,
                    estimatedRefillsNeeded: 0,
                    normalCoffees: 0,
                    doubleCoffees: 0
                };
                
                forecasts.forEach(f => {
                    forecastData.currentBeanLevel += f.currentBeanLevel;
                    forecastData.estimatedBeansNextMonth += f.estimatedBeansNextMonth;
                    forecastData.estimatedRefillsNeeded += f.estimatedRefillsNeeded;
                    forecastData.normalCoffees += f.normalCoffees;
                    forecastData.doubleCoffees += f.doubleCoffees;
                });
            } else {
                // Find specific machine data
                forecastData = forecasts.find(f => f.machineId === selectedMachine) || {
                    currentBeanLevel: 0,
                    estimatedBeansNextMonth: 0,
                    estimatedRefillsNeeded: 0,
                    normalCoffees: 0,
                    doubleCoffees: 0
                };
            }
            
            viewModel.setProperty("/forecast", forecastData);
        },
        
        onMachineChange: function() {
            const selectedMachine = this.getView().getModel().getProperty("/selectedMachine");
            
            // Update forecast display for selected machine
            if (this.forecastData) {
                this._updateForecastDisplay(this.forecastData);
            }
            
            // Update monthly orders chart for selected machine
            this.loadMonthlyOrders();
        },
        
        onNavBack: function() {
            this.getOwnerComponent().getRouter().navTo("adminHome");
        }
    });
}); 