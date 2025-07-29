sap.ui.define([
  "sap/ui/base/Object"
], function (BaseObject) {
  "use strict";

  return BaseObject.extend("coffee-frontend.util.MockUserService", {
    
    getCurrentUser: function() {
      return new Promise((resolve) => {
        // For now, create a mock user based on a simple ID
        // In production, this would come from the backend or userapi
        const mockUser = {
          userId: "user@sap.com",
          email: "user@sap.com",
          firstName: "SAP",
          lastName: "User",
          displayName: "SAP User"
        };
        
        // Store in localStorage
        localStorage.setItem("user", JSON.stringify(mockUser));
        
        // Simulate async call
        setTimeout(() => {
          resolve(mockUser);
        }, 100);
      });
    },
    
    clearUser: function() {
      localStorage.removeItem("user");
    }
  });
}); 