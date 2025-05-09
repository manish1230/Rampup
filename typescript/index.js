// //generics
var partialProduct = {
    name: "Notebook", // ✅ optional
    details: {
        stock: {
            available: true // ✅ nested optional
        }
    },
    log: function () { return console.log("Logging product"); } // ✅ functions are untouched
};
console.log(partialProduct);
