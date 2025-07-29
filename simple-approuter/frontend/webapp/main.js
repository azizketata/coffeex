sap.ui.define([
    "sap/m/App",
    "sap/m/Page",
    "sap/m/VBox",
    "sap/m/Button",
    "sap/m/Title",
    "sap/m/Text",
    "sap/m/Input",
    "sap/m/MessageToast",
    "sap/ui/core/Icon",
    "sap/m/MessageBox"
], function (App, Page, VBox, Button, Title, Text, Input, MessageToast, Icon, MessageBox) {
    "use strict";
    
    let currentUser = null;
    let welcomeText = null;
    let loginForm = null;
    let welcomeView = null;
    let page = null;
    let emailInput = null;
    let passwordInput = null;

    // Create login form
    function createLoginForm() {
        const coffeeIcon = new Icon({
            src: "sap-icon://nutrition-activity",
            size: "5rem",
            color: "#ffffff"
        });

        const titleText = new Title({
            text: "CoffeeX",
            level: "H1",
            titleStyle: "H1"
        }).addStyleClass("sapUiMediumMarginBottom");

        const subtitleText = new Text({
            text: "Your Digital Coffee Experience",
            textAlign: "Center"
        }).addStyleClass("sapUiSmallMarginBottom");

        emailInput = new Input({
            placeholder: "Email",
            type: "Email",
            width: "300px",
            value: ""
        }).addStyleClass("sapUiSmallMarginBottom");

        passwordInput = new Input({
            placeholder: "Password",
            type: "Password",
            width: "300px",
            value: ""
        }).addStyleClass("sapUiSmallMarginBottom");

        const loginButton = new Button({
            text: "Login",
            type: "Emphasized",
            icon: "sap-icon://log",
            width: "300px",
            press: handleLogin
        });

        loginForm = new VBox({
            alignItems: "Center",
            justifyContent: "Center",
            items: [
                coffeeIcon,
                titleText,
                subtitleText,
                emailInput,
                passwordInput,
                loginButton
            ],
            visible: true
        }).addStyleClass("sapUiContentPadding");

        return loginForm;
    }

    // Create welcome view
    function createWelcomeView() {
        const coffeeIcon = new Icon({
            src: "sap-icon://nutrition-activity",
            size: "5rem",
            color: "#ffffff"
        });

        welcomeText = new Text({
            text: "",
            textAlign: "Center"
        }).addStyleClass("sapUiLargeMarginTop");

        const logoutButton = new Button({
            text: "Logout",
            icon: "sap-icon://log",
            press: handleLogout
        }).addStyleClass("sapUiSmallMarginTop");

        const viewBalanceButton = new Button({
            text: "View My Balance",
            icon: "sap-icon://wallet",
            press: viewBalance
        }).addStyleClass("sapUiSmallMarginTop");

        welcomeView = new VBox({
            alignItems: "Center",
            justifyContent: "Center",
            items: [
                coffeeIcon,
                new Title({
                    text: "CoffeeX",
                    level: "H1"
                }),
                welcomeText,
                viewBalanceButton,
                logoutButton
            ],
            visible: false
        }).addStyleClass("sapUiContentPadding");

        return welcomeView;
    }

    // Handle login
    function handleLogin() {
        const email = emailInput.getValue();
        const password = passwordInput.getValue();

        if (!email || !password) {
            MessageBox.error("Please enter both email and password");
            return;
        }

        // Show loading
        MessageToast.show("Authenticating...");

        // For XSUAA authentication, we need to redirect to the approuter
        // which will handle the XSUAA login flow
        // Since we're already behind the approuter, let's check if user is authenticated
        
        // Try to get current user from backend
        jQuery.ajax({
            url: "/backend/odata/v4/getCurrentUser()",
            method: "GET",
            beforeSend: function(xhr) {
                // In a real scenario, you might send credentials here
                // But with XSUAA, authentication is handled by the approuter
            },
            success: function(data) {
                if (data) {
                    currentUser = data;
                    showWelcomeView();
                    MessageToast.show("Login successful!");
                }
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    // Not authenticated - need to login via XSUAA
                    MessageBox.confirm(
                        "You need to authenticate with SAP. Click OK to proceed to SAP login.",
                        {
                            onClose: function(oAction) {
                                if (oAction === MessageBox.Action.OK) {
                                    // Force re-authentication by going to a protected resource
                                    window.location.href = "/backend/odata/v4/Users";
                                }
                            }
                        }
                    );
                } else {
                    MessageBox.error("Login failed. Please check your credentials.");
                }
            }
        });
    }

    // Handle logout
    function handleLogout() {
        // Clear session and redirect to logout
        currentUser = null;
        window.location.href = "/logout";
    }

    // View balance
    function viewBalance() {
        if (currentUser && currentUser.userId) {
            jQuery.ajax({
                url: `/backend/odata/v4/Users('${currentUser.userId}')`,
                method: "GET",
                success: function(data) {
                    MessageBox.information(`Your current balance: €${data.balance || 0}`);
                },
                error: function() {
                    MessageBox.error("Could not fetch balance");
                }
            });
        }
    }

    // Show welcome view
    function showWelcomeView() {
        if (currentUser) {
            welcomeText.setText(`Welcome, ${currentUser.displayName || currentUser.email}!`);
            loginForm.setVisible(false);
            welcomeView.setVisible(true);
        }
    }

    // Check if already authenticated
    function checkAuthentication() {
        jQuery.ajax({
            url: "/backend/odata/v4/getCurrentUser()",
            method: "GET",
            success: function(data) {
                if (data) {
                    currentUser = data;
                    showWelcomeView();
                }
            },
            error: function(xhr) {
                // Not authenticated - show login form
                console.log("User not authenticated");
        }
        });
    }

    // Initialize the app
    const app = new App({
        pages: [
            page = new Page({
                title: "CoffeeX Login",
                content: [
                    createLoginForm(),
                    createWelcomeView()
                ],
                showNavButton: false
            })
        ]
    });

    // Style the page
    app.addStyleClass("coffeeXApp");

    // Add custom CSS
    const style = document.createElement("style");
    style.textContent = `
        .coffeeXApp .sapMPage {
            background: transparent !important;
        }
        .coffeeXApp .sapMPageHeader {
            background: rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(10px);
        }
        .coffeeXApp .sapMTitle {
            color: #ffffff !important;
        }
        .coffeeXApp .sapMText {
            color: #ffffff !important;
        }
        .coffeeXApp .sapUiIcon {
            margin-bottom: 20px;
        }
        .coffeeXApp .sapMInputBaseInner {
            background: rgba(255, 255, 255, 0.9) !important;
        }
    `;
    document.head.appendChild(style);

    // Place app in the HTML body
    app.placeAt("content");

    // Check if already authenticated when app loads
    checkAuthentication();
}); 