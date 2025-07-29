sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/Device",
  "coffee-frontend/model/models",
  "coffee-frontend/util/UserService",
  "sap/ui/model/json/JSONModel"
], function (UIComponent, Device, models, UserService, JSONModel) {
  "use strict";

  return UIComponent.extend("coffee-frontend.Component", {
    metadata: {
      manifest: "json"
    },

    init: function () {
      // call the base component's init function
      UIComponent.prototype.init.apply(this, arguments);

      // Create user service instance
      this._userService = new UserService();
      
      // Initialize user data
      this._initializeUser();

      // enable routing
      this.getRouter().initialize();
    },
    
    _initializeUser: function() {
      const that = this;
      
      // Get authenticated user data
      this._userService.getCurrentUser()
        .then(function(userData) {
          console.log("User initialized:", userData);
          
          // Create a global user model
          const userModel = new JSONModel(userData);
          that.setModel(userModel, "user");
          
          // Navigate to home
          that.getRouter().navTo("home");
        })
        .catch(function(error) {
          console.error("Failed to initialize user:", error);
          // If not authenticated, the approuter should handle this
          // But we can show an error or redirect to login
        });
    },
    
    getUserService: function() {
      return this._userService;
    }
  });
});
