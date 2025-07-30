sap.ui.define([
    "sap/ui/core/mvc/Controller"
], function(Controller) {
    "use strict";

    return Controller.extend("coffeex.controller.user.Profile", {
        onNavBack: function() {
            this.getOwnerComponent().getRouter().navTo("userHome");
        }
    });
}); 