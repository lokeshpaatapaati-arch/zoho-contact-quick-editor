// ========================================================
// ZOHO CRM CONTACT QUICK EDITOR
// ========================================================

// --------------------------------------------------------
// GLOBAL VARIABLES
// --------------------------------------------------------

let contactId = null;


// --------------------------------------------------------
// DOM ELEMENTS
// --------------------------------------------------------

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


// --------------------------------------------------------
// SET CONTACT ID
// --------------------------------------------------------

function setContactId(id) {

    if (!id) {
        console.error("Cannot set Contact ID because ID is empty.");
        return;
    }

    const normalizedId = String(id).trim();

    contactId = normalizedId;

    // Store globally
    window.currentContactId = normalizedId;

    // Store in session storage as backup
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
        "Contact ID stored:",
        normalizedId
    );
}


// --------------------------------------------------------
// GET CONTACT ID
// --------------------------------------------------------

function getContactId() {

    // 1. Global variable
    if (contactId) {

        return contactId;

    }


    // 2. Window variable
    if (window.currentContactId) {

        contactId =
            String(window.currentContactId).trim();

        return contactId;

    }


    // 3. Session storage
    try {

        const storedId =
            sessionStorage.getItem(
                "zohoContactId"
            );

        if (storedId) {

            contactId =
                String(storedId).trim();

            return contactId;

        }

    }
    catch (error) {

        console.warn(
            "Unable to read Contact ID from sessionStorage:",
            error
        );

    }


    return null;
}


// --------------------------------------------------------
// STATUS MESSAGE
// --------------------------------------------------------

function showStatus(message, type) {

    const statusElement =
        document.getElementById("statusMessage");

    if (!statusElement) {

        console.log(
            "Status:",
            message
        );

        return;

    }

    statusElement.textContent =
        message;

    statusElement.className =
        "status-message " + type;

}


// --------------------------------------------------------
// BUTTON LOADING STATE
// --------------------------------------------------------

function setButtonLoading(
    button,
    loading,
    loadingText
) {

    if (!button) {
        return;
    }


    if (loading) {

        button.dataset.originalText =
            button.textContent;

        button.disabled = true;

        button.textContent =
            loadingText || "Saving...";

    }
    else {

        button.disabled = false;

        if (button.dataset.originalText) {

            button.textContent =
                button.dataset.originalText;

        }

    }

}


// ========================================================
// LOAD CONTACT
// ========================================================

function loadContact(recordId) {

    console.log(
        "Loading Contact:",
        recordId
    );


    if (!recordId) {

        showStatus(
            "Contact ID is not available.",
            "error"
        );

        return;

    }


    showStatus(
        "Loading contact information...",
        "info"
    );


    ZOHO.CRM.API.getRecord({

        Entity: "Contacts",

        RecordID: recordId

    })

    .then(function(response) {

        console.log(
            "Contact API response:",
            response
        );


        if (
            !response ||
            !response.data ||
            response.data.length === 0
        ) {

            throw new Error(
                "Contact record could not be found."
            );

        }


        const contact =
            response.data[0];


        console.log(
            "Contact record:",
            contact
        );


        // ------------------------------------------------
        // CONTACT INFORMATION
        // ------------------------------------------------

        firstNameInput.value =
            contact.First_Name || "";

        lastNameInput.value =
            contact.Last_Name || "";

        phoneInput.value =
            contact.Phone || "";

        emailInput.value =
            contact.Email || "";


        // ------------------------------------------------
        // MAILING ADDRESS
        // ------------------------------------------------

        streetAddressInput.value =
            contact.Mailing_Street || "";

        cityInput.value =
            contact.Mailing_City || "";

        stateInput.value =
            contact.Mailing_State || "";

        postalCodeInput.value =
            contact.Mailing_Zip || "";

        countryInput.value =
            contact.Mailing_Country || "";


        showStatus(
            "Contact information loaded.",
            "success"
        );


        console.log(
            "Contact loaded successfully."
        );

    })

    .catch(function(error) {

        console.error(
            "Error loading Contact:",
            error
        );


        showStatus(
            error.message ||
            "Failed to load contact information.",
            "error"
        );

    });

}


// ========================================================
// SAVE CONTACT INFORMATION
// ========================================================

saveContactButton.addEventListener(
    "click",
    function() {

        console.log(
            "Save Contact button clicked."
        );


        const currentId =
            getContactId();


        console.log(
            "Contact ID used for Save Contact:",
            currentId
        );


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


        const firstName =
            firstNameInput.value.trim();

        const lastName =
            lastNameInput.value.trim();

        const phone =
            phoneInput.value.trim();

        const email =
            emailInput.value.trim();


        console.log(
            "Contact values:",
            {
                firstName: firstName,
                lastName: lastName,
                phone: phone,
                email: email
            }
        );


        setButtonLoading(
            saveContactButton,
            true,
            "Saving..."
        );


        showStatus(
            "Saving contact information...",
            "info"
        );


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


        ZOHO.CRM.API.updateRecord({

            Entity: "Contacts",

            APIData: contactData,

            Trigger: []

        })

        .then(function(response) {

            console.log(
                "Contact update response:",
                response
            );


            if (
                !response ||
                !response.data ||
                response.data.length === 0
            ) {

                throw new Error(
                    "Zoho CRM did not return a Contact update response."
                );

            }


            const result =
                response.data[0];


            console.log(
                "Contact update result:",
                result
            );


            // Check Zoho response status
            if (
                result.status &&
                result.status.toLowerCase() !== "success"
            ) {

                throw new Error(
                    result.message ||
                    "Zoho CRM rejected the Contact update."
                );

            }


            if (
                result.code &&
                result.code !== "SUCCESS"
            ) {

                throw new Error(
                    result.message ||
                    "Zoho CRM rejected the Contact update."
                );

            }


            // ------------------------------------------------
            // VERIFY CONTACT SAVE
            // ------------------------------------------------

            console.log(
                "Verifying Contact information..."
            );


            return ZOHO.CRM.API.getRecord({

                Entity: "Contacts",

                RecordID: currentId

            });

        })

        .then(function(response) {

            console.log(
                "Contact verification response:",
                response
            );


            if (
                !response ||
                !response.data ||
                response.data.length === 0
            ) {

                throw new Error(
                    "Unable to verify the updated Contact."
                );

            }


            const contact =
                response.data[0];


            console.log(
                "Verified Contact:",
                contact
            );


            const savedFirstName =
                contact.First_Name || "";

            const savedLastName =
                contact.Last_Name || "";

            const savedPhone =
                contact.Phone || "";

            const savedEmail =
                contact.Email || "";


            const contactVerified =

                savedFirstName === firstName &&

                savedLastName === lastName &&

                savedPhone === phone &&

                savedEmail === email;


            if (!contactVerified) {

                console.error(
                    "Contact verification failed.",
                    {
                        expected: contactData,

                        actual: {
                            First_Name:
                                savedFirstName,

                            Last_Name:
                                savedLastName,

                            Phone:
                                savedPhone,

                            Email:
                                savedEmail
                        }
                    }
                );


                throw new Error(
                    "CRM did not save the Contact information correctly."
                );

            }


            showStatus(
                "Contact information saved successfully.",
                "success"
            );


            console.log(
                "Contact saved and verified successfully."
            );

        })

        .catch(function(error) {

            console.error(
                "Error saving Contact:",
                error
            );


            showStatus(
                error.message ||
                "Failed to save Contact information.",
                "error"
            );

        })

        .finally(function() {

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
    function() {

        console.log(
            "Lookup Address button clicked."
        );


        const postalCode =
            postalCodeInput.value.trim();


        console.log(
            "Looking up postal code:",
            postalCode
        );


        if (!postalCode) {

            showStatus(
                "Please enter a postal code.",
                "error"
            );

            return;

        }


        // ------------------------------------------------
        // U.S. ZIP CODE VALIDATION
        // ------------------------------------------------

        const zipPattern =
            /^\d{5}(-\d{4})?$/;


        if (!zipPattern.test(postalCode)) {

            showStatus(
                "Please enter a valid U.S. ZIP code.",
                "error"
            );

            return;

        }


        setButtonLoading(
            lookupAddressButton,
            true,
            "Looking up..."
        );


        showStatus(
            "Looking up address...",
            "info"
        );


        // ------------------------------------------------
        // ZIPPOPOTAM API
        // ------------------------------------------------

        const apiUrl =
            "https://api.zippopotam.us/us/" +
            encodeURIComponent(postalCode);


        console.log(
            "Postal API URL:",
            apiUrl
        );


        fetch(apiUrl)

        .then(function(response) {

            console.log(
                "Postal API HTTP status:",
                response.status
            );


            if (!response.ok) {

                throw new Error(
                    "Postal code could not be found."
                );

            }


            return response.json();

        })

        .then(function(data) {

            console.log(
                "Postal API response:",
                data
            );


            if (
                !data ||
                !data.places ||
                data.places.length === 0
            ) {

                throw new Error(
                    "No address information was found for this postal code."
                );

            }


            const place =
                data.places[0];


            // ------------------------------------------------
            // AUTO-FILL ADDRESS
            // ------------------------------------------------

            const city =
                place["place name"] || "";

            const state =
                place["state"] || "";

            const country =
                data["country"] || "";


            cityInput.value =
                city;

            stateInput.value =
                state;

            countryInput.value =
                country;


            console.log(
                "Address auto-filled:",
                {
                    city: city,
                    state: state,
                    country: country
                }
            );


            showStatus(
                "Address details found and filled automatically.",
                "success"
            );

        })

        .catch(function(error) {

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

        .finally(function() {

            setButtonLoading(
                lookupAddressButton,
                false
            );

        });

    }
);


// ========================================================
// SAVE ADDRESS
// ========================================================

saveAddressButton.addEventListener(
    "click",
    function() {

        console.log(
            "Save Address button clicked."
        );


        const currentId =
            getContactId();


        console.log(
            "Contact ID used for Save Address:",
            currentId
        );


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
        // COLLECT ADDRESS VALUES
        // ------------------------------------------------

        const street =
            streetAddressInput.value.trim();

        const city =
            cityInput.value.trim();

        const state =
            stateInput.value.trim();

        const postalCode =
            postalCodeInput.value.trim();

        const country =
            countryInput.value.trim();


        console.log(
            "Address values:",
            {
                street: street,
                city: city,
                state: state,
                postalCode: postalCode,
                country: country
            }
        );


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
        // ADDRESS UPDATE PAYLOAD
        // ------------------------------------------------

        const addressData = {

            id: currentId,

            Mailing_Street:
                street,

            Mailing_City:
                city,

            Mailing_State:
                state,

            Mailing_Zip:
                postalCode,

            Mailing_Country:
                country

        };


        console.log(
            "Address update payload:",
            addressData
        );


        // ------------------------------------------------
        // UPDATE CONTACT
        // ------------------------------------------------

        ZOHO.CRM.API.updateRecord({

            Entity: "Contacts",

            APIData: addressData,

            Trigger: []

        })

        .then(function(response) {

            console.log(
                "Address update response:",
                response
            );


            // ------------------------------------------------
            // CHECK RESPONSE
            // ------------------------------------------------

            if (
                !response ||
                !response.data ||
                response.data.length === 0
            ) {

                throw new Error(
                    "Zoho CRM did not return an address update response."
                );

            }


            const result =
                response.data[0];


            console.log(
                "Address update result:",
                result
            );


            // ------------------------------------------------
            // CHECK UPDATE STATUS
            // ------------------------------------------------

            if (
                result.status &&
                result.status.toLowerCase() !== "success"
            ) {

                throw new Error(
                    result.message ||
                    "Zoho CRM rejected the address update."
                );

            }


            if (
                result.code &&
                result.code !== "SUCCESS"
            ) {

                throw new Error(
                    result.message ||
                    "Zoho CRM rejected the address update."
                );

            }


            // ------------------------------------------------
            // VERIFY SAVED ADDRESS
            // ------------------------------------------------

            console.log(
                "Verifying saved address..."
            );


            return ZOHO.CRM.API.getRecord({

                Entity: "Contacts",

                RecordID: currentId

            });

        })

        .then(function(response) {

            console.log(
                "Contact verification response:",
                response
            );


            if (
                !response ||
                !response.data ||
                response.data.length === 0
            ) {

                throw new Error(
                    "Unable to verify the updated Contact."
                );

            }


            const contact =
                response.data[0];


            console.log(
                "Verified Contact address:",
                {
                    Mailing_Street:
                        contact.Mailing_Street,

                    Mailing_City:
                        contact.Mailing_City,

                    Mailing_State:
                        contact.Mailing_State,

                    Mailing_Zip:
                        contact.Mailing_Zip,

                    Mailing_Country:
                        contact.Mailing_Country
                }
            );


            // ------------------------------------------------
            // GET SAVED VALUES
            // ------------------------------------------------

            const savedStreet =
                contact.Mailing_Street || "";

            const savedCity =
                contact.Mailing_City || "";

            const savedState =
                contact.Mailing_State || "";

            const savedZip =
                contact.Mailing_Zip || "";

            const savedCountry =
                contact.Mailing_Country || "";


            // ------------------------------------------------
            // VERIFY EACH FIELD
            // ------------------------------------------------

            const addressVerified =

                savedStreet === street &&

                savedCity === city &&

                savedState === state &&

                savedZip === postalCode &&

                savedCountry === country;


            // ------------------------------------------------
            // IF VERIFICATION FAILS
            // ------------------------------------------------

            if (!addressVerified) {

                console.error(
                    "Address verification failed.",
                    {
                        expected: addressData,

                        actual: {
                            Mailing_Street:
                                savedStreet,

                            Mailing_City:
                                savedCity,

                            Mailing_State:
                                savedState,

                            Mailing_Zip:
                                savedZip,

                            Mailing_Country:
                                savedCountry
                        }
                    }
                );


                throw new Error(
                    "CRM did not save the address values correctly."
                );

            }


            // ------------------------------------------------
            // SUCCESS
            // ------------------------------------------------

            showStatus(
                "Contact and address details saved successfully.",
                "success"
            );


            // Browser popup
            alert(
                "Contact and address details saved successfully."
            );


            console.log(
                "Address saved and verified successfully."
            );

        })

        .catch(function(error) {

            console.error(
                "Error saving address:",
                error
            );


            showStatus(
                error.message ||
                "Failed to save address.",
                "error"
            );

        })

        .finally(function() {

            setButtonLoading(
                saveAddressButton,
                false
            );

        });

    }
);


// ========================================================
// ZOHO CRM PAGE LOAD EVENT
// ========================================================

ZOHO.embeddedApp.on(
    "PageLoad",
    function(data) {

        console.log(
            "Zoho PageLoad data:",
            data
        );


        // ------------------------------------------------
        // GET ENTITY ID
        // ------------------------------------------------

        let entityId =
            data && data.EntityId;


        console.log(
            "Raw EntityId:",
            entityId
        );


        // ------------------------------------------------
        // HANDLE ARRAY FORMAT
        // ------------------------------------------------

        if (Array.isArray(entityId)) {

            entityId =
                entityId[0];

        }


        // ------------------------------------------------
        // HANDLE STRING FORMAT
        // ------------------------------------------------

        if (
            typeof entityId === "string" &&
            entityId.includes(",")
        ) {

            entityId =
                entityId.split(",")[0].trim();

        }


        // ------------------------------------------------
        // VALIDATE CONTACT ID
        // ------------------------------------------------

        if (!entityId) {

            console.error(
                "Contact ID was not received from Zoho CRM."
            );


            showStatus(
                "Unable to identify the Contact record.",
                "error"
            );


            return;

        }


        // ------------------------------------------------
        // STORE CONTACT ID
        // ------------------------------------------------

        setContactId(
            entityId
        );


        console.log(
            "Current Contact ID:",
            getContactId()
        );


        // ------------------------------------------------
        // LOAD CONTACT
        // ------------------------------------------------

        loadContact(
            getContactId()
        );

    }
);


// ========================================================
// INITIALIZE ZOHO EMBEDDED APP
// ========================================================

console.log(
    "Initializing Zoho CRM Contact Quick Editor..."
);


ZOHO.embeddedApp.init()

.then(function() {

    console.log(
        "Zoho CRM Embedded App initialized successfully."
    );

})

.catch(function(error) {

    console.error(
        "Zoho CRM Embedded App initialization failed:",
        error
    );

});
