sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
], function(UIComponent, JSONModel, MessageBox) {
    "use strict";

    return UIComponent.extend("coffeex.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {

            // Extract machineId from URL (e.g. ?machineId=...)
            const urlParams = new URLSearchParams(window.location.search);
            const machineId = urlParams.get("machineId");

            if (machineId) {
                // Set machine model globally
                const machineModel = new sap.ui.model.json.JSONModel({ machineId });
                this.setModel(machineModel, "machine");

                // Store machine ID locally for fallback/reference
                localStorage.setItem("machineId", machineId);

                console.log("Machine ID extracted and stored:", machineId);

            } else {
                // Optional fallback: try loading from localStorage
                const storedId = localStorage.getItem("machineId");
                if (storedId) {
                    const fallbackModel = new sap.ui.model.json.JSONModel({ machineId: storedId });
                    this.setModel(fallbackModel, "machine");
                    console.log("Machine ID loaded from localStorage:", storedId);
                } else {
                    console.warn("⚠️ No machineId found in URL or localStorage.");
                }
            }

            // Call parent init
            UIComponent.prototype.init.apply(this, arguments);

            // Initialize router
            this.getRouter().initialize();

            // Check user authentication and route
            this._checkUserAndRoute();
        },

        _checkUserAndRoute: function() {
            // Get current user from backend
            jQuery.ajax({
                url: "/backend/odata/v4/getCurrentUser()",
                method: "GET",
                success: (userData) => {
                    // Set user model
                    const userModel = new JSONModel(userData);
                    this.setModel(userModel, "user");

                    // Store user data
                    localStorage.setItem("user", JSON.stringify(userData));

                    // Fetch full user details to get role
                    jQuery.ajax({
                        url: `/backend/odata/v4/Users('${userData.userId}')`,
                        method: "GET",
                        success: (userDetails) => {
                            // Update user model with full details including role
                            userModel.setData({
                                ...userData,
                                ...userDetails
                            });

                            // Route based on role
                            if (userDetails.role === "admin") {
                                this.getRouter().navTo("adminHome");
                            } else {
                                this.getRouter().navTo("userHome");
                            }
                        },
                        error: (xhr) => {
                            console.error("Failed to fetch user details:", xhr);
                            // Default to user home if can't fetch role
                            this.getRouter().navTo("userHome");
                        }
                    });
                },
                error: (xhr) => {
                    console.error("User not authenticated:", xhr);
                    MessageBox.error("Authentication required. Please refresh the page.");
                }
            });
        }
    });
});