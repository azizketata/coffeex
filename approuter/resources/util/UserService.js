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
        
        // Get the OData model from the component
        const oModel = sap.ui.getCore().getComponent("container-coffee-frontend").getModel();
        
        if (!oModel) {
          // Try localStorage as fallback
          const storedUser = localStorage.getItem("user");
          if (storedUser) {
            const userData = JSON.parse(storedUser);
            that._userData = userData;
            resolve(userData);
          } else {
            reject(new Error("No model available"));
          }
          return;
        }
        
        // Call the backend function
        oModel.callFunction("/getCurrentUser", {
          method: "GET",
          success: function(oData) {
            console.log("User data received from backend:", oData);
            
            const userData = oData.getCurrentUser;
            
            // Store in memory and localStorage
            that._userData = userData;
            localStorage.setItem("user", JSON.stringify(userData));
            
            resolve(userData);
          },
          error: function(oError) {
            console.error("Failed to get user info from backend:", oError);
            
            // Try to get from localStorage as fallback
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
              const userData = JSON.parse(storedUser);
              that._userData = userData;
              resolve(userData);
            } else {
              reject(new Error("Failed to get user data"));
            }
          }
        });
      });
    },
    
    // Clear user data on logout
    clearUser: function() {
      this._userData = null;
      localStorage.removeItem("user");
    }
  });
}); 