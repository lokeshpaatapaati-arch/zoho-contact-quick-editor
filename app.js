// ============================================================
// ZOHO CRM CONTACT QUICK EDITOR
// ============================================================


// ============================================================
// GLOBAL CONTACT ID
// ============================================================

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
// STATUS MESSAGE
// ============================================================

function showStatus(message, type = "success") {

    if (!statusMessage) {
        return;
    }

    statusMessage.textContent = message;

    statusMessage.className = "status-message";

    if (type === "error") {

        statusMessage.classList.add("error");

    }
    else if (type === "info") {

        statusMessage.classList.add("info");

    }
    else {

        statusMessage.classList.add("success");

    }
}


// ============================================================
// SHOW MAIN CONTENT
// ============================================================

function showMainContent() {

    if (loadingState) {
        loadingState.classList.add("hidden");
    }

    if (mainContent) {
        mainContent.classList.remove("hidden");
    }
}


// ============================================================
// SHOW LOADING ERROR
// ============================================================

function showLoadingError(message) {

    if (loadingState) {

        loadingState.textContent = message;

        loadingState.classList.remove("hidden");
    }

    if (mainContent) {
        mainContent.classList.add("hidden");
    }

    showStatus(message, "error");
}


// ============================================================
// BUTTON LOADING STATE
// ============================================================

function setButtonLoading(
    button,
    loading,
    loadingText = "Saving..."
) {

    if (!button) {
        return;
    }

    if (loading) {

        button.disabled = true;

        button.dataset.originalText =
            button.textContent;

        button.textContent = loadingText;

    }
    else {

        button.disabled = false;

        if (button.dataset.originalText) {

            button.textContent =
                button.dataset.originalText;

        }
    }
}


// ============================================================
// SAVE CONTACT ID
// ============================================================

function setContactId(id) {

    if (
        id === null ||
        id === undefined ||
        id === ""
    ) {

        console.error(
            "Attempted to save an invalid Contact ID:",
            id
        );

        return false;
    }


    // Convert to string

    const normalizedId = String(id);


    // Global variable

    contactId = normalizedId;


    // Window-level variable

    window.currentContactId = normalizedId;


    // Session storage backup

    try {

        sessionStorage.setItem(
            "zohoContactId",
            normalizedId
        );

    }
    catch (error) {

        console.warn(
            "Unable to save Contact ID to sessionStorage:",
            error
        );

    }


    console.log(
        "Contact ID stored successfully:",
        normalizedId
    );


    return true;
}


// ============================================================
// GET CONTACT ID
// ============================================================

function getContactId() {

    // --------------------------------------------------------
    // 1. Global variable
    // --------------------------------------------------------

    if (
        contactId !== null &&
        contactId !== undefined &&
        contactId !== ""
    ) {

        return String(contactId);

    }


    // --------------------------------------------------------
    // 2. Window variable
    // --------------------------------------------------------

    if (
        window.currentContactId !== null &&
        window.currentContactId !== undefined &&
        window.currentContactId !== ""
    ) {

        contactId =
            String(window.currentContactId);

        return contactId;

    }


    // --------------------------------------------------------
    // 3. Session storage
    // --------------------------------------------------------

    try {

        const storedId =
            sessionStorage.getItem(
                "zohoContactId"
            );


        if (
            storedId !== null &&
            storedId !== ""
        ) {

            contactId = String(storedId);

            window.currentContactId =
                contactId;

            console.log(
                "Contact ID restored from sessionStorage:",
                contactId
            );

            return contactId;

        }

    }
    catch (error) {

        console.warn(
            "Unable to read Contact ID from sessionStorage:",
            error
        );

    }


    // --------------------------------------------------------
    // No ID available
    // --------------------------------------------------------

    return null;
}


// ============================================================
// ZOHO SDK CHECK
// ============================================================

if (typeof ZOHO === "undefined") {

    console.error(
        "Zoho Embedded App SDK is not available."
    );

    showLoadingError(
        "Zoho CRM SDK could not be loaded. Please refresh the Contact record."
    );

}
else {


    // ========================================================
    // ZOHO PAGE LOAD
    // ========================================================

    ZOHO.embeddedApp.on(
        "PageLoad",
        function (data) {

            console.log(
                "================================================"
            );

            console.log(
                "Zoho CRM PageLoad event received."
            );

            console.log(
                "PageLoad data:",
                data
            );


            // ------------------------------------------------
            // Validate PageLoad data
            // ------------------------------------------------

            if (
                !data ||
                !data.EntityId
            ) {

                console.error(
                    "PageLoad did not provide EntityId."
                );

                showLoadingError(
                    "Unable to identify the Contact record."
                );

                return;
            }


            // ------------------------------------------------
            // Extract Contact ID
            // ------------------------------------------------

            let receivedContactId =
                data.EntityId;


            console.log(
                "Raw EntityId:",
                receivedContactId
            );


            // ------------------------------------------------
            // Handle array format
            // ------------------------------------------------

            if (
                Array.isArray(receivedContactId)
            ) {

                receivedContactId =
                    receivedContactId[0];

            }


            // ------------------------------------------------
            // Validate extracted ID
            // ------------------------------------------------

            if (
                receivedContactId === null ||
                receivedContactId === undefined ||
                receivedContactId === ""
            ) {

                console.error(
                    "Extracted Contact ID is empty."
                );

                showLoadingError(
                    "Contact ID is not available."
                );

                return;
            }


            // ------------------------------------------------
            // Store Contact ID
            // ------------------------------------------------

            const idSaved =
                setContactId(
                    receivedContactId
                );


            if (!idSaved) {

                showLoadingError(
                    "Unable to store Contact ID."
                );

                return;
            }


            // ------------------------------------------------
            // Confirm stored ID
            // ------------------------------------------------

            console.log(
                "Current Contact ID:",
                getContactId()
            );


            // ------------------------------------------------
            // Load Contact
            // ------------------------------------------------

            loadContact(
                getContactId()
            );

        }
    );


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
            // Validate response
            // ------------------------------------------------

            if (
                !response ||
                !response.data ||
                response.data.length === 0
            ) {

                console.error(
                    "No Contact record returned:",
                    response
                );

                showStatus(
                    "Contact record could not be found.",
                    "error"
                );

                return;
            }


            // ------------------------------------------------
            // Get Contact
            // ------------------------------------------------

            const contact =
                response.data[0];


            console.log(
                "Contact record loaded:",
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
            // MAILING ADDRESS
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
            // Show widget
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
    // SAVE CONTACT
    // ========================================================

    saveContactButton.addEventListener(
        "click",
        function () {

            console.log(
                "Save Contact button clicked."
            );


            // ------------------------------------------------
            // Get Contact ID
            // ------------------------------------------------

            const currentId =
                getContactId();


            console.log(
                "Contact ID used for Save Contact:",
                currentId
            );


            // ------------------------------------------------
            // Validate Contact ID
            // ------------------------------------------------

            if (!currentId) {

                showStatus(
                    "Contact ID is not available.",
                    "error"
                );

                console.error(
                    "Save Contact failed: Contact ID is empty."
                );

                return;
            }


            // ------------------------------------------------
            // Get field values
            // ------------------------------------------------

            const firstName =
                firstNameInput.value.trim();

            const lastName =
                lastNameInput.value.trim();

            const phone =
                phoneInput.value.trim();

            const email =
                emailInput.value.trim();


            // ------------------------------------------------
            // Last Name validation
            // ------------------------------------------------

            if (!lastName) {

                showStatus(
                    "Last Name is required.",
                    "error"
                );

                lastNameInput.focus();

                return;
            }


            // ------------------------------------------------
            // Email validation
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
            // Loading state
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
            // Contact data
            // ------------------------------------------------

            const contactData = {

                id: currentId,

                First_Name: firstName,

                Last_Name: lastName,

                Phone: phone,

                Email: email

            };


            console.log(
                "Contact update payload:",
                contactData
            );


            // ------------------------------------------------
            // Update CRM
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

            const postalCode =
                postalCodeInput.value.trim();


            // ------------------------------------------------
            // Validate ZIP
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
            // Loading state
            // ------------------------------------------------

            lookupAddressButton.disabled =
                true;

            lookupAddressButton.textContent =
                "Looking up...";


            showStatus(
                "Looking up address...",
                "info"
            );


            // ------------------------------------------------
            // Zippopotam.us API
            // ------------------------------------------------

            const apiUrl =
                `https://api.zippopotam.us/us/${encodeURIComponent(postalCode)}`;


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
                    // Auto-fill city
                    // ------------------------------------------------

                    cityInput.value =
                        place["place name"] || "";


                    // ------------------------------------------------
                    // Auto-fill state
                    // ------------------------------------------------

                    stateInput.value =
                        place["state"] || "";


                    // ------------------------------------------------
                    // Auto-fill country
                    // ------------------------------------------------

                    countryInput.value =
                        data.country || "";


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


    // ========================================================
    // SAVE ADDRESS
    // ========================================================

    saveAddressButton.addEventListener(
        "click",
        function () {

            console.log(
                "Save Address button clicked."
            );


            // ------------------------------------------------
            // Get Contact ID
            // ------------------------------------------------

            const currentId =
                getContactId();


            console.log(
                "Contact ID used for Save Address:",
                currentId
            );


            // ------------------------------------------------
            // Validate Contact ID
            // ------------------------------------------------

            if (!currentId) {

                showStatus(
                    "Contact ID is not available.",
                    "error"
                );

                console.error(
                    "Save Address failed: Contact ID is empty."
                );

                return;
            }


            // ------------------------------------------------
            // Loading state
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

                id: currentId,

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
                "Address update payload:",
                addressData
            );


            // ------------------------------------------------
            // Update CRM
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
