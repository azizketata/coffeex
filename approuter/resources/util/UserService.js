sap.ui.define([
  "sap/ui/base/Object"
], function (BaseObject) {
  "use strict";

  return BaseObject.extend("coffee-frontend.util.UserService", {
    
    _userData: null,
    
    // Get current user from XSUAA
    getCurrentUser: function() {
      const that = this;
      
      return new Promise((resolve, reject) => {
        // Check if we already have user data
        if (this._userData) {
          return resolve(this._userData);
        }
        
        // Fetch from userapi
        jQuery.ajax({
          url: "/user-api/currentUser",
          type: "GET",
          success: function(data) {
            console.log("User data received:", data);
            
            // Map XSUAA user data to our format
            const userData = {
              userId: data.email || data.name, // Use email as userId
              email: data.email,
              firstName: data.firstname || data.givenName || "",
              lastName: data.lastname || data.familyName || "",
              displayName: data.name || data.firstname || "User"
            };
            
            // Store in memory and localStorage
            that._userData = userData;
            localStorage.setItem("user", JSON.stringify(userData));
            
            resolve(userData);
          },
          error: function(xhr, status, error) {
            console.error("Failed to get user info:", error);
            
            // Try to get from localStorage as fallback
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
              const userData = JSON.parse(storedUser);
              that._userData = userData;
              resolve(userData);
            } else {
              reject(new Error("Not authenticated"));
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