// ============================================================
// Zoho CRM Contact Quick Editor
// File: app.js
// ============================================================

// Stores the ID of the Contact currently open in Zoho CRM
let contactId = null;


// ============================================================
// DOM ELEMENTS
// ============================================================

const loadingState = document.getElementById("loadingState");
const mainContent = document.getElementById("mainContent");

const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const phoneInput = document.getElementById("phone");
const emailInput = document.getElementById("email");

const postalCodeInput = document.getElementById("postalCode");
const streetAddressInput = document.getElementById("streetAddress");
const cityInput = document.getElementById("city");
const stateInput = document.getElementById("state");
const countryInput = document.getElementById("country");

const saveContactButton = document.getElementById("saveContactBtn");
const lookupAddressButton = document.getElementById("lookupAddressBtn");
const saveAddressButton = document.getElementById("saveAddressBtn");

const statusMessage = document.getElementById("statusMessage");


// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Display a status message to the user.
 */
function showStatus(message, type = "success") {

    statusMessage.textContent = message;

    statusMessage.className = "status-message";

    if (type === "error") {
        statusMessage.classList.add("error");
    }
    else if (type === "success") {
        statusMessage.classList.add("success");
    }
    else {
        statusMessage.classList.add("info");
    }
}


/**
 * Show the main widget and hide loading screen.
 */
function showMainContent() {

    loadingState.classList.add("hidden");

    mainContent.classList.remove("hidden");
}


/**
 * Show loading error.
 */
function showLoadingError(message) {

    loadingState.textContent = message;

    loadingState.classList.remove("hidden");

    mainContent.classList.add("hidden");

    showStatus(message, "error");
}


/**
 * Disable a button while an operation is running.
 */
function setButtonLoading(button, loading, loadingText = "Saving...") {

    if (loading) {

        button.disabled = true;

        button.dataset.originalText = button.textContent;

        button.textContent = loadingText;

    }
    else {

        button.disabled = false;

        if (button.dataset.originalText) {

            button.textContent = button.dataset.originalText;

        }
    }
}


// ============================================================
// CHECK ZOHO SDK
// ============================================================

if (typeof ZOHO === "undefined") {

    console.error("Zoho Embedded App SDK is not available.");

    showLoadingError(
        "Zoho CRM SDK could not be loaded. Please refresh the Contact record."
    );

}
else {

    // ========================================================
    // ZOHO CRM PAGE LOAD
    // ========================================================

    ZOHO.embeddedApp.on("PageLoad", function (data) {

        console.log("Zoho CRM PageLoad data:", data);


        // ----------------------------------------------------
        // Validate PageLoad data
        // ----------------------------------------------------

        if (
            !data ||
            !data.EntityId
        ) {

            showLoadingError(
                "Unable to identify the Contact record."
            );

            console.error(
                "PageLoad did not provide EntityId:",
                data
            );

            return;
        }


        // ----------------------------------------------------
        // Get the Contact ID
        //
        // Zoho may provide EntityId as:
        //
        // 1. A string
        //    "1249296000001234567"
        //
        // 2. An array
        //    ["1249296000001234567"]
        //
        // ----------------------------------------------------

        let pageLoadContactId = data.EntityId;


        if (Array.isArray(pageLoadContactId)) {

            pageLoadContactId = pageLoadContactId[0];

        }


        // Make sure the ID is converted to a string

        if (
            pageLoadContactId === null ||
            pageLoadContactId === undefined ||
            pageLoadContactId === ""
        ) {

            showLoadingError(
                "Contact ID is not available."
            );

            console.error(
                "Invalid Contact ID:",
                pageLoadContactId
            );

            return;
        }


        // Store the Contact ID globally
        // so Save Contact and Save Address can use it.

        contactId = String(pageLoadContactId);


        console.log(
            "Current Contact ID:",
            contactId
        );


        // ----------------------------------------------------
        // Load the Contact information
        // ----------------------------------------------------

        loadContact(contactId);

    });


    // ========================================================
    // INITIALIZE ZOHO EMBEDDED APP
    // ========================================================

    ZOHO.embeddedApp.init()
        .then(function () {

            console.log(
                "Zoho Embedded App initialized successfully."
            );

        })
        .catch(function (error) {

            console.error(
                "Zoho Embedded App initialization failed:",
                error
            );

            showLoadingError(
                "Unable to initialize the Zoho CRM widget."
            );

        });


    // ========================================================
    // LOAD CONTACT
    // ========================================================

    function loadContact(recordId) {

        console.log(
            "Loading Contact:",
            recordId
        );


        if (!recordId) {

            showLoadingError(
                "Contact ID is not available."
            );

            return;
        }


        ZOHO.CRM.API.getRecord({

            Entity: "Contacts",

            RecordID: recordId

        })
        .then(function (response) {

            console.log(
                "Contact API response:",
                response
            );


            // ------------------------------------------------
            // Validate API response
            // ------------------------------------------------

            if (
                !response ||
                !response.data ||
                response.data.length === 0
            ) {

                showStatus(
                    "Contact record could not be found.",
                    "error"
                );

                console.error(
                    "No Contact data returned:",
                    response
                );

                return;
            }


            // ------------------------------------------------
            // Get Contact record
            // ------------------------------------------------

            const contact = response.data[0];


            console.log(
                "Contact record:",
                contact
            );


            // =================================================
            // CONTACT INFORMATION
            // =================================================

            firstNameInput.value =
                contact.First_Name || "";

            lastNameInput.value =
                contact.Last_Name || "";

            phoneInput.value =
                contact.Phone || "";

            emailInput.value =
                contact.Email || "";


            // =================================================
            // ADDRESS INFORMATION
            // =================================================

            postalCodeInput.value =
                contact.Mailing_Zip || "";

            streetAddressInput.value =
                contact.Mailing_Street || "";

            cityInput.value =
                contact.Mailing_City || "";

            stateInput.value =
                contact.Mailing_State || "";

            countryInput.value =
                contact.Mailing_Country || "";


            // ------------------------------------------------
            // Show widget after data has loaded
            // ------------------------------------------------

            showMainContent();


            console.log(
                "Contact loaded successfully."
            );

        })
        .catch(function (error) {

            console.error(
                "Error loading Contact:",
                error
            );


            showStatus(
                "Failed to load Contact information.",
                "error"
            );

        });
    }


    // ========================================================
    // SAVE CONTACT INFORMATION
    // ========================================================

    saveContactButton.addEventListener(
        "click",
        function () {

            // ------------------------------------------------
            // Make sure Contact ID is available
            // ------------------------------------------------

            if (!contactId) {

                showStatus(
                    "Contact ID is not available.",
                    "error"
                );

                console.error(
                    "Save Contact attempted without Contact ID."
                );

                return;
            }


            // ------------------------------------------------
            // Validate Last Name
            // ------------------------------------------------

            const firstName =
                firstNameInput.value.trim();

            const lastName =
                lastNameInput.value.trim();

            const phone =
                phoneInput.value.trim();

            const email =
                emailInput.value.trim();


            if (!lastName) {

                showStatus(
                    "Last Name is required.",
                    "error"
                );

                lastNameInput.focus();

                return;
            }


            // ------------------------------------------------
            // Basic email validation
            // ------------------------------------------------

            if (
                email &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
            ) {

                showStatus(
                    "Please enter a valid email address.",
                    "error"
                );

                emailInput.focus();

                return;
            }


            // ------------------------------------------------
            // Show saving state
            // ------------------------------------------------

            setButtonLoading(
                saveContactButton,
                true,
                "Saving..."
            );


            showStatus(
                "Saving Contact information...",
                "info"
            );


            // ------------------------------------------------
            // Contact data to update
            // ------------------------------------------------

            const contactData = {

                id: contactId,

                First_Name: firstName,

                Last_Name: lastName,

                Phone: phone,

                Email: email

            };


            console.log(
                "Updating Contact with:",
                contactData
            );


            // ------------------------------------------------
            // Update Contact in Zoho CRM
            // ------------------------------------------------

            ZOHO.CRM.API.updateRecord({

                Entity: "Contacts",

                APIData: contactData,

                Trigger: []

            })
            .then(function (response) {

                console.log(
                    "Contact update response:",
                    response
                );


                showStatus(
                    "Contact information saved successfully.",
                    "success"
                );

            })
            .catch(function (error) {

                console.error(
                    "Error updating Contact:",
                    error
                );


                showStatus(
                    "Failed to save Contact information.",
                    "error"
                );

            })
            .finally(function () {

                setButtonLoading(
                    saveContactButton,
                    false
                );

            });

        }
    );


    // ========================================================
    // POSTAL CODE LOOKUP
    // ========================================================

    lookupAddressButton.addEventListener(
        "click",
        function () {

            // ------------------------------------------------
            // Get postal code
            // ------------------------------------------------

            const postalCode =
                postalCodeInput.value.trim();


            // ------------------------------------------------
            // Validate postal code
            // ------------------------------------------------

            if (!postalCode) {

                showStatus(
                    "Please enter a postal code.",
                    "error"
                );

                postalCodeInput.focus();

                return;
            }


            console.log(
                "Looking up postal code:",
                postalCode
            );


            // ------------------------------------------------
            // Show loading state
            // ------------------------------------------------

            lookupAddressButton.disabled = true;

            lookupAddressButton.textContent =
                "Looking up...";


            showStatus(
                "Looking up address...",
                "info"
            );


            // =================================================
            // Zippopotam.us API
            //
            // Free public postal code API
            //
            // This implementation uses US ZIP codes.
            // =================================================

            const apiUrl =
                `https://api.zippopotam.us/us/${encodeURIComponent(postalCode)}`;


            fetch(apiUrl)

                // ------------------------------------------------
                // Check API response
                // ------------------------------------------------

                .then(function (response) {

                    if (!response.ok) {

                        throw new Error(
                            "Postal code was not found."
                        );

                    }

                    return response.json();

                })


                // ------------------------------------------------
                // Process API response
                // ------------------------------------------------

                .then(function (data) {

                    console.log(
                        "Postal API response:",
                        data
                    );


                    if (
                        !data.places ||
                        data.places.length === 0
                    ) {

                        throw new Error(
                            "No address information was found."
                        );

                    }


                    const place =
                        data.places[0];


                    // =================================================
                    // AUTO-FILL ADDRESS FIELDS
                    // =================================================

                    cityInput.value =
                        place["place name"] || "";

                    stateInput.value =
                        place["state"] || "";

                    countryInput.value =
                        data.country || "";


                    showStatus(
                        "Address information found. Please review and save.",
                        "success"
                    );

                })


                // ------------------------------------------------
                // Handle lookup errors
                // ------------------------------------------------

                .catch(function (error) {

                    console.error(
                        "Postal lookup error:",
                        error
                    );


                    showStatus(
                        error.message ||
                        "Unable to look up postal code.",
                        "error"
                    );

                })


                // ------------------------------------------------
                // Restore Lookup button
                // ------------------------------------------------

                .finally(function () {

                    lookupAddressButton.disabled =
                        false;

                    lookupAddressButton.textContent =
                        "Lookup";

                });

        }
    );


    // ========================================================
    // SAVE ADDRESS
    // ========================================================

    saveAddressButton.addEventListener(
        "click",
        function () {

            // ------------------------------------------------
            // Make sure Contact ID is available
            // ------------------------------------------------

            if (!contactId) {

                showStatus(
                    "Contact ID is not available.",
                    "error"
                );

                console.error(
                    "Save Address attempted without Contact ID."
                );

                return;
            }


            // ------------------------------------------------
            // Show saving state
            // ------------------------------------------------

            setButtonLoading(
                saveAddressButton,
                true,
                "Saving..."
            );


            showStatus(
                "Saving address...",
                "info"
            );


            // ------------------------------------------------
            // Address data
            // ------------------------------------------------

            const addressData = {

                id: contactId,

                Mailing_Street:
                    streetAddressInput.value.trim(),

                Mailing_City:
                    cityInput.value.trim(),

                Mailing_State:
                    stateInput.value.trim(),

                Mailing_Zip:
                    postalCodeInput.value.trim(),

                Mailing_Country:
                    countryInput.value.trim()

            };


            console.log(
                "Updating address with:",
                addressData
            );


            // ------------------------------------------------
            // Update Contact address in Zoho CRM
            // ------------------------------------------------

            ZOHO.CRM.API.updateRecord({

                Entity: "Contacts",

                APIData: addressData,

                Trigger: []

            })
            .then(function (response) {

                console.log(
                    "Address update response:",
                    response
                );


                showStatus(
                    "Address saved successfully.",
                    "success"
                );

            })
            .catch(function (error) {

                console.error(
                    "Error updating address:",
                    error
                );


                showStatus(
                    "Failed to save address.",
                    "error"
                );

            })
            .finally(function () {

                setButtonLoading(
                    saveAddressButton,
                    false
                );

            });

        }
    );

}
