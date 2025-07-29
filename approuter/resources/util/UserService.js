sap.ui.define([
  "sap/ui/base/Object"
], function (BaseObject) {
  "use strict";

  return BaseObject.extend("coffee-frontend.util.UserService", {
    
    _userData: null,
    
    // Get current user from backend
    getCurrentUser: function() {
      const that = this;
      
      return new Promise((resolve, reject) => {
        // Check if we already have user data
        if (this._userData) {
          return resolve(this._userData);
        }
        
        // Try to get from localStorage first for immediate display
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            that._userData = userData;
            // Don't resolve yet, still try to get fresh data
          } catch (e) {
            console.warn("Invalid stored user data");
          }
        }
        
        // Wait a bit for model to be ready
        setTimeout(() => {
          // Get the OData model - try multiple ways
          let oModel = null;
          
          // Try from the component
          const oComponent = sap.ui.getCore().getComponent("container-coffee-frontend");
          if (oComponent) {
            oModel = oComponent.getModel();
          }
          
          // Try from the core
          if (!oModel) {
            const models = sap.ui.getCore().byId("__component0")?.getModel();
            if (models) oModel = models;
          }
          
          if (!oModel) {
            console.error("No OData model found!");
            // Return stored user or demo user
            if (that._userData) {
              resolve(that._userData);
            } else {
              resolve({
                userId: "demo@example.com",
                email: "demo@example.com",
                displayName: "Demo User",
                firstName: "Demo",
                lastName: "User"
              });
            }
            return;
          }
          
          // Call the backend function
          console.log("Calling backend getCurrentUser function...");
          oModel.callFunction("/getCurrentUser", {
            method: "GET",
            success: function(oData) {
              console.log("✅ User data received from backend:", oData);
              
              const userData = oData.getCurrentUser || oData;
              
              // Store in memory and localStorage
              that._userData = userData;
              localStorage.setItem("user", JSON.stringify(userData));
              
              resolve(userData);
            },
            error: function(oError) {
              console.error("❌ Failed to get user info from backend:", oError);
              
              // Check if it's an auth error
              if (oError.statusCode === 401) {
                console.error("Not authenticated!");
                reject(new Error("Not authenticated"));
                return;
              }
              
              // Try stored user data
              if (that._userData) {
                resolve(that._userData);
              } else {
                reject(new Error("Failed to get user data"));
              }
            }
          });
        }, 500); // Wait 500ms for model initialization
      });
    },
    
    // Clear user data on logout
    clearUser: function() {
      this._userData = null;
      localStorage.removeItem("user");
    }
  });
}); 