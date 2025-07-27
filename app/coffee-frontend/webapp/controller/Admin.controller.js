sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox"
  ], function (Controller, JSONModel, MessageBox) {
    "use strict";
  
    return Controller.extend("coffee-frontend.controller.Admin", {
  
      onInit: function () {
        // ✅ Setup model for admin dashboard
        const oModel = new JSONModel({
          consumption: [],
          ordersByWeek: [],
          orderItems: []
        });
        this.getView().setModel(oModel, "adminModel");
  
        // load initial data for current month
        this.loadDashboardData(new Date().getMonth() + 1); // current month (1-12)
      },
  
      // 🔄 Load all dashboard data from backend
      loadDashboardData: function (month) {
        // ❗ Replace with real CAP calls
        // Here we simulate with static/mock data for now
  
        // Mock consumption data
        const consumption = [
          { choice: "Single Shot", count: 42 },
          { choice: "Double Shot", count: 28 }
        ];
  
        // Mock orders by week data
        const ordersByWeek = [
          { week: "W17", count: 12 },
          { week: "W18", count: 20 },
          { week: "W19", count: 15 },
          { week: "W20", count: 23 }
        ];
  
        // Mock order items
        const orderItems = [
          { orderId: "ORD-001", timestamp: "2025-05-01 09:30", choice: "Single", amount: 0.80 },
          { orderId: "ORD-002", timestamp: "2025-05-01 10:15", choice: "Double", amount: 1.50 }
        ];
  
        const oModel = this.getView().getModel("adminModel");
        oModel.setProperty("/consumption", consumption);
        oModel.setProperty("/ordersByWeek", ordersByWeek);
        oModel.setProperty("/orderItems", orderItems);
      },
  
      // 📅 Handle month filter change
      onMonthFilterChange: function (oEvent) {
        const selectedMonth = oEvent.getSource().getSelectedKey();
        this.loadDashboardData(selectedMonth);
      }
  
    });
  });
  