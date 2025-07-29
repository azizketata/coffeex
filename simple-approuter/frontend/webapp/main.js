sap.ui.define([
    "sap/m/App",
    "sap/m/Page",
    "sap/m/Title",
    "sap/m/MessageToast",
    "sap/m/VBox",
    "sap/m/Text"
], function(App, Page, Title, MessageToast, VBox, Text) {
    "use strict";

    // Try to get current user
    jQuery.ajax({
        url: "/backend/odata/v4/getCurrentUser()",
        method: "GET",
        success: function(data) {
            // User is authenticated
            const displayName = data.displayName || data.email || "User";
            
            // Create a simple welcome page
            const app = new App({
                pages: [
                    new Page({
                        title: "CoffeeX",
                        content: [
                            new VBox({
                                alignItems: "Center",
                                justifyContent: "Center",
                                height: "100%",
                                items: [
                                    new Title({
                                        text: `Welcome, ${displayName}!`,
                                        level: "H1"
                                    }),
                                    new Text({
                                        text: "You have successfully logged in to CoffeeX."
                                    })
                                ]
                            })
                        ]
                    })
                ]
            });
            
            app.placeAt("content");
            MessageToast.show("Login successful!");
        },
        error: function(xhr) {
            // Not authenticated - show error
            const app = new App({
                pages: [
                    new Page({
                        title: "CoffeeX - Authentication Required",
                        content: [
                            new VBox({
                                alignItems: "Center",
                                justifyContent: "Center",
                                height: "100%",
                                items: [
                                    new Text({
                                        text: "Authentication required. Please refresh the page to login."
                                    })
                                ]
                            })
                        ]
                    })
                ]
            });
            
            app.placeAt("content");
        }
    });
}); 