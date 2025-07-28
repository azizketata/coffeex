sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/Fragment",
  "sap/ui/model/json/JSONModel"
], function(Controller, Fragment, JSONModel) {
  "use strict";

  return Controller.extend("coffee-frontend.controller.History", {
    onInit: function () {
      const oView = this.getView();

      // Load navbar
      Fragment.load({
        id: oView.getId(),
        name: "coffee-frontend.view.fragment.NavigationBar",
        controller: this
      }).then(function (oFragment) {
        oView.byId("navbarContainer3").addContentLeft(oFragment);
      });

      // Dummy Data
      const aTransactions = [
        { date: "28.05.2025", amount: "EUR 10", method: "via PayPal" },
        { date: "21.05.2025", amount: "EUR 5", method: "via PayPal" },
        { date: "17.04.2025", amount: "EUR 20", method: "via PayPal" },
        { date: "26.02.2025", amount: "EUR 10", method: "via PayPal" },
        { date: "10.01.2025", amount: "EUR 10", method: "via PayPal" },
        { date: "04.12.2024", amount: "EUR 5", method: "via PayPal" },
        { date: "11.11.2024", amount: "EUR 20", method: "via PayPal" }
      ];

      const oModel = new JSONModel({
        transactions: aTransactions.slice(0, 5),
        allTransactions: aTransactions,
        currentPage: 1,
        pageSize: 5
      });

      this.getView().setModel(oModel);
    },

    onNextPage: function () {
      const oModel = this.getView().getModel();
      const iPage = oModel.getProperty("/currentPage");
      const iSize = oModel.getProperty("/pageSize");
      const aAll = oModel.getProperty("/allTransactions");

      const iStart = iPage * iSize;
      const iEnd = iStart + iSize;

      if (iStart < aAll.length) {
        oModel.setProperty("/transactions", aAll.slice(iStart, iEnd));
        oModel.setProperty("/currentPage", iPage + 1);
      }
    },

    onPreviousPage: function () {
      const oModel = this.getView().getModel();
      const iPage = oModel.getProperty("/currentPage");
      const iSize = oModel.getProperty("/pageSize");
      const aAll = oModel.getProperty("/allTransactions");

      const iStart = (iPage - 2) * iSize;
      const iEnd = iStart + iSize;

      if (iStart >= 0) {
        oModel.setProperty("/transactions", aAll.slice(iStart, iEnd));
        oModel.setProperty("/currentPage", iPage - 1);
      }
    },

    onReceiptPress: function () {
      sap.m.MessageToast.show("Receipt pressed");
    },

    onPdfPress: function () {
      sap.m.MessageToast.show("PDF pressed");
    },
    onNavHome: function () {
      this.getOwnerComponent().getRouter().navTo("home");
    },

    onNavProfile: function () {
      this.getOwnerComponent().getRouter().navTo("profile");
    }
  });
});
