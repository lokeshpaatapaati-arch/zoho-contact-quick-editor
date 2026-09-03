// ============================================================
// Zoho CRM Contact Quick Editor
// File: app.js
// ============================================================


// ============================================================
// CURRENT CONTACT
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

const saveContactButton =
    document.getElementById("saveContactBtn");

const lookupAddressButton =
    document.getElementById("lookupAddressBtn");

const saveAddressButton =
    document.getElementById("saveAddressBtn");

const statusMessage =
    document.getElementById("statusMessage");


// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Display a status message.
 *
 * type can be:
 * success
 * error
 * info
 */
function showStatus(message, type = "success") {

    statusMessage.textContent = message;

    statusMessage.className = "status-message";

    if (type === "error") {

        statusMessage.classList.add("error");

    } else if (type === "info") {

        statusMessage.classList.add("info");

    } else {

        statusMessage.classList.add("success");
    }
}


/**
 * Show the main widget content.
 */
function showMainContent() {

    loadingState.classList.add("hidden");

    mainContent.classList.remove("hidden");
}


/**
 * Set button loading state.
 */
function setButtonLoading(button, loading) {

    if (loading) {

        button.disabled = true;

        button.dataset.originalText =
            button.textContent;

        button.textContent = "Saving...";

    } else {

        button.disabled = false;

        if (button.dataset.originalText) {

            button.textContent =
                button.dataset.originalText;

            delete button.dataset.originalText;
        }
    }
}


/**
 * Check whether a valid Contact ID is available.
 */
function hasContactId() {

    return contactId !== null &&
           contactId !== undefined &&
           contactId !== "";
}


// ============================================================
// ZOHO CRM PAGE LOAD
// ============================================================

ZOHO.embeddedApp.on("PageLoad", function (data) {

    console.log(
        "Zoho CRM PageLoad data:",
        data
    );


    // --------------------------------------------------------
    // Check whether Contact ID was provided
    // --------------------------------------------------------

    if (
        !data ||
        !data.EntityId ||
        data.EntityId.length === 0
    ) {

        showStatus(
            "Unable to identify the Contact record.",
            "error"
        );

        loadingState.textContent =
            "Please open this widget from a Contact record.";

        return;
    }


    // --------------------------------------------------------
    // Store Contact ID
    // --------------------------------------------------------

    let contactId = data.EntityId;

if (Array.isArray(contactId)) {
    contactId = contactId[0];
}

contactId = String(contactId);

console.log("Current Contact ID:", contactId);
loadContact(contactId);

    console.log(
        "Current Contact ID:",
        contactId
    );


    // --------------------------------------------------------
    // Load Contact
    // --------------------------------------------------------

    loadContact();
});


// ============================================================
// INITIALIZE ZOHO EMBEDDED APP
// ============================================================

ZOHO.embeddedApp.init();


// ============================================================
// LOAD CONTACT
// ============================================================

function loadContact() {

    console.log(
        "Loading Contact:",
        contactId
    );


    ZOHO.CRM.API.getRecord({

        Entity: "Contacts",

        RecordID: contactId

    })

    .then(function (response) {

        console.log(
            "Contact API response:",
            response
        );


        // ----------------------------------------------------
        // Validate response
        // ----------------------------------------------------

        if (
            !response ||
            !response.data ||
            response.data.length === 0
        ) {

            throw new Error(
                "Contact record could not be found."
            );
        }


        const contact = response.data[0];


        // ----------------------------------------------------
        // Contact Information
        // ----------------------------------------------------

        firstNameInput.value =
            contact.First_Name || "";

        lastNameInput.value =
            contact.Last_Name || "";

        phoneInput.value =
            contact.Phone || "";

        emailInput.value =
            contact.Email || "";


        // ----------------------------------------------------
        // Address Information
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // Display widget
        // ----------------------------------------------------

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
            error.message ||
            "Failed to load Contact information.",
            "error"
        );

    });
}


// ============================================================
// SAVE CONTACT INFORMATION
// ============================================================

saveContactButton.addEventListener(
    "click",
    function () {

        // ----------------------------------------------------
        // Validate Contact ID
        // ----------------------------------------------------

        if (!hasContactId()) {

            showStatus(
                "Contact ID is not available.",
                "error"
            );

            return;
        }


        // ----------------------------------------------------
        // Validate Last Name
        // ----------------------------------------------------

        const lastName =
            lastNameInput.value.trim();

        if (!lastName) {

            showStatus(
                "Last Name is required.",
                "error"
            );

            lastNameInput.focus();

            return;
        }


        // ----------------------------------------------------
        // Validate Email
        // ----------------------------------------------------

        const email =
            emailInput.value.trim();

        if (
            email &&
            !emailInput.checkValidity()
        ) {

            showStatus(
                "Please enter a valid email address.",
                "error"
            );

            emailInput.focus();

            return;
        }


        // ----------------------------------------------------
        // Disable button
        // ----------------------------------------------------

        setButtonLoading(
            saveContactButton,
            true
        );


        showStatus(
            "Saving Contact information...",
            "info"
        );


        // ----------------------------------------------------
        // Contact data to update
        // ----------------------------------------------------

        const contactData = {

            id: contactId,

            First_Name:
                firstNameInput.value.trim(),

            Last_Name:
                lastName,

            Phone:
                phoneInput.value.trim(),

            Email:
                email
        };


        console.log(
            "Updating Contact with:",
            contactData
        );


        // ----------------------------------------------------
        // Update CRM Contact
        // ----------------------------------------------------

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


// ============================================================
// POSTAL CODE LOOKUP
// ============================================================

lookupAddressButton.addEventListener(
    "click",
    function () {

        const postalCode =
            postalCodeInput.value.trim();


        // ----------------------------------------------------
        // Validate postal code
        // ----------------------------------------------------

        if (!postalCode) {

            showStatus(
                "Please enter a postal code.",
                "error"
            );

            postalCodeInput.focus();

            return;
        }


        // ----------------------------------------------------
        // Disable lookup button
        // ----------------------------------------------------

        lookupAddressButton.disabled = true;

        lookupAddressButton.textContent =
            "Looking up...";


        showStatus(
            "Looking up address...",
            "info"
        );


        console.log(
            "Looking up postal code:",
            postalCode
        );


        // ----------------------------------------------------
        // Zippopotam.us API
        //
        // Current implementation assumes U.S. ZIP codes.
        // ----------------------------------------------------

        const apiUrl =
            `https://api.zippopotam.us/us/${encodeURIComponent(postalCode)}`;


        // ----------------------------------------------------
        // Call postal-code API
        // ----------------------------------------------------

        fetch(apiUrl)

        .then(function (response) {

            if (!response.ok) {

                throw new Error(
                    "Postal code was not found."
                );
            }

            return response.json();
        })

        .then(function (data) {

            console.log(
                "Postal API response:",
                data
            );


            // ------------------------------------------------
            // Validate API response
            // ------------------------------------------------

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


            // ------------------------------------------------
            // Auto-fill location fields
            // ------------------------------------------------

            cityInput.value =
                place["place name"] || "";

            stateInput.value =
                place["state"] || "";

            countryInput.value =
                data.country || "";


            // ------------------------------------------------
            // Inform user
            // ------------------------------------------------

            showStatus(
                "Address information found. Please review and save.",
                "success"
            );

        })

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

        .finally(function () {

            lookupAddressButton.disabled =
                false;

            lookupAddressButton.textContent =
                "Lookup";

        });
    }
);


// ============================================================
// SAVE ADDRESS
// ============================================================

saveAddressButton.addEventListener(
    "click",
    function () {

        // ----------------------------------------------------
        // Validate Contact ID
        // ----------------------------------------------------

        if (!hasContactId()) {

            showStatus(
                "Contact ID is not available.",
                "error"
            );

            return;
        }


        // ----------------------------------------------------
        // Disable button
        // ----------------------------------------------------

        setButtonLoading(
            saveAddressButton,
            true
        );


        showStatus(
            "Saving address...",
            "info"
        );


        // ----------------------------------------------------
        // Address data
        // ----------------------------------------------------

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


        // ----------------------------------------------------
        // Update Contact address in CRM
        // ----------------------------------------------------

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
