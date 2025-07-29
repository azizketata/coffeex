sap.ui.define([
  "sap/ui/core/UIComponent",
  "sap/ui/Device",
  "coffee-frontend/model/models",
  "coffee-frontend/util/UserService",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast"
], function (UIComponent, Device, models, UserService, JSONModel, MessageToast) {
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
      
      // Set a temporary empty user model to prevent errors
      const emptyUserModel = new JSONModel({
        userId: null,
        email: null,
        displayName: "Loading...",
        firstName: "",
        lastName: ""
      });
      this.setModel(emptyUserModel, "user");
      
      // Get authenticated user data
      this._userService.getCurrentUser()
        .then(function(userData) {
          console.log("User initialized:", userData);
          
          // Update the user model with real data
          const userModel = that.getModel("user");
          userModel.setData(userData);
          
          // Refresh the model to trigger bindings
          userModel.refresh();
        })
        .catch(function(error) {
          console.error("Failed to initialize user:", error);
          
          // Check if we're authenticated at all
          // If not, the approuter should redirect to login automatically
          // But we can show a message
          MessageToast.show("Authentication required. Please refresh the page.");
          
          // Set a default user for demo purposes
          const userModel = that.getModel("user");
          userModel.setData({
            userId: "demo@example.com",
            email: "demo@example.com", 
            displayName: "Demo User",
            firstName: "Demo",
            lastName: "User"
          });
        });
    },
    
    getUserService: function() {
      return this._userService;
    }
  });
});
