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

            // Initialize machines model
            const machinesModel = new JSONModel({ machines: [] });
            this.getView().setModel(machinesModel, "machines");

            // Load stats and machines
            this.loadStats();
            this.loadMachines();
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
        },

        loadMachines: function() {
            jQuery.ajax({
                url: "/backend/odata/v4/Machines",
                method: "GET",
                success: (data) => {
                    const machines = data.value || [];
                    // Add newBeanLevel property to each machine for input binding
                    machines.forEach(machine => {
                        machine.newBeanLevel = null;
                    });
                    this.getView().getModel("machines").setData({ machines: machines });
                },
                error: (xhr) => {
                    console.error("Failed to load machines:", xhr);
                    MessageToast.show("Failed to load machines");
                }
            });
        },

        onRefreshMachines: function() {
            this.loadMachines();
            MessageToast.show("Machines refreshed");
        },

        onUpdateBeanLevel: function(oEvent) {
            const oSource = oEvent.getSource();
            const oContext = oSource.getBindingContext("machines");
            const machine = oContext.getObject();
            
            const newLevel = parseInt(machine.newBeanLevel);
            
            if (isNaN(newLevel) || newLevel < 0) {
                MessageBox.error("Please enter a valid bean level (non-negative number)");
                return;
            }

            // First fetch CSRF token
            jQuery.ajax({
                url: "/backend/odata/v4/",
                method: "GET",
                headers: {
                    "X-CSRF-Token": "Fetch"
                },
                success: (data, textStatus, xhr) => {
                    const csrfToken = xhr.getResponseHeader("X-CSRF-Token");
                    
                    // Update the machine
                    jQuery.ajax({
                        url: `/backend/odata/v4/Machines('${machine.machineId}')`,
                        method: "PATCH",
                        headers: {
                            "X-CSRF-Token": csrfToken
                        },
                        contentType: "application/json",
                        data: JSON.stringify({
                            beanLevel: newLevel
                        }),
                        success: () => {
                            MessageToast.show(`Bean level updated for ${machine.location}`);
                            // Clear the input
                            machine.newBeanLevel = null;
                            // Reload machines to get fresh data
                            this.loadMachines();
                        },
                        error: (xhr) => {
                            console.error("Failed to update bean level:", xhr);
                            MessageBox.error("Failed to update bean level");
                        }
                    });
                },
                error: (xhr) => {
                    console.error("Failed to fetch CSRF token:", xhr);
                    MessageBox.error("Failed to fetch security token");
                }
            });
        },

        onRefill1kg: function(oEvent) {
            const oSource = oEvent.getSource();
            const oContext = oSource.getBindingContext("machines");
            const machine = oContext.getObject();
            
            const newLevel = machine.beanLevel + 1000; // Add 1kg (1000g)

            // First fetch CSRF token
            jQuery.ajax({
                url: "/backend/odata/v4/",
                method: "GET",
                headers: {
                    "X-CSRF-Token": "Fetch"
                },
                success: (data, textStatus, xhr) => {
                    const csrfToken = xhr.getResponseHeader("X-CSRF-Token");
                    
                    // Update the machine
                    jQuery.ajax({
                        url: `/backend/odata/v4/Machines('${machine.machineId}')`,
                        method: "PATCH",
                        headers: {
                            "X-CSRF-Token": csrfToken
                        },
                        contentType: "application/json",
                        data: JSON.stringify({
                            beanLevel: newLevel
                        }),
                        success: () => {
                            MessageToast.show(`Added 1kg beans to ${machine.location}`);
                            // Reload machines to get fresh data
                            this.loadMachines();
                        },
                        error: (xhr) => {
                            console.error("Failed to refill beans:", xhr);
                            MessageBox.error("Failed to refill beans");
                        }
                    });
                },
                error: (xhr) => {
                    console.error("Failed to fetch CSRF token:", xhr);
                    MessageBox.error("Failed to fetch security token");
                }
            });
        }
    });
}); 