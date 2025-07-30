sap.ui.define([
    "sap/ui/core/ComponentContainer"
], function(ComponentContainer) {
    "use strict";

    // Create component container
    new ComponentContainer({
        name: "coffeex",
        settings: {
            id: "coffeex"
        },
        async: true
    }).placeAt("content");
}); 