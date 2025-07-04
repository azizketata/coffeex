sap.ui.define([
  "sap/ui/core/mvc/Controller"
], function (Controller) {
  "use strict";
  return Controller.extend("coffeex.controller.Login", {
    onSimulateNfcTap: function () {
      alert("Simulating NFC Tap: Login successful!");
    }
  });
});
