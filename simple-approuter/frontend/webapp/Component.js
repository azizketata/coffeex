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

        init: function() {
            // Call parent init
            UIComponent.prototype.init.apply(this, arguments);

            // Initialize router
            this.getRouter().initialize();

            // Check user authentication and role
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
                            if (userDetails.role === "Admin") {
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