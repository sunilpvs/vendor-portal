import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import Header from "../../components/Header";
import styles from "./vms.module.css";
import { Modal, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { addCompanyInfo, updateCompanyInfo, getCompanyInfo, getCounterPartyInfo } from "../../services/vms/counterPartyService";
import { addMsmeDetails, updateMsmeDetails, getMsmeDetails } from "../../services/vms/msmeService";
import { addBankDetails, updateBankDetails, getBankDetails } from "../../services/vms/bankDetailsService";
import { addGstRegistrations, updateGstRegistrations, addGoodsAndServices, updateGoodsAndServices, addIncomeTaxDetails, updateIncomeTaxDetails, getGstRegistrations, getIncomeTaxDetails, getGoodsAndServices } from "../../services/vms/gstService";
import { addDocuments, updateDocuments, getDocumentDetails } from "../../services/vms/documentService";

import { getPreviousComments } from "../../services/vms/commentsService";

import { getCountryCombo } from "../../services/admin/countryService";

import { addDeclarations, getDeclarations, updateDeclarations } from "../../services/vms/declarationService";
import { useParams } from "react-router-dom";
import { getReferenceId, getRfqStatus, submitRfq } from "../../services/vms/referenceIdService";
import { toast } from "react-hot-toast";
import { getStateCombo } from "../../services/admin/stateService";
import InstructionsStep from "./Components/InstructionsPopup";
import { FiBookOpen } from "react-icons/fi";


const VmsRequest = () => {
    const [referenceId, setReferenceId] = useState(null);
    const [rfqStatus, setRfqStatus] = useState(null);
    const readOnlyStatuses = [8, 9, 11, 12, 13, 14];
    const isReadOnly = readOnlyStatuses.includes(rfqStatus);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [countryCode, setCountryCode] = useState("");
    const [sameAsRegistered, setSameAsRegistered] = useState(false);
    const [transactionType, setTransactionType] = useState("");
    const [ifscCode, setIfscCode] = useState("");
    const [swiftCode, setSwiftCode] = useState("");
    const [signature, setSignature] = useState(null);
    const [showConfirmPopup, setShowConfirmPopup] = useState(false);

    const [currentPage, setCurrentPage] = useState(0);
    const [showInstructions, setShowInstructions] = useState(false);
    const [firstTime, setFirstTime] = useState(false);

    const [gstApplicable, setGstApplicable] = useState("");
    const [tdsApplicable, setTdsApplicable] = useState(false);

    const [isOtherBankCountry, setIsOtherBankCountry] = useState(false);
    const [bankCountryName, setBankCountryName] = useState("");

    const [tanStatus, setTanStatus] = useState(""); // yes or no
    const [tanNumber, setTanNumber] = useState("");




    const handleInstructionsClick = () => {
        const hasAgreed = localStorage.getItem("hasAgreedInstructions");
        setFirstTime(!hasAgreed); // true = first time
        setShowInstructions(true);
    };




    const navigate = useNavigate();

    const fetchAndSetReferenceId = async () => {
        try {
            const response = await getReferenceId();
            const refId = response?.data?.reference_id || '';
            setReferenceId(refId);
        } catch (error) {
            console.error("Failed to fetch reference ID:", error);
        }
    };

    useEffect(() => {
        fetchAndSetReferenceId();
    }, []);

    // CIN input handler: uppercase, strip non-alphanumeric, limit to 21 chars
    const handleCinChange = (e) => {
        const raw = e.target.value || "";
        const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 21);
        setCompanyInfo(prev => ({ ...prev, cin_number: cleaned }));
    };


    const getCountries = async () => {
        try {
            const response = await getCountryCombo();
            const countriesResp = response?.data?.map(c => ({
                id: c.id,
                country: c.country,
                code: c.code || c.isd_code || "", // backend field or manual mapping
            })) || [];
            setCountries(countriesResp);
        } catch (error) {
            console.error("Failed to fetch countries:", error);
        }
    };

    useEffect(() => {
        getCountries();
    }, []);

    const getStates = async () => {
        try {
            const response = await getStateCombo();
            const statesResp = response?.data || [];  // Default to empty array if no data
            setStates(statesResp);
        } catch (error) {
            console.error("Failed to fetch countries:", error);
        }
    };



    useEffect(() => {
        getStates();
    }, []);


    const stepLabels = [
        "Instructions",
        "Business Entity Details",
        "MSME Details",
        "GST Information",
        "Bank Details",
        "Documents and Attachments",
        "Declaration and Acknowledgement",
    ];

    const totalSteps = stepLabels.length;


    useEffect(() => {
        const accepted = localStorage.getItem("instructionsAccepted");
        const refId = new URLSearchParams(window.location.search).get("refId");

        if (accepted === "true" || refId) {
            // ✅ Already accepted or accessed by reference ID — skip instructions
            setCurrentPage(1);
            setFirstTime(false);
        } else {
            // 🆕 First visit — show instructions step
            setCurrentPage(0);
            setFirstTime(true);
        }
    }, []);


    const [goods, setGoods] = useState([]);
    const [services, setServices] = useState([]);
    const [goodsAndServices, setGoodsAndServices] = useState([]);

    // ======== GOODS ========
    const gsForm_addGoods = () => {
        if (goods.length < 5) setGoods([...goods, ""]);
    };
    // 🧾 GOODS input change
    const gsForm_changeGoods = (index, value) => {
        // ✅ allow letters, numbers, space, comma, dot, dash, slash
        const cleaned = value.replace(/[^A-Za-z0-9,.\-\/\s]/g, "").toUpperCase();

        const updated = [...goods];
        updated[index] = cleaned;
        setGoods(updated);
    };

    const gsForm_deleteGoods = (index) => {
        const updated = [...goods];
        updated.splice(index, 1);
        setGoods(updated);
    };

    // ======== SERVICES ========
    const gsForm_addService = () => {
        if (services.length < 5) setServices([...services, ""]);
    };

    // 🧾 SERVICES input change
    const gsForm_changeService = (index, value) => {
        const cleaned = value.replace(/[^A-Za-z0-9,.\-\/\s]/g, "").toUpperCase();
        const updated = [...services];
        updated[index] = cleaned;
        setServices(updated);
    };

    const gsForm_deleteService = (index) => {
        const updated = [...services];
        updated.splice(index, 1);
        setServices(updated);
    };

    // ======== GOODS & SERVICES ========
    const gsForm_addGoodsServicesRow = () => {
        if (goodsAndServices.length < 5)
            setGoodsAndServices([...goodsAndServices, { goods: "", services: "" }]);
    };

    // 🧾 GOODS & SERVICES combined input change
    const gsForm_changeGoodsServices = (index, field, value) => {
        const cleaned = value.replace(/[^A-Za-z0-9,.\-\/\s]/g, "").toUpperCase();
        setGoodsAndServices((prev) => {
            const updated = [...prev];
            if (!updated[index]) {
                updated[index] = { goods: "", services: "" };
            }
            updated[index][field] = cleaned;
            return updated;
        });
    };

    const gsForm_deleteGoodsServices = (index) => {
        const updated = [...goodsAndServices];
        updated.splice(index, 1);
        setGoodsAndServices(updated);
    };


    const [selectedYear, setSelectedYear] = useState('');
    const [yearlyData, setYearlyData] = useState([]);

    // ✅ Dynamically generate N years from a start year
    const generateYearRanges = (startYear, count) => {
        const years = [];
        for (let i = 0; i < count; i++) {
            const from = startYear + i;
            const to = from + 1;
            years.push(`${from}-${to}`);
        }
        return years;
    };

    const availableYears = generateYearRanges(2021, 100); // Generate 10 years

    // ✅ Add a year block
    const handleAddYear = () => {
        if (
            selectedYear &&
            yearlyData.length < 3 &&
            !yearlyData.find(entry => entry.year === selectedYear)
        ) {
            setYearlyData(prev => [
                ...prev,
                {
                    year: selectedYear,
                    total_sales_volume: "",             // total_sales_volume
                    total_sales_amount: "",             // total_sales_amount
                    export_sales_volume: "",      // export_sales_volume
                    export_sales_amount: "",      // export_sales_amount
                    file: null
                }

            ]);
            setSelectedYear('');
        }
    };

    // ✅ Input value change
    const handleChange = (index, field, value) => {
        setYearlyData(prev => {
            const updated = [...prev];
            updated[index][field] = value;
            return updated;
        });
    };


    // ✅ File change
    const handleFileChange = (index, file) => {
        setYearlyData(prev => {
            const updated = [...prev];
            updated[index].file = file;
            return updated;
        });
    };
 const handleDocumentChange = (field, file) => {
    if (!file) return;

    // Allowed MIME types
    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf"
    ];

    // ❌ Invalid file type
    if (!allowedTypes.includes(file.type)) {
        alert(
            "Please verify and upload documents in JPG, JPEG, PNG, or PDF format."
        );
        return;
    }

    // ❌ Size > 5 MB
    if (file.size > 5 * 1024 * 1024) {
        alert(
            "The maximum file size allowed is 5 MB."
        );
        return;
    }

    // ✅ Valid → store file
    setDocuments((prev) => ({
        ...prev,
        [field]: {
            ...prev[field],   // 👈 keeps docId, url from DB, etc.
            file,
            fileName: file.name,
            url: URL.createObjectURL(file), // preview
        },
    }));
};


    const handleValidatedFileChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
        const maxSize = 5 * 1024 * 1024; // 5 MB

        if (!allowedTypes.includes(file.type)) {
            alert("Invalid file type! Please upload only JPG, JPEG, PNG, or PDF files.");
            e.target.value = "";
            return;
        }

        if (file.size > maxSize) {
            alert("File size exceeds 5 MB! Please upload a smaller file.");
            e.target.value = "";
            return;
        }

        handleDocumentChange(fieldName, file);
    };


    // ✅ Step 1: Constants for validation
    const MAX_FILE_SIZE_BYTES = 1 * 1024 * 1024; // 1MB
    const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

    /**
     * ✅ Checks if an uploaded image has a mostly white background
     * This function samples pixels from the image and calculates how many are near-white.
     * Returns true if at least 85% of the image is white.
     */
    const isMostlyWhiteBackground = (file) => {
        return new Promise((resolve) => {
            const img = new Image();
            const url = URL.createObjectURL(file);

            img.onload = () => {
                const w = Math.min(300, img.width);
                const h = Math.min(300, img.height);
                const canvas = document.createElement("canvas");
                canvas.width = w;
                canvas.height = h;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, w, h);

                try {
                    const data = ctx.getImageData(0, 0, w, h).data;
                    let whitePixels = 0;
                    const totalPixels = w * h;

                    for (let i = 0; i < data.length; i += 16) { // sample pixels
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        if (r >= 245 && g >= 245 && b >= 245) whitePixels++;
                    }

                    const ratio = whitePixels / (totalPixels / 4);
                    URL.revokeObjectURL(url);
                    resolve(ratio >= 0.85);
                } catch (err) {
                    console.warn("Image validation error:", err);
                    URL.revokeObjectURL(url);
                    resolve(true); // allow if check fails
                }
            };

            img.onerror = () => {
                URL.revokeObjectURL(url);
                resolve(false);
            };

            img.src = url;
        });
    };


    const handleDeclarationChange = async (e) => {
        const { name, type, files, value } = e.target;

        if (type === "file") {
            const file = files[0];
            if (!file) return;

            // 1️⃣ Check file type
            if (!ALLOWED_TYPES.includes(file.type)) {
                toast.error("Only JPG, JPEG and PNG files are allowed.");
                return;
            }

            // 2️⃣ Check file size
            if (file.size > MAX_FILE_SIZE_BYTES) {
                toast.error("File size must be less than 1MB.");
                return;
            }

            // 3️⃣ Check white background
            const validatingToastId = toast.loading("Checking background...");
            const isWhite = await isMostlyWhiteBackground(file); // ✅ Works only inside async
            toast.dismiss(validatingToastId);

            if (!isWhite) {
                toast.error("Image background must be plain white.");
                return;
            }

            // ✅ Passed all checks
            setDeclarationInfo((prev) => ({
                ...prev,
                [name]: { file, url: URL.createObjectURL(file) },
            }));

            toast.success("Signature uploaded successfully!");
            setDeclarationInfo((prev) => ({
                ...prev,
                [name]: {
                    file,
                    url: URL.createObjectURL(file), // ✅ create local preview
                },
            }));
        } else {
            setDeclarationInfo((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };


    // ✅ Delete year section
    const handleDelete = (index) => {
        const updated = [...yearlyData];
        updated.splice(index, 1);
        setYearlyData(updated);
    };

    const currentYear = new Date().getFullYear();


    const generateFinancialYears = () => {
        const years = [];
        for (let y = currentYear - 2; y < currentYear; y++) {
            years.push(`${y}-${y + 1}`);
        }
        return years;
    };

    const financialYears = generateFinancialYears();
    const [formData, setFormData] = useState({
        fy1: "",
        fy2: "",
        it1_id: null,
        it2_id: null,
        currencyType1: "",
        currencyType2: "",
        currencyName1: "",
        currencyName2: "",
        turnover1: "",
        turnover2: "",
        itrStatus1: "",
        itrStatus2: "",
        ackNo1: "",
        ackNo2: "",
        filedDate1: "",
        filedDate2: "",

    });

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const fy1 = `${currentYear - 1}-${currentYear}`;
        const fy2 = `${currentYear - 2}-${currentYear - 1}`;


        setFormData((prev) => ({
            ...prev,
            fy1,
            fy2,

        }));
    }, []);


    const handleIncomeChange = (e) => {
        const { name, value } = e.target;

        // 🧾 Turnover fields — allow digits + one decimal point (float values)
        if (name.startsWith("turnover")) {
            if (value === "" || /^[0-9]*\.?[0-9]*$/.test(value)) {
                setFormData((prev) => ({ ...prev, [name]: value }));
            }
            return;
        }

        // 🧾 ITR Acknowledgment Number — uppercase alphanumeric only
        if (name.startsWith("ackNo")) {
            const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
            setFormData((prev) => ({ ...prev, [name]: cleaned }));
            return;
        }

        // 🌐 Dropdown fields (Yes/No, Year, Month, Day) — keep as selected
        if (
            name.startsWith("itrStatus") ||
            name.startsWith("itrYear") ||
            name.startsWith("itrMonth") ||
            name.startsWith("itrDay")
        ) {
            setFormData((prev) => ({ ...prev, [name]: value }));
        } else {
            // Default — just set value as-is
            setFormData((prev) => ({ ...prev, [name]: value }));
        }

        // 🧮 Keep your existing day validation logic
        setFormData((prev) => {
            const updated = { ...prev, [name]: value };

            // Handle ITR day validation when month/year changes
            const itrMonthMatch = name.match(/^itrMonth(\d+)$/);
            const itrYearMatch = name.match(/^itrYear(\d+)$/);

            if (itrMonthMatch || itrYearMatch) {
                const idx = itrMonthMatch ? itrMonthMatch[1] : itrYearMatch[1];
                const monthKey = `itrMonth${idx}`;
                const yearKey = `itrYear${idx}`;
                const dayKey = `itrDay${idx}`;

                const maxDays = getDaysInMonth(updated[monthKey], updated[yearKey]);
                const curr = Number(updated[dayKey]);

                if (updated[dayKey] && (isNaN(curr) || curr > maxDays)) {
                    updated[dayKey] = ""; // reset invalid day
                }
            }

            return updated;
        });
    };



    // ✅ Get dynamic financial year options
    const getFilteredYears = (field) => {
        if (field === "fy1") {
            return financialYears;
        }
        if (field === "fy2") {
            return financialYears.filter((fy) => fy !== formData.fy1);
        }
        if (field === "fy3") {
            return financialYears.filter(
                (fy) => fy !== formData.fy1 && fy !== formData.fy2
            );
        }
        return [];
    };



    const [businessType, setBusinessType] = useState('');
    const [otherBusinessType, setOtherBusinessType] = useState('');
    const handleBusinessTypeChange = (e) => {
        setBusinessType(e.target.value);
        if (e.target.value !== 'Other') {
            setOtherBusinessType('');
        }
    };


    // Vendor dropdown

    const nextPage = () => {
        if (currentPage < totalSteps - 1) setCurrentPage(currentPage + 1);
    };
    const prevPage = () => {
        if (currentPage > 0) setCurrentPage(currentPage - 1);
    };



    // Group 1: Company types that require CIN, TAN, etc.
    const companyTypesRequiringFullDetails = [
        'Private Limited Companies',
        'Public Limited Companies',
        'One-Person Companies',
        'Joint-Venture Company',
    ];

    // Group 2: Simpler entities needing only registration number as per certificate
    const entitiesRequiringBasicRegistration = [
        'Sole Proprietorship',
        'Partnership',
        'Limited Liability Partnership',
        'Non-Government Organization(NGO)',
    ];

    const [hasTan, setHasTan] = useState(""); // "Yes" or "No"
    const [tanExemptionFile, setTanExemptionFile] = useState(null);







    // Step 1: Company Info | Counterparty information 
    const [companyInfo, setCompanyInfo] = useState({
        full_registered_name: "",
        business_entity_type: "",
        reg_number: "",
        tan_number: "",
        trading_name: "",
        company_email: "",
        country_type: "",
        country_id: null,
        state_id: null,
        country_text: "",
        state_text: "",
        telephone: "",
        registered_address: "",
        business_address: "",
        contact_person_title: "",
        contact_person_name: "",
        contact_person_email: "",
        contact_person_mobile: "",
        accounts_person_title: "",
        accounts_person_name: "",
        accounts_person_contact_no: "",
        accounts_person_email: "",

        isOtherCountry: false,
    });
    const isIndia = countries.find(c => c.id == companyInfo.country_id)?.country?.toLowerCase() === "india";

    const selectedEntityType = companyInfo.business_entity_type;
    const showFullCompanyFields = companyTypesRequiringFullDetails.includes(selectedEntityType);
    const showBasicRegistrationField = entitiesRequiringBasicRegistration.includes(selectedEntityType);



    //  Auto-set India for Sole Proprietorship & Partnership (non-editable)
    useEffect(() => {
        const isAutoIndiaType = ["Sole Proprietorship", "Partnership"].includes(
            companyInfo.business_entity_type
        );

        if (isAutoIndiaType) {
            const india = countries.find(
                (c) => c.country?.toLowerCase() === "india"
            );
            if (india) {
                setCompanyInfo((prev) => ({
                    ...prev,
                    country_of_incorporation: india.id,
                    isOtherCountry: false,
                    state: "",
                }));
            }
        }
    }, [companyInfo.business_entity_type, countries]);



    useEffect(() => {
        const fetchCompanyInfo = async () => {
            try {
                const response = await getCompanyInfo(referenceId);
                const data = response?.data;
                if (!data) return;

                const normalized = {
                    full_registered_name: data.full_registered_name || "",
                    business_entity_type: data.business_entity_type || "",
                    reg_number: data.reg_number || "",
                    tan_number: data.tan_number || "",
                    trading_name: data.trading_name || "",
                    company_email: data.company_email || "",

                    isOtherCountry: data.country_type === "Others",

                    country_type: data.country_type || "",

                    country_id: data.country_type === "India" ? data.country_id : null,
                    state_id: data.country_type === "India" ? data.state_id : null,

                    country_text: data.country_type === "Others" ? data.country_text : "",
                    state_text: data.country_type === "Others" ? data.state_text : "",
                    telephone: data.telephone || "",
                    registered_address: data.registered_address || "",
                    business_address: data.business_address || "",
                    contact_person_title: data.contact_person_title || "",
                    contact_person_name: data.contact_person_name || "",
                    contact_person_email: data.contact_person_email || "",
                    contact_person_mobile: data.contact_person_mobile || "",
                    accounts_person_title: data.accounts_person_title || "",
                    accounts_person_name: data.accounts_person_name || "",
                    accounts_person_contact_no: data.accounts_person_contact_no || "",
                    accounts_person_email: data.accounts_person_email || "",

                };



                setCompanyInfo((prev) => ({ ...prev, ...normalized }));
            } catch (error) {
                console.error("Error fetching company info:", error);
            }
        };

        if (referenceId) fetchCompanyInfo();
    }, [referenceId]);


    // submit company info add if its new else update
    const handleSubmitCompanyInfo = async (e) => {


    let errors = [];

    //REQUIRED FIELDS FOR STEP-1 ONLY (Except Country of Incorporation)

    if (!companyInfo.business_entity_type)
        errors.push("Nature of Business Entity is required");

    if (!companyInfo.company_name)
        errors.push("Registered Name (as per PAN) is required");

    if (!companyInfo.pan_number)
        errors.push("PAN Number is required");

    if (!companyInfo.trading_name)
        errors.push("Trading Name is required");

    if (!tanStatus)
        errors.push("TAN availability selection is required");

    if (tanStatus === "yes" && !companyInfo.tan_number)
        errors.push("TAN Number is required");

    if (!companyInfo.telephone)
        errors.push("Telephone Number is required");

    if (!companyInfo.registered_address)
        errors.push("Registered Address is required");

    if (!companyInfo.business_address)
        errors.push("Business Address is required");

    // Contact Person
    if (!companyInfo.contact_person_title)
        errors.push("Contact Person Title is required");

    if (!companyInfo.contact_person_name)
        errors.push("Contact Person Name is required");

    if (!companyInfo.contact_person_mobile)
        errors.push("Contact Person Mobile Number is required");

    if (!companyInfo.contact_person_email)
        errors.push("Contact Person Email is required");

    // Accounts Person
    if (!companyInfo.accounts_person_title)
        errors.push("Accounts Person Title is required");

    if (!companyInfo.accounts_person_name)
        errors.push("Accounts Person Name is required");

    if (!companyInfo.accounts_person_contact_no)
        errors.push("Accounts Person Contact Number is required");

    if (!companyInfo.accounts_person_email)
        errors.push("Accounts Person Email is required");


    if (errors.length > 0) {
        alert("Please fill all required fields:\n\n" + errors.join("\n"));
        return;
    }

    // ✅ If all good → move to next page
    nextPage();



        // try {
        //     const tanFormData = new FormData();
        //     tanFormData.append("reference_id", referenceId);
        //     tanFormData.append("tan_number", hasTan === "Yes" ? companyInfo.tan_number : "");
        //     // if (hasTan === "No" && tanExemptionFile) {
        //     //     tanFormData.append("tan_exemption_certificate", tanExemptionFile);
        //     // }

        //     await addCompanyInfo(referenceId, tanFormData);

        //     toast.success("Company information added successfully!");
        //     nextPage();
        // } catch (error) {
        //     console.error("Error adding company info:", error);
        //     toast.error("Error occurred while saving company information.");
        // }


        // add if new else update
        try {
            const existingResponse = await getCompanyInfo(referenceId);
            if (existingResponse && existingResponse.status === 200 && existingResponse.data && Object.keys(existingResponse.data).length > 0) {
                // Update existing
                await updateCompanyInfo(referenceId, companyInfo);
                toast.success("Company information updated successfully!");
                nextPage();
            }

        } catch (error) {
            // Add new
            try {
                await addCompanyInfo(referenceId, companyInfo);
                toast.success("Company information added successfully!");
                nextPage();
            } catch (err) {
                console.error("Error adding company info:", err);
                toast.error("Error occurred while saving company information.");
            }
        }

    };


    const [entityFields, setEntityFields] = useState({
        showFullFields: false,
        showBasicFields: false,
    });




    useEffect(() => {
        const selectedEntityType = companyInfo.business_entity_type;

        const showFullCompanyFields = companyTypesRequiringFullDetails.includes(selectedEntityType);
        const showBasicRegistrationField = entitiesRequiringBasicRegistration.includes(selectedEntityType);

        setEntityFields({
            showFullFields: showFullCompanyFields,
            showBasicFields: showBasicRegistrationField,
        });

        // Reset / Nullify fields bas   ed on business entity type
        setCompanyInfo((prev) => {
            let updatedInfo = { ...prev };

            // Case 1: Section 8 Company → registration number should be null
            if (selectedEntityType === 'Section 8 Company') {
                updatedInfo.registration_number = null;

                updatedInfo.tan_number = null;
            }


            // Case 2: Entities that don't require CIN/TAN → set them to null
            if (entitiesRequiringBasicRegistration.includes(selectedEntityType)) {
                updatedInfo.cin_number = null;
                updatedInfo.tan_number = null;
            }

            return updatedInfo;
        });
    }, [companyInfo.business_entity_type]);


    useEffect(() => {
        if (companyInfo.tan_number && companyInfo.tan_number !== "") {
            setTanStatus("yes");
        } else {
            setTanStatus("no");
        }
    }, [companyInfo.tan_number]);


    // auto select the checkbox if registered address and business address are same
    useEffect(() => {
        if (companyInfo.registered_address === companyInfo.business_address && companyInfo.registered_address !== "") {
            setSameAsRegistered(true);
        } else {
            setSameAsRegistered(false);
        }
    }, [companyInfo.registered_address, companyInfo.business_address]);


    const handleCompanyInfoChange = (e) => {
        const { name, value } = e.target;
        let cleaned = value;


        // 🟢 Name fields — only letters and spaces, uppercase
        const nameFields = [
            "full_registered_name",
            "trading_name",
            "contact_person_name",
            "accounts_person_name",
        ];
        if (nameFields.includes(name)) {
            cleaned = value.replace(/[^A-Za-z\s]/g, "").toUpperCase();
        }


        //  Registration / TAN / PAN / GST / UDYAM / NGO fields
        else if (
            [
                "reg_number",
                "firm_reg_number",
                "llp_reg_number",
                "plc_reg_number",
                "pulc_reg_number",
                "opc_reg_number",
                "sc_reg_number",
                "jvc_reg_number",
                "ngo_reg_number",
                "tan_number",
                "pan_number",
                "gst_vat_number",
                "udyam_registration_number",
                "registration_number",
            ].includes(name)
        ) {
            cleaned = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
        }

        // 🟢 Addresses — keep as typed
        else if (["registered_address", "business_address", "bank_address"].includes(name)) {
            cleaned = value;
        }

        // 🟢 Emails — lowercase
        else if (name.includes("email")) {
            cleaned = value.toLowerCase();
        }

        // 🟢 Phone numbers — digits and +, -
        else if (["telephone", "contact_person_mobile", "accounts_person_contact_no"].includes(name)) {
            cleaned = value.replace(/[^0-9+\-]/g, "");
        }

        // 🟢 Dropdowns — keep as selected
        else if (
            [
                "business_entity_type",
                "country_of_incorporation",
                "state",
                "contact_person_title",
                "accounts_person_title",
            ].includes(name)
        ) {
            cleaned = value;
        }

        // 🟢 Default — uppercase text
        else {
            cleaned = value.toUpperCase();
        }

        // ✅ Save cleaned value (not raw value)
        setCompanyInfo((prev) => ({
            ...prev,
            [name]: cleaned,
        }));

        // 🗺️ Country logic
        if (name === "country_of_incorporation") {
            const selectedCountry = countries.find((c) => c.id == value);
            if (selectedCountry) {
                setCountryCode(selectedCountry.code || "");
            }

            if (selectedCountry?.country?.toLowerCase() !== "india") {
                setCompanyInfo((prev) => ({
                    ...prev,
                    isOtherCountry: true,
                }));
            } else {
                setCompanyInfo((prev) => ({
                    ...prev,
                    isOtherCountry: false,
                }));
            }
        }
    };

    // STEP 2: MSME details
    const [msmeInfo, setMsmeInfo] = useState({
        registered_under_msme: "",
        udyam_registration_number: "",
        category: "",
    });

    useEffect(() => {
        const fetchMsme = async () => {
            try {
                const response = await getMsmeDetails(referenceId); // 👈 pass correct vendor_id
                if (response?.data?.msme) {
                    setMsmeInfo((prev) => ({
                        ...prev,
                        registered_under_msme: response?.data?.msme?.registered_under_msme === 1 ? "true" : "false",
                        udyam_registration_number: response?.data?.msme?.udyam_registration_number || "",
                        category: response?.data?.msme?.category || "",
                    }));
                }

            } catch (err) {
                console.error("Failed to fetch MSME info:", err);
            }
        };

        fetchMsme();
    }, [referenceId]);


    const handleMsmeChange = (e) => {
        const { name, value } = e.target;
        let cleaned = value;

        // 🧾 Udyam Registration Number → uppercase alphanumeric only
        if (name === "udyam_registration_number") {
            cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
        }

        // 🏷 Category (Micro / Small / Medium) or Dropdown → keep value as-is
        else if (["category", "registered_under_msme"].includes(name)) {
            cleaned = value;
        }

        // Default → uppercase
        else {
            cleaned = value.toUpperCase();
        }

        setMsmeInfo((prev) => ({
            ...prev,
            [name]: cleaned,
        }));
    };


    // add if new else update msme details
    const handleSaveMsmeInfo = async () => {


     let errors = [];

    // 1️⃣ MSME Registered selection required
    if (!msmeInfo.registered_under_msme) {
        errors.push("Please select whether MSME Registration is available.");
    }

    // 2️⃣ If MSME = Yes → validate Category + Udyam Number
    if (msmeInfo.registered_under_msme === "true") {

        if (!msmeInfo.msme_category || msmeInfo.msme_category.trim() === "") {
            errors.push("MSME Category is required.");
        }

        if (!msmeInfo.udyam_number || msmeInfo.udyam_number.trim() === "") {
            errors.push("Udyam Registration Number is required.");
        }
    }

    // 3️⃣ If MSME = No → do NOT validate category or udyam
    // (No extra validation here)

    // ❌ If errors exist → block next page
    if (errors.length > 0) {
        alert("Please fill required MSME details:\n\n" + errors.join("\n"));
        return;
    }

    // ✅ Everything OK → go to next step
    nextPage();



        try {

            const msmePayload = {
                type: "msme",
                registered_under_msme: msmeInfo.registered_under_msme === "true",
                udyam_registration_number: msmeInfo.udyam_registration_number,
                category: msmeInfo.category,
            };

            const existingResponse = await getMsmeDetails(referenceId);
            if (existingResponse && existingResponse.status === 200 && existingResponse.data && Object.keys(existingResponse.data).length > 0) {
                // Update existing
                await updateMsmeDetails(referenceId, msmePayload);
                toast.success("MSME information updated successfully!");
                nextPage();
            }
        } catch (error) {
            // Add new
            try {

                const msmePayload = {
                    type: "msme",
                    registered_under_msme: msmeInfo.registered_under_msme === "true",
                    udyam_registration_number: msmeInfo.udyam_registration_number,
                    category: msmeInfo.category,
                };

                await addMsmeDetails(referenceId, msmePayload);
                toast.success("MSME information added successfully!");
                nextPage();
            } catch (err) {
                console.error("Error adding MSME info:", err);
                toast.error("Error occurred while saving MSME information.");
            }
        }
    };


    const [goodsServices, setGoodsServices] = useState({
        counterparty_id: null,
        type_of_counterparty: "",
        others: "",
        items: [],
        type: "",
        description: "",
    });



    const [incomeTaxDetails, setIncomeTaxDetails] = useState({
        fin_year: "",
        turnover: "",
        status_of_itr: "",
        itr_ack_num: "",
        itr_filed_date: "",
    });

    // get goods and services AND counterparty type

    // api response
    //  {
    //     "goods_services": [
    //         {
    //             "gs_id": 3,
    //             "reference_id": "RFI-VEN-00001",
    //             "type": "Goods and Services",
    //             "description": "This is newly added"
    //         }
    //     ],
    //     "type_of_counterparty": {
    //         "counterparty_id": 1,
    //         "reference_id": "RFI-VEN-00001",
    //         "type_of_counterparty": "Others",
    //         "others": "Counterparty"
    //     }
    // }
    useEffect(() => {
        const fetchGoodsServices = async () => {
            try {
                const response = await getGoodsAndServices(referenceId);
                const data = response?.data;

                if (!data) return;

                const goodsArr = [];
                const servicesArr = [];
                const goodsServicesArr = [];
                const itemsArr = [];   // stores { gs_id, description }

                data.goods_services.forEach(item => {
                    itemsArr.push({
                        gs_id: item.gs_id,
                        description: item.description,
                        type: item.type
                    });

                    if (item.type === "Goods") {
                        goodsArr.push(item.description || "");
                    }

                    if (item.type === "Services") {
                        servicesArr.push(item.description || "");
                    }

                    if (item.type === "Goods and Services") {
                        const [g, s] = item.description.split(" & ");
                        goodsServicesArr.push({
                            goods: g || "",
                            services: s || ""
                        });
                    }
                });

                // Set field arrays
                setGoods(goodsArr);
                setServices(servicesArr);
                setGoodsAndServices(goodsServicesArr);

                // Set meta object
                setGoodsServices({
                    type: data.goods_services[0].type || "",
                    counterparty_id: data.type_of_counterparty?.counterparty_id || null,
                    type_of_counterparty: data.type_of_counterparty?.type_of_counterparty || "",
                    others: data.type_of_counterparty?.others || "",
                    items: itemsArr   // <- IMPORTANT for update mode
                });

            } catch (error) {
                console.error("Error fetching Goods and Services:", error);
            }
        };

        if (referenceId) fetchGoodsServices();
    }, [referenceId]);


    // get gst registrations and gst type
    // api response
    // {
    //     "gst_registrations": [
    //         {
    //             "gst_id": 1,
    //             "reference_id": "RFI-VEN-00001",
    //             "gst_applicable": 1,
    //             "state": 5,
    //             "gst_number": "9923LJDFKAS"
    //         },
    //         {
    //             "gst_id": 2,
    //             "reference_id": "RFI-VEN-00001",
    //             "gst_applicable": 1,
    //             "state": 2,
    //             "gst_number": "27ABCDE1234F1Z5"
    //         }
    //     ],
    //     "gst_type": {
    //         "gst_type_id": 1,
    //         "reference_id": "RFI-VEN-00001",
    //         "reg_type": "Regular",
    //         "gstr_filling_type": "Quarterly"
    //     }
    // }



    const [count, setCount] = useState(0);
    const [gstformData, setgstFormData] = useState([]);

    const handleCountChange = (e) => {
        const newCount = parseInt(e.target.value, 10);
        setCount(newCount);

        const updatedData = Array.from({ length: newCount }, (_, index) => {
            return formData[index] || { state: "", gstNumber: "", regDate: "" };
        });

        setgstFormData(updatedData);
    };


    const [gstMeta, setGstMeta] = useState({
        gst_type_id: null,
        reg_type: "",
        gstr_filling_type: "",
        gst_applicable: "",
    });


    useEffect(() => {
        const fetchGstRegistrations = async () => {
            try {
                const response = await getGstRegistrations(referenceId);
                const data = response?.data;

                if (data) {
                    const gstItems = data.gst_registrations.map(item => ({
                        gst_id: item.gst_id || null,
                        state: item.state || "",
                        gstNumber: item.gst_number || "",
                        regDate: item.reg_date || "",
                    }));

                    setgstFormData(gstItems);

                    if (data.gst_registrations.length > 0) {
                        setGstApplicable(
                            data.gst_registrations[0].gst_applicable === 1 ? "true" : "false"
                        );
                    }

                    setCount(gstItems.length);

                    if (data.gst_type) {
                        setGstMeta({
                            gst_type_id: data.gst_type.gst_type_id || null,
                            reg_type: data.gst_type.reg_type || "",
                            gstr_filling_type: data.gst_type.gstr_filling_type || "",
                        });
                    }
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };

        if (referenceId) fetchGstRegistrations();
    }, [referenceId]);


    // get income tax details
    // api response
    //     [
    //     {
    //         "it_id": 1,
    //         "reference_id": "RFI-VEN-00001",
    //         "fin_year": "2024-2025",
    //         "currency_type": "Others",
    //         "others": "akfk",
    //         "turnover": "2000000.00000",
    //         "status_of_itr": 0,
    //         "itr_ack_num": null,
    //         "itr_filed_date": null
    //     },
    //     {
    //         "it_id": 2,
    //         "reference_id": "RFI-VEN-00001",
    //         "fin_year": "2023-2024",
    //         "currency_type": "Rupees (INR)",
    //         "others": null,
    //         "turnover": "900000.00000",
    //         "status_of_itr": 0,
    //         "itr_ack_num": null,
    //         "itr_filed_date": null
    //     }
    // ]


    // const [formData, setFormData] = useState({
    //     fy1: "",
    //     fy2: "",
    //     currencyType1: "",
    //     currencyType2: "",
    //     currencyName1: "",
    //     currencyName2: "",
    //     turnover1: "",
    //     turnover2: "",
    //     itrStatus1: "",
    //     itrStatus2: "",
    //     ackNo1: "",
    //     ackNo2: "",
    //     filedDate1: "",
    //     filedDate2: "",

    // });



    useEffect(() => {
        const fetchIncomeTaxDetails = async () => {
            try {
                const response = await getIncomeTaxDetails(referenceId);
                const data = response?.data;
                if (data && Array.isArray(data)) {
                    const incomeTaxItems = {};

                    // Parse ITR filed date and extract year, month, day
                    const parseItrDate = (dateStr) => {
                        if (!dateStr) return { year: "", month: "", day: "" };

                        const date = new Date(dateStr);
                        if (isNaN(date.getTime())) return { year: "", month: "", day: "" };

                        return {
                            year: date.getFullYear().toString(),
                            month: String(date.getMonth() + 1).padStart(2, "0"),
                            day: String(date.getDate()).padStart(2, "0")
                        };
                    };

                    data.forEach(item => {
                        if (item.fin_year) {
                            if (item.fin_year === formData.fy1) {
                                const itrDate1 = parseItrDate(item.itr_filed_date);
                                incomeTaxItems.fy1 = {
                                    it1_id: item.it_id || null,
                                    fin_year: item.fin_year || "",
                                    currencyType1: item.currency_type || "",
                                    currencyName1: item.currency_type === "Others" ? item.others || "" : "",
                                    turnover1: item.turnover || "",
                                    itrStatus1: item.status_of_itr == 1 ? "true" : "false",
                                    ackNo1: item.itr_ack_num || "",
                                    filedDate1: item.itr_filed_date || "",
                                    itrYear1: itrDate1.year,
                                    itrMonth1: itrDate1.month,
                                    itrDay1: itrDate1.day,
                                };
                            } else if (item.fin_year === formData.fy2) {
                                const itrDate2 = parseItrDate(item.itr_filed_date);
                                incomeTaxItems.fy2 = {
                                    it2_id: item.it_id || null,
                                    fin_year: item.fin_year || "",
                                    currencyType2: item.currency_type || "",
                                    currencyName2: item.currency_type === "Others" ? item.others || "" : "",
                                    turnover2: item.turnover || "",
                                    itrStatus2: item.status_of_itr == 1 ? "true" : "false",
                                    ackNo2: item.itr_ack_num || "",
                                    filedDate2: item.itr_filed_date || "",
                                    itrYear2: itrDate2.year,
                                    itrMonth2: itrDate2.month,
                                    itrDay2: itrDate2.day,
                                };
                            }
                        }
                    });

                    setFormData((prev) => ({
                        ...prev,
                        ...incomeTaxItems.fy1,
                        ...incomeTaxItems.fy2,
                    }));

                    console.log("Fetched Income Tax Details:", formData);
                }
            } catch (error) {
                console.error("Error fetching Income Tax Details:", error);
            }
        };
        if (referenceId) fetchIncomeTaxDetails();
    }, [referenceId, formData.fy1, formData.fy2]);



    // save goods and services
    // api payload
    // post:
    // {
    //     "type_of_counterparty": "Trading Entity",
    //         "others": "Counterparty",
    //             "type": "goods",
    //                 "descriptions": ["goods1", "goods2"]
    // }

    // put:
    // {
    //     "type": "Goods and services",
    //         "type_of_counterparty": "Others",
    //             "others": "Counterparty",
    //                 "items": [
    //                     { "gs_id": 1, "description": "Updated item" },
    //                     { "gs_id": 2, "description": "Another updated item" },
    //                     { "description": "This is newly added" }
    //                 ]
    // }



    // add if new else update goods and services
    const saveGoodsAndServices = async () => {
        try {
            // 1. Build new descriptions array
            let newDescriptions = [];

            if (goodsServices.type === "Goods") {
                newDescriptions = goods.filter(x => x?.trim() !== "");
            }

            if (goodsServices.type === "Services") {
                newDescriptions = services.filter(x => x?.trim() !== "");
            }

            if (goodsServices.type === "Goods and Services") {
                newDescriptions = goodsAndServices
                    .filter(x => x?.goods?.trim() || x?.services?.trim())
                    .map(x => `${x.goods} & ${x.services}`);
            }

            const validDescriptions = newDescriptions.filter(desc => desc.trim() !== "");

            const existingItems = goodsServices.items || [];
            const updatedPayloadItems = [];

            // 2. Match valid descriptions with existing items BY ORDER
            validDescriptions.forEach((desc, i) => {
                const existing = existingItems[i];

                if (existing && existing.gs_id) {
                    updatedPayloadItems.push({
                        gs_id: existing.gs_id,
                        description: desc
                    });
                } else {
                    updatedPayloadItems.push({
                        description: desc
                    });
                }
            });

            // 3. Determine update or add
            // Check if we have existing items with gs_id OR if counterparty_id exists
            const isUpdate = existingItems.some(item => item.gs_id) || goodsServices.counterparty_id;

            const payload = isUpdate
                ? {
                    type: goodsServices.type,
                    type_of_counterparty: goodsServices.type_of_counterparty,
                    others: goodsServices.others,
                    items: updatedPayloadItems
                }
                : {
                    type: goodsServices.type,
                    type_of_counterparty: goodsServices.type_of_counterparty,
                    others: goodsServices.others,
                    descriptions: validDescriptions
                };

            console.log("FINAL PAYLOAD:", payload);

            if (isUpdate) {
                await updateGoodsAndServices(referenceId, payload);
            } else {
                await addGoodsAndServices(referenceId, payload);
            }

            // Refresh the data after successful save instead of page reload
            const response = await getGoodsAndServices(referenceId);
            const data = response?.data;

            if (data) {
                const goodsArr = [];
                const servicesArr = [];
                const goodsServicesArr = [];
                const itemsArr = [];

                data.goods_services.forEach(item => {
                    itemsArr.push({
                        gs_id: item.gs_id,
                        description: item.description,
                        type: item.type
                    });

                    if (item.type === "Goods") {
                        goodsArr.push(item.description || "");
                    }

                    if (item.type === "Services") {
                        servicesArr.push(item.description || "");
                    }

                    if (item.type === "Goods and Services") {
                        const [g, s] = item.description.split(" & ");
                        goodsServicesArr.push({
                            goods: g || "",
                            services: s || ""
                        });
                    }
                });

                // Update state with fresh data including gs_id values
                setGoods(goodsArr);
                setServices(servicesArr);
                setGoodsAndServices(goodsServicesArr);

                setGoodsServices({
                    type: data.goods_services[0]?.type || goodsServices.type,
                    counterparty_id: data.type_of_counterparty?.counterparty_id || null,
                    type_of_counterparty: data.type_of_counterparty?.type_of_counterparty || goodsServices.type_of_counterparty,
                    others: data.type_of_counterparty?.others || goodsServices.others,
                    items: itemsArr
                });
            }

            nextPage();

        } catch (error) {
            console.error("Save Goods & Services error:", error);
        }
    };



    // save gst registrations
    const saveGstRegistrations = async () => {
        try {
            const gstApplicableBool = gstApplicable === "true";

            // base payload for PUT and POST
            let payload = {
                gst_applicable: gstApplicableBool,
                reg_type: gstMeta.reg_type,
                gstr_filling_type: gstMeta.gstr_filling_type
            };

            // CASE: gst_applicable = false → only send { gst_applicable: false }
            if (!gstApplicableBool) {
                await updateGstRegistrations(referenceId, { gst_applicable: false });
                return;
            }

            // Build items list
            const items = gstformData.map(i => {
                const base = {
                    state: i.state,
                    gst_number: i.gstNumber
                };

                // include gst_id ONLY if it exists → PUT update
                if (i.gst_id) {
                    base.gst_id = i.gst_id;
                }

                return base;
            });

            payload.items = items;

            // Check if we have existing items with gst_id OR if gst_type_id exists
            const hasExisting = gstformData.some(item => item.gst_id) || gstMeta.gst_type_id;

            if (hasExisting) {
                // PUT request
                await updateGstRegistrations(referenceId, payload);
            } else {
                // POST request → remove gst_id completely
                payload.items = payload.items.map(i => ({
                    state: i.state,
                    gst_number: i.gst_number
                }));
                await addGstRegistrations(referenceId, payload);
            }

            // Refresh the data after successful save
            const response = await getGstRegistrations(referenceId);
            const data = response?.data;

            if (data) {
                const gstItems = data.gst_registrations.map(item => ({
                    gst_id: item.gst_id || null,
                    state: item.state || "",
                    gstNumber: item.gst_number || "",
                    regDate: item.reg_date || "",
                }));

                setgstFormData(gstItems);

                if (data.gst_registrations.length > 0) {
                    setGstApplicable(
                        data.gst_registrations[0].gst_applicable === 1 ? "true" : "false"
                    );
                }

                setCount(gstItems.length);

                if (data.gst_type) {
                    setGstMeta({
                        gst_type_id: data.gst_type.gst_type_id || null,
                        reg_type: data.gst_type.reg_type || "",
                        gstr_filling_type: data.gst_type.gstr_filling_type || "",
                    });
                }
            }

        } catch (error) {
            console.error("Save GST error:", error);
        }
    };


    // save income tax details
    const saveIncomeTaxDetails = async () => {
        try {
            // Build individual FY payloads
            const buildPayload = (fyPrefix, idField, currencyTypeField, currencyNameField, turnoverField, itrStatusField, ackField) => {

                const index = fyPrefix === "fy1" ? 1 : 2;

                const year = formData[`itrYear${index}`];
                const month = formData[`itrMonth${index}`];
                const day = formData[`itrDay${index}`];

                const formattedDate = (year && month && day)
                    ? `${year}-${month}-${day}`
                    : null;

                return {
                    ...(formData[idField] ? { it_id: formData[idField] } : {}),  // include it_id only for update
                    fin_year: formData[`${fyPrefix}`],
                    currency_type: formData[currencyTypeField],
                    others: formData[currencyNameField] || null,
                    turnover: formData[turnoverField],
                    status_of_itr: formData[itrStatusField] === "true" ? true : false,
                    itr_ack_num: formData[ackField] || null,
                    itr_filed_date: formattedDate,
                };
            };

            // Build FY1 + FY2 payloads
            const fy1Payload = buildPayload(
                "fy1", "it1_id", "currencyType1", "currencyName1",
                "turnover1", "itrStatus1", "ackNo1",
            );

            const fy2Payload = buildPayload(
                "fy2", "it2_id", "currencyType2", "currencyName2",
                "turnover2", "itrStatus2", "ackNo2",
            );

            const requestBody = {
                items: [fy1Payload, fy2Payload]
            };

            // Determine if both need update or create
            const isUpdate = formData.it1_id !== null || formData.it2_id !== null;

            if (isUpdate) {
                // PUT request (update)
                await updateIncomeTaxDetails(referenceId, requestBody);
            } else {
                // POST request (create)
                console.log("Creating Income Tax Details with payload:", requestBody);
                await addIncomeTaxDetails(referenceId, requestBody);
            }

            // Refresh the data after successful save
            const response = await getIncomeTaxDetails(referenceId);
            const data = response?.data;

            if (data && Array.isArray(data)) {
                const incomeTaxItems = {};

                // Parse ITR filed date and extract year, month, day
                const parseItrDate = (dateStr) => {
                    if (!dateStr) return { year: "", month: "", day: "" };

                    const date = new Date(dateStr);
                    if (isNaN(date.getTime())) return { year: "", month: "", day: "" };

                    return {
                        year: date.getFullYear().toString(),
                        month: String(date.getMonth() + 1).padStart(2, "0"),
                        day: String(date.getDate()).padStart(2, "0")
                    };
                };

                data.forEach(item => {
                    if (item.fin_year) {
                        if (item.fin_year === formData.fy1) {
                            const itrDate1 = parseItrDate(item.itr_filed_date);
                            incomeTaxItems.fy1 = {
                                it1_id: item.it_id || null,
                                fin_year: item.fin_year || "",
                                currencyType1: item.currency_type || "",
                                currencyName1: item.currency_type === "Others" ? item.others || "" : "",
                                turnover1: item.turnover || "",
                                itrStatus1: item.status_of_itr == 1 ? "true" : "false",
                                ackNo1: item.itr_ack_num || "",
                                filedDate1: item.itr_filed_date || "",
                                itrYear1: itrDate1.year,
                                itrMonth1: itrDate1.month,
                                itrDay1: itrDate1.day,
                            };
                        } else if (item.fin_year === formData.fy2) {
                            const itrDate2 = parseItrDate(item.itr_filed_date);
                            incomeTaxItems.fy2 = {
                                it2_id: item.it_id || null,
                                fin_year: item.fin_year || "",
                                currencyType2: item.currency_type || "",
                                currencyName2: item.currency_type === "Others" ? item.others || "" : "",
                                turnover2: item.turnover || "",
                                itrStatus2: item.status_of_itr == 1 ? "true" : "false",
                                ackNo2: item.itr_ack_num || "",
                                filedDate2: item.itr_filed_date || "",
                                itrYear2: itrDate2.year,
                                itrMonth2: itrDate2.month,
                                itrDay2: itrDate2.day,
                            };
                        }
                    }
                });

                setFormData((prev) => ({
                    ...prev,
                    ...incomeTaxItems.fy1,
                    ...incomeTaxItems.fy2,
                }));
            }

        } catch (error) {
            console.error("Save Income Tax error:", error);
        }
    };




    const handleGstFieldChange = (index, field, value) => {
        setgstFormData((prevData) => {
            const updated = [...prevData];

            // ensure row exists
            if (!updated[index]) {
                updated[index] = { state: "", gstNumber: "", regDay: "", regMonth: "", regYear: "" };
            }

            let cleaned = value;

            // 🔠 GST Number — uppercase alphanumeric only (no length limit)
            if (field === "gstNumber") {
                cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
            }

            // 📅 Dropdowns (state, regDay, regMonth, regYear) — keep value as-is
            else if (["state", "regDay", "regMonth", "regYear"].includes(field)) {
                cleaned = value;
            }

            // Default — uppercase (for any text field)
            else {
                cleaned = value.toUpperCase();
            }

            // set the field
            updated[index][field] = cleaned;

            // 📆 validate day when month/year changes
            if (field === "regMonth" || field === "regYear") {
                const maxDays = getDaysInMonth(updated[index].regMonth, updated[index].regYear);
                const currDay = Number(updated[index].regDay);
                if (updated[index].regDay && (isNaN(currDay) || currDay > maxDays)) {
                    updated[index].regDay = ""; // reset invalid day
                }
            }

            return updated;
        });
    };
    const handleGoodsServicesChange = (e, section) => {
        const { name, value } = e.target;
        let cleaned = value;

        // 🧾 Allow only letters, numbers, and spaces → uppercase
        if (name === "others") {
            cleaned = value.replace(/[^A-Za-z\s]/g, "").toUpperCase(); // letters + spaces only
        }
        // Dropdowns → keep as selected
        else if (["type_of_counterparty", "type"].includes(name)) {
            cleaned = value;
        }
        // Default → uppercase, block special chars
        else {
            cleaned = value.replace(/[^A-Za-z0-9\s]/g, "").toUpperCase();
        }

        if (section === "goodsServices") {
            setGoodsServices((prev) => ({ ...prev, [name]: cleaned }));

            // ✅ When user selects "Goods and Services", initialize 5 empty rows
            if (name === "type" && cleaned === "Goods and Services") {
                if (goodsAndServices.length === 0) {
                    setGoodsAndServices(
                        Array.from({ length: 5 }, () => ({ goods: "", services: "" }))
                    );

                }
            }

            // ✅ When user switches away from "Goods and Services", clear the list
            if (name === "type" && cleaned !== "Goods and Services") {
                setGoodsAndServices([]);
            }
        }
    };

    const handleSaveGstForm = async () => {

        let errors = [];

    // ----------------------------------------------------
    // 1️⃣ VALIDATE TYPE OF COUNTERPARTY
    // ----------------------------------------------------
    if (!goodsServices.type_of_counterparty) {
        errors.push("Please select Type of Counterparty.");
    }

    if (goodsServices.type_of_counterparty === "Others") {
        if (!goodsServices.others || goodsServices.others.trim() === "") {
            errors.push("Please specify the 'Other' Counterparty Type.");
        }
    }

    // ----------------------------------------------------
    // 2️⃣ VALIDATE DETAILS OF SUPPLIES
    // ----------------------------------------------------
    if (!goodsServices.type) {
        errors.push("Please select Details of Supplies Type (Goods / Services / Goods & Services).");
    } else {
        // GOODS
        if (goodsServices.type === "Goods") {
            const hasGoods = goods.some((g) => g.trim() !== "");
            if (!hasGoods) errors.push("Please enter at least one Goods item.");
        }

        // SERVICES
        if (goodsServices.type === "Services") {
            const hasServices = services.some((s) => s.trim() !== "");
            if (!hasServices) errors.push("Please enter at least one Service item.");
        }

        // GOODS & SERVICES
        if (goodsServices.type === "Goods and Services") {
            const hasGS = goodsAndServices.some(
                (row) => row.goods.trim() !== "" || row.services.trim() !== ""
            );
            if (!hasGS) errors.push("Please enter at least one Goods or Service item.");
        }
    }

    // ----------------------------------------------------
    // 3️⃣ VALIDATE GST APPLICABLE
    // ----------------------------------------------------
    if (!gstApplicable) {
        errors.push("Please select whether GST is applicable.");
    }

    // GST = NO → Finish validation here & go next step
    if (gstApplicable === "false") {
        nextPage();
        return;
    }

    // ----------------------------------------------------
    // 4️⃣ GST = YES → Validate all GST registration fields
    // ----------------------------------------------------

    // Number of GST Registrations
    if (!count || count < 1) {
        errors.push("Please select number of GST registrations.");
    }

    // GST registration list
    gstformData.forEach((item, index) => {
        if (!item.gstNumber || item.gstNumber.trim() === "") {
            errors.push(`GST Number is required for Registration ${index + 1}.`);
        }
        // country & state NOT validated
    });

    // Registration Type
    if (!gstMeta.reg_type) {
        errors.push("Registration Type is required.");
    }

    // GSTR Filing Type
    if (!gstMeta.gstr_filling_type) {
        errors.push("GSTR Filing Type is required.");
    }

    ["1", "2"].forEach((i) => {
    // Currency Type
    if (!formData[`currencyType${i}`]) {
        errors.push(`Currency Type for FY-${i} is required.`);
    }

    // Currency Name (only if Others selected)
    if (formData[`currencyType${i}`] === "Others" && !formData[`currencyName${i}`]) {
        errors.push(`Currency Name is required for FY-${i}.`);
    }

    // Turnover
    if (!formData[`turnover${i}`] || formData[`turnover${i}`] <= 0) {
        errors.push(`Turnover amount for FY-${i} is required.`);
    }

    // ITR Status
    if (!formData[`itrStatus${i}`]) {
        errors.push(`ITR Status for FY-${i} is required.`);
    }

    // If ITR = Yes → Acknowledgment + Date Required
    if (formData[`itrStatus${i}`] === "true") {
        if (!formData[`ackNo${i}`]) {
            errors.push(`Acknowledgment No. for FY-${i} is required.`);
        }

        if (!formData[`itrYear${i}`] || !formData[`itrMonth${i}`] || !formData[`itrDay${i}`]) {
            errors.push(`ITR Filed Date (DD/MM/YYYY) is required for FY-${i}.`);
        }
    }
});

    // ----------------------------------------------------
    // 5️⃣ SHOW ERRORS IF ANY
    // ----------------------------------------------------
    if (errors.length > 0) {
        alert("Please correct the following:\n\n" + errors.join("\n"));
        return;
    }


        await saveGoodsAndServices();
        await saveGstRegistrations();
        await saveIncomeTaxDetails();
        toast.success("Gst Details saved successfully!");


        nextPage();
    };

    // use inside component, above return
    const getDaysInMonth = (month, year) => {
        // month can be "01", "1", 1, etc. Year may be "" or undefined.
        const m = Number(month); // NaN -> 0
        const y = Number(year) || new Date().getFullYear(); // fallback to current year if not provided

        if (!m || m < 1 || m > 12) return 31; // default (keeps UX predictable until month selected)
        // new Date(year, month, 0).getDate() returns #days for month (month = 1..12)
        return new Date(y, m, 0).getDate();
    };

    // STEP 4: Banking Information
    const [bankInfo, setBankInfo] = useState({
        account_holder_name: "",
        bank_name: "",
        bank_address: "",
        transaction_type: "",
        country_type: "",
        country_id: null,
        country_text: "",
        account_number: "",
        ifsc_code: "",
        swift_code: "",
        beneficiary_name: "",
    });

    useEffect(() => {
        const fetchBankDetails = async () => {
            try {
                const response = await getBankDetails(referenceId);

                if (response?.data?.bank) {
                    setBankInfo((prev) => ({
                        ...prev,
                        ...response.data.bank,
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch bank details:", err);
            }
        };

        fetchBankDetails();
    }, [referenceId]);

    const handleBankDetailsChange = (e) => {
        const { name, value } = e.target;
        let cleaned = value;

        // Account Holder / Beneficiary / Bank / Branch — only letters + spaces, uppercase
        if (["account_holder_name", "beneficiary_name", "bank_name", "branch_name", "bankCountryName"].includes(name)) {
            cleaned = value.replace(/[^A-Za-z\s]/g, "").toUpperCase();
        }

        // Account Number — digits only
        else if (name === "account_number") {
            cleaned = value.replace(/[^0-9]/g, "");
        }

        // IFSC / SWIFT Codes — uppercase alphanumeric (no limit)
        else if (["ifscCode", "swiftCode"].includes(name)) {
            cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
        }

        // Bank Address — keep as typed (case-sensitive)
        else if (name === "bank_address") {
            cleaned = value;
        }

        // Country — only letters and spaces (uppercase)
        else if (name === "country") {
            cleaned = value.replace(/[^A-Za-z\s]/g, "").toUpperCase();
        }


        // 🧠 Default fallback — uppercase text
        else {
            cleaned = value.toUpperCase();
        }

        setBankInfo((prev) => ({
            ...prev,
            [name]: cleaned,
        }));
    };


    // add if new else update bank details
    const handleSaveBankDetails = async () => {
        const bankPayload = {
            account_holder_name: bankInfo.account_holder_name,
            bank_name: bankInfo.bank_name,
            bank_address: bankInfo.bank_address,
            transaction_type: bankInfo.transaction_type,
            country_type: bankInfo.country_type,
            country_id: bankInfo.country_id,
            country_text: bankInfo.country_text,
            account_number: bankInfo.account_number,
            ifsc_code: bankInfo.ifsc_code,
            swift_code: bankInfo.swift_code,
            beneficiary_name: bankInfo.beneficiary_name,
        };

          let errors = [];

    // ---------------------------------------------
    // 🔹 BASIC REQUIRED FIELDS
    // ---------------------------------------------
    if (!bankInfo.account_holder_name)
        errors.push("Account Holder Name is required.");

    if (!bankInfo.bank_name)
        errors.push("Bank Name is required.");

    if (!bankInfo.bank_address)
        errors.push("Bank Address is required.");

    if (!bankInfo.transaction_type)
        errors.push("Transaction Type is required.");

    // ---------------------------------------------
    // 🔹 VALIDATE IFSC / SWIFT BASED ON TRANSACTION TYPE
    // ---------------------------------------------
    if (
        bankInfo.transaction_type === "Domestic" ||
        bankInfo.transaction_type === "Domestic and International"
    ) {
        if (!bankInfo.ifsc_code)
            errors.push("IFSC Code is required for Domestic transactions.");

        // IFSC Format (optional but recommended)
        if (
            bankInfo.ifsc_code &&
            !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(bankInfo.ifsc_code)
        ) {
            errors.push("Invalid IFSC Code format.");
        }
    }

    if (
        bankInfo.transaction_type === "International" ||
        bankInfo.transaction_type === "Domestic and International"
    ) {
        if (!bankInfo.swift_code)
            errors.push("SWIFT Code is required for International transactions.");

        // SWIFT Format (optional)
        if (
            bankInfo.swift_code &&
            !/^[A-Z0-9]{8}(?:[A-Z0-9]{3})?$/i.test(bankInfo.swift_code)
        ) {
            errors.push("Invalid SWIFT Code format.");
        }
    }

    // ---------------------------------------------
    // 🔹 COUNTRY VALIDATION (ONLY check selection)
    // ---------------------------------------------
    if (!bankInfo.country_type)
        errors.push("Please select Bank Country.");

    // ---------------------------------------------
    // 🔹 IF COUNTRY = Others → Require country_text & state_text
    // ---------------------------------------------
    if (bankInfo.country_type === "Others") {
        if (!bankInfo.country_text)
            errors.push("Specify Country is required.");

        if (!bankInfo.state_text)
            errors.push("Specify State/Province is required.");
    }

    // ---------------------------------------------
    // 🔹 IF COUNTRY = India → Require state dropdown
    // ---------------------------------------------
    if (bankInfo.country_type === "India") {
        if (!bankInfo.state_id)
            errors.push("Bank State is required for India.");
    }

    // ---------------------------------------------
    // 🔹 SHOW ERRORS (if any)
    // ---------------------------------------------
    if (errors.length > 0) {
        alert("Please correct the following:\n\n" + errors.join("\n"));
        return;
    }

    // ---------------------------------------------
    // SUCCESS → Go to next page
    // ---------------------------------------------
    nextPage();

        try {



            const existingResponse = await getBankDetails(referenceId);
            if (existingResponse && existingResponse.status === 200 && existingResponse.data && Object.keys(existingResponse.data).length > 0) {
                // Update existing
                await updateBankDetails(referenceId, bankPayload);
                toast.success("Bank details updated successfully!");
                nextPage();
            }
        } catch (err) {
            // Add new
            try {
                await addBankDetails(referenceId, bankPayload);
                toast.success("Bank details added successfully!");
                nextPage();
            } catch (error) {
                console.error("Error adding bank details:", error);
                toast.error("Error occurred while saving bank details.");

            }
        }
    };


    useEffect(() => {
        if (bankInfo.country_id && countries.length > 0) {
            const selectedCountry = countries.find((c) => c.id == bankInfo.country_id);

            const isOther = selectedCountry && selectedCountry.country.toLowerCase() !== "india";
            setIsOtherBankCountry(isOther);

            if (isOther) {
                setBankInfo((prev) => ({
                    ...prev,
                    country_text: prev.country_text || selectedCountry.country.toUpperCase(),
                }));
            } else {
                setBankInfo((prev) => ({
                    ...prev,
                    country_text: "",
                }));
            }
        }
    }, [bankInfo.country_id, countries]);


    useEffect(() => {
        if (bankInfo.country_type === "Others") {
            setIsOtherBankCountry(true);

            if (!bankInfo.country_text) {
                setBankInfo(prev => ({
                    ...prev,
                    country_text: "",
                }));
            }
        } else if (bankInfo.country_type === "India") {
            setIsOtherBankCountry(false);
            setBankInfo(prev => ({
                ...prev,
                country_text: "",
            }));
        }
    }, [bankInfo.country_type]);



    const handleTransactionChange = (e) => {
        const value = e.target.value;
        setTransactionType(value);

        // Reset codes when switching
        if (value === "Domestic") {
            setSwiftCode("");
        } else if (value === "International") {
            setIfscCode("");
        }
    };



    // Step 5: Documents
    const [documents, setDocuments] = useState({

        pan: {},
        msme: {},
        gst: {},
        cheque: {},
        tds: {},
        tds_declaration: "",
        gst_available: "", // ✅ add this
    });

    const [documentStatus, setDocumentStatus] = useState({
        gstin: "",
        msme: "",
        tds: "",
    });

    const handleDocumentStatusChange = (e) => {
        const { name, value } = e.target;

        setDocumentStatus((prev) => ({
            ...prev,
            [name]: value,
        }));

        // Clear file if "No" selected
        if (value === "No") {
            const field = name; // gstin / msme / tds
            setDocuments((prev) => ({
                ...prev,
                [field]: null,
            }));
        }
    };

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await getDocumentDetails(referenceId);
                if (response?.data) {
                    const docs = {};
                    response.data.forEach(doc => {
                        docs[doc?.doc_type] = {
                            docId: doc?.doc_id,  // keep the document ID for updates
                            file: null,          // user hasn't selected new file yet
                            url: doc?.file_path  // stored file path
                        };
                    });
                    setDocuments(prev => ({
                        ...prev,
                        ...docs
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch documents", err);
            }
        };
        fetchDocuments();
    }, [referenceId]);


    const handleSaveDocuments = async () => {
        let errors = [];

    // ---------------------------------------------
    // 🔹 1. PAN — ALWAYS REQUIRED
    // ---------------------------------------------
    if (!documents.pan) {
        errors.push("PAN document is required.");
    }

    // ---------------------------------------------
    // 🔹 2. GST — Conditional
    // ---------------------------------------------
    if (!documents.gst_available) {
        errors.push("Please select GSTIN Available (Yes/No).");
    }

    if (documents.gst_available === "true") {
        if (!documents.gst) {
            errors.push("GSTIN Certificate is required.");
        }
    }

    // ---------------------------------------------
    // 🔹 3. MSME — Conditional
    // ---------------------------------------------
    if (!msmeInfo.registered_under_msme) {
        errors.push("Please select whether MSME Registration is available.");
    }

    if (msmeInfo.registered_under_msme === "true") {
        if (!documents.msme) {
            errors.push("MSME Certificate is required.");
        }
    }

    // ---------------------------------------------
    // 🔹 4. Cancelled Cheque — Optional
    // (No validation required)
    // ---------------------------------------------

    // ---------------------------------------------
    // 🔹 5. TAN Certificate / Exemption — REQUIRED
    // ---------------------------------------------
    if (!tanStatus) {
        errors.push("Please select TAN status (Yes/No).");
    }

    if (tanStatus === "yes" && !documents.tanCertificate) {
        errors.push("TAN Certificate is required.");
    }

    if (tanStatus === "no" && !documents.tanExemption) {
        errors.push("TAN Exemption Certificate is required.");
    }

    // ---------------------------------------------
    // 🔹 6. Registration Certificate — ALWAYS REQUIRED
    // ---------------------------------------------
    if (!documents.incorporation) {
        errors.push("Registration Certificate is required.");
    }

    // ---------------------------------------------
    // 🔹 7. TDS Declaration — Conditional
    // ---------------------------------------------
    if (!documents.tds_declaration) {
        errors.push("Please select TDS Declaration (Yes/No).");
    }

    if (documents.tds_declaration === "true" && !documents.tds) {
        errors.push("TDS Declaration document is required.");
    }

    // ---------------------------------------------
    // 🔹 8. File Type + File Size Validation (5 MB)
    // ---------------------------------------------
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const allFiles = [
        documents.pan,
        documents.gst,
        documents.msme,
        documents.cheque,
        documents.tanCertificate,
        documents.tanExemption,
        documents.incorporation,
        documents.tds
    ];

    allFiles.forEach((fileObj) => {
        if (fileObj?.file) {
            const file = fileObj.file;

            if (!allowedTypes.includes(file.type)) {
                errors.push(`Invalid file format: ${file.name}. Allowed formats are JPG, JPEG, PNG, PDF.`);
            }

            if (file.size > maxSize) {
                errors.push(`File too large: ${file.name}. Maximum allowed size is 5 MB.`);
            }
        }
    });

    // ---------------------------------------------
    // ❗ Show Errors
    // ---------------------------------------------
    if (errors.length > 0) {
        alert("Please correct the following:\n\n" + errors.join("\n"));
        return;
    }

    // ---------------------------------------------
    // SUCCESS → GO TO NEXT STEP
    // ---------------------------------------------
    nextPage();
        try {
            const formData = new FormData();
            let hasAnyOperation = false;

            // Process all document types in the documents state
            Object.entries(documents).forEach(([docType, docData]) => {
                if (!docData) return;

                const { file, docId } = docData;

                if (file && docId) {
                    // CASE 1: Update existing document (has both file and docId)
                    formData.append("doc_ids[]", docId);
                    formData.append("doc_types[]", docType);
                    formData.append("files[]", file);
                    hasAnyOperation = true;
                } else if (file && !docId) {
                    // CASE 2: Add new document (has file but no docId)
                    formData.append("doc_types[]", docType);
                    formData.append("files[]", file);
                    hasAnyOperation = true;
                } else if (!file && docId) {
                    // CASE 3: Delete existing document (has docId but no file)
                    formData.append("doc_ids[]", docId);
                    hasAnyOperation = true;
                }
                // CASE 4: No operation (no file, no docId) - skip
            });

            // Check if there are any operations to perform
            if (!hasAnyOperation) {
                toast.error("No document changes to save. Please continue.");
                nextPage();
                return;
            }

            console.log("Request FormData entries:");
            for (let pair of formData.entries()) {
                console.log(pair);
            }

            // Always use the same endpoint (addDocuments) as per updated API
            const response = await addDocuments(referenceId, formData);

            if (response?.data?.message?.includes("success") || response.status === 200) {
                toast.success("Documents saved successfully!");

                // 🔄 re-fetch updated documents with correct referenceId
                const refreshed = await getDocumentDetails(referenceId);
                if (refreshed?.data) {
                    const updatedDocuments = {};
                    refreshed.data.forEach(doc => {
                        updatedDocuments[doc?.doc_type] = {
                            file: null,
                            url: doc?.file_path,
                            docId: doc?.doc_id // Store the document ID for future updates
                        };
                    });
                    setDocuments(prev => ({
                        ...prev,
                        ...updatedDocuments
                    }));
                }

                nextPage();
            } else {
                throw new Error(response?.data?.error || "Unknown error");
            }
        } catch (err) {
            console.error(err.response || err);
            toast.error("Failed to upload documents. Please try again.");
        }
    };


    // Step 6: Declarations

    const [declarationInfo, setDeclarationInfo] = useState({
        declaration_id: null,
        name: '',
        organization: '',
        designation: '',
        confidentiality_name: '',
        confidentiality_org: '',
        confidentiality_designation: '',
        title: '',
        date: '',
        place: '',
        signedFile: null,
    });

    const isEditing = !!declarationInfo.declaration_id; // or however you check for edit mode


    useEffect(() => {
        if (!referenceId) return;
        const fetchDeclarations = async () => {
            try {
                const response = await getDeclarations(referenceId);
                console.log("Fetched declarations:", response);

                if (response?.data) {
                    const declaration = response?.data;
                    console.log("declaration:", declaration);

                    const mainMatch = declaration?.declaration_text?.match(
                        /I\/We\s+(.*?)\s+of\s+(.*?)\s+designated\s+as\s+(.*?)\s/i
                    );

                    const confMatch = declaration.confidentiality_ack?.match(
                        /I\/We\s+(.*?)\s+of\s+(.*?)\s+designated/i
                    );

                    setDeclarationInfo({
                        declaration_id: declaration.declaration_id || null,
                        name: mainMatch?.[1]?.trim() || '',
                        organization: mainMatch?.[2]?.trim() || '',
                        designation: mainMatch?.[3]?.trim() || '',
                        confidentiality_name: confMatch?.[1]?.trim() || '',
                        confidentiality_org: confMatch?.[2]?.trim() || '',
                        confidentiality_designation: declaration.designation || '',
                        title: declaration.designation || '',
                        date: declaration.signed_date || '',
                        place: declaration.place || '',
                        signedFile: declaration.authorized_signatory || null,
                    });
                }
            } catch (err) {
                console.error("Failed to fetch documents", err);
            }
        };

        fetchDeclarations();
    }, [referenceId]);




    const handleSaveDeclaration = async () => {

        let errors = [];

    // ========== Vendor Declaration Inputs ==========
    if (!vendorDeclarationInfo.name?.trim()) {
        errors.push("Vendor Name is required in Declaration paragraph.");
    }

    if (!vendorDeclarationInfo.organization?.trim()) {
        errors.push("Vendor Organization is required in Declaration paragraph.");
    }

    if (!vendorDeclarationInfo.designation?.trim()) {
        errors.push("Vendor Designation is required in Declaration paragraph.");
    }

    // ========== Vendor Declaration Checkbox ==========
    if (!isDeclarationChecked) {
        errors.push("You must agree to the Declaration.");
    }

    // ========== Country Party Inputs ==========
    if (!countryPartyInfo.name?.trim()) {
        errors.push("Country Party Name is required in Declaration paragraph.");
    }

    if (!countryPartyInfo.country?.trim()) {
        errors.push("Country Party Country is required in Declaration paragraph.");
    }

    if (!countryPartyInfo.designation?.trim()) {
        errors.push("Country Party Designation is required in Declaration paragraph.");
    }

    // ========== Country Party Checkbox ==========
    if (!isCountryPartyChecked) {
        errors.push("You must agree with Country Party Declaration.");
    }

    // ========== Extra Fields (If both checkboxes are checked) ==========
    if (isDeclarationChecked && isCountryPartyChecked) {
        if (!declarationDetails.place?.trim()) {
            errors.push("Place is required.");
        }

        // Signature file required
        if (!declarationDetails.sign?.file) {
            errors.push("Signature file is required.");
        } else {
            const file = declarationDetails.sign.file;

            // Validate file type
            const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
            if (!allowedTypes.includes(file.type)) {
                errors.push("Signature must be JPG, JPEG, or PNG.");
            }

            // Validate file size (1 MB)
            if (file.size > 1024 * 1024) {
                errors.push("Signature file size must be less than 1 MB.");
            }
        }
    }

    // ========== Display Errors ==========
    if (errors.length > 0) {
        alert("Please fix the following:\n\n" + errors.join("\n"));
        return;
    }

    // ========== Everything is Valid ==========
    nextPage();

        try {
            const formData = new FormData();

            formData.append(
                'declaration_text',
                `I/We ${declarationInfo.name} of ${declarationInfo.organization} designated as ${declarationInfo.designation} declare the information provided...`
            );

            formData.append(
                'confidentiality_ack',
                `I/We ${declarationInfo.confidentiality_name} of ${declarationInfo.confidentiality_org} designated as ${declarationInfo.confidentiality_designation} acknowledge the confidentiality...`
            );

            formData.append('designation', declarationInfo.title);
            formData.append('place', declarationInfo.place);
            formData.append('signed_date', declarationInfo.date);
            formData.append('signed_file', declarationInfo.signedFile.file);

            console.log('signedFile:', declarationInfo.signedFile);
            console.log('signedFile type:', typeof declarationInfo.signedFile.file);
            console.log('FormData preview:');

            console.log("signedFile:", declarationInfo.signedFile);
            console.log("signedFile instanceof File:", declarationInfo.signedFile instanceof File);

            for (let pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }

            await addDeclarations(referenceId, formData); // replace 4 with actual vendor_id
            await handleSubmitRfq(); // submit RFQ after declaration
            toast.success("Rfq Submitted successfully!");
            navigate('/status'); // move to next step
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Failed to submit declaration");
        }
    }



    // submit all steps
    const handleSubmitRfq = async () => {
        try {
            const response = await submitRfq(referenceId);
            console.log("RFQ submission response:", response);
            if (response.status === 200) {
                return true;
            } else {
                return false;
            }
        } catch (err) {
            console.error("Error submitting RFQ:", err);
            return false;
        };
    };

    const [commentHistory, setCommentHistory] = useState({
        "Business Entity Details": [],
        "MSME Details": [],
        "GST Information": [],
        "Bank Details": [],
        "Documents and Attachments": [],
        "Declaration and Acknowledgement": [],
    });

    useEffect(() => {
        const fetchPreviousComments = async () => {
            try {
                const response = await getPreviousComments(referenceId);
                const data = response?.data;
                if (!data) return;
                const groupedComments = data.reduce((acc, comment) => {
                    if (!acc[comment.step]) {
                        acc[comment.step] = [];
                    }
                    acc[comment.step].push({
                        comment: comment.comment,
                        commented_on: comment.commented_on,
                        commenter_name: comment.commenter,
                    });
                    return acc;
                }, {});

                setCommentHistory((prev) => ({
                    ...prev,
                    ...groupedComments
                }));


            } catch (error) {
                console.error("Error fetching previous comments:", error);
            }
        };

        if (referenceId) {
            fetchPreviousComments();
        }
    }, [referenceId]);


    const [openConfirmModal, setOpenConfirmModal] = useState(false);

    const handleOpenModal = () => setOpenConfirmModal(true);
    const handleCloseModal = () => setOpenConfirmModal(false);

    const handleFinalSubmit = () => {
        setOpenConfirmModal(false);
        handleSaveDeclaration(); // or your final step submit function
    };


    // ✅ File validation for all uploads
    const validateFile = (file) => {
        const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "application/pdf"];
        const maxSize = 5 * 1024 * 1024; // 5 MB

        if (!file) return false;

        if (!allowedTypes.includes(file.type)) {
            alert("❌ Only PNG, JPEG, JPG, and PDF files are allowed.");
            return false;
        }

        if (file.size > maxSize) {
            alert("❌ File size must be less than 5 MB.");
            return false;
        }

        return true;
    };

    // ✅ Auto-fill today's date in Declaration
    const [declarationDate, setDeclarationDate] = useState(() => {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`; // Format: YYYY-MM-DD
    });

    // ✅ Validate signature upload (PNG/JPG/JPEG only, max 1 MB)
    const validateSignatureFile = (file) => {
        const allowedTypes = ["image/png", "image/jpeg", "image/jpg"];
        const maxSize = 1 * 1024 * 1024; // 1 MB in bytes

        if (!file) return false;

        if (!allowedTypes.includes(file.type)) {
            alert("❌ Only PNG, JPG, and JPEG files are allowed for signature.");
            return false;
        }

        if (file.size > maxSize) {
            alert("❌ Signature file size must be less than 1 MB.");
            return false;
        }

        return true;
    };

    useEffect(() => {
        const fetchRfqStatus = async () => {
            try {
                const response = await getRfqStatus(referenceId);
                const currentStatus = Number(response?.data?.status) || null;
                setRfqStatus(currentStatus);
            } catch (error) {
                console.error("Failed to fetch RFQ status:", error);
            }
        };

        if (referenceId) fetchRfqStatus();
    }, [referenceId]);


    const renderValue = (label, value) => (
        <p style={{ marginBottom: "6px", fontSize: "15px", color: "#333" }}>
            <b style={{ color: "#000" }}>{label}:</b> {value || "—"}
        </p>
    );

    useEffect(() => {
        if (currentPage === 5) { // assuming step 6 is index 5 (0-based)
            setDeclarationInfo(prev => ({
                ...prev,
                name: companyInfo.contact_person_name || prev.name,
                organization: companyInfo.trading_name || companyInfo.full_registered_name || prev.organization,
                designation: companyInfo.designation || prev.designation,
            }));
        }
    }, [currentPage, companyInfo]);

    const [agreeDeclaration, setAgreeDeclaration] = useState(false);
    const [agreeCounterparty, setAgreeCounterparty] = useState(false);

    const [declarationDetails, setDeclarationDetails] = useState({
        name: "",
        organization: "",
        designation: "",
        place: "",
        date: "",
        sign: null,
    });

    const [counterpartyDetails, setCounterpartyDetails] = useState({
        name: "",
        organization: "",
        designation: "",
    });

    const handleCheckbox = (type, checked) => {
        if (type === "declaration") setAgreeDeclaration(checked);
        if (type === "counterparty") setAgreeCounterparty(checked);
    };

    const handleSignatureUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setDeclarationDetails((prev) => ({
            ...prev,
            sign: { file, url: URL.createObjectURL(file) },
        }));
    };

    useEffect(() => {
        if (!declarationDetails.date) {
            const today = new Date().toISOString().slice(0, 10);
            setDeclarationDetails((prev) => ({ ...prev, date: today }));
        }
    }, [declarationDetails.date]);

    useEffect(() => {
        const today = new Date().toISOString().slice(0, 10);
        setDeclarationDetails((prev) => ({ ...prev, date: today }));
    }, []); // runs once on mount


    // checkbox state
    const [isDeclarationChecked, setIsDeclarationChecked] = useState(false);

    // declaration info
    const [vendorDeclarationInfo, setVendorDeclarationInfo] = useState({
        name: "",
        organization: "",
        designation: "",
    });

    // checkbox state for country party
    const [isCountryPartyChecked, setIsCountryPartyChecked] = useState(false);

    // country party details
    const [countryPartyInfo, setCountryPartyInfo] = useState({
        name: "",
        country: "",
        designation: "",
    });

    return (
        <Box m="50px">
            <Header
                title="Customer / Vendor Registration"
                subtitle="Vendor Management System"
            />
            {/* Stepper */}

            <div className={styles.container}>
                <div className={styles.vmsWrapper}>
                    {/* ✅ Instructions Popup */}



                    <div className={styles.verticalTabs}>
                        {stepLabels.map((label, index) => (
                            <div
                                key={index}
                                className={`${styles.tab} 
        ${index === 0 ? styles.instructionsTab : ""} 
        ${currentPage === index && index !== 0 ? styles.activeTab : ""} 
        ${currentPage > index && index !== 0 ? styles.completedTab : ""}`}
                                onClick={() => {
                                    const accepted = localStorage.getItem("instructionsAccepted");
                                    // ✅ Prevent navigation if user hasn't accepted instructions
                                    if (!accepted && index !== 0) {
                                        alert("⚠️ Please read and accept the Instructions first!");
                                        return;
                                    }
                                    setCurrentPage(index);
                                }}
                            >
                                <div className={styles.tabIcon}>
                                    {index === 0 ? <FiBookOpen size={16} /> : index}
                                </div>
                                <div className={styles.tabLabel}>{label}</div>
                            </div>
                        ))}
                    </div>


                    {/* Form content */}
                    <div className={styles.formOuter}>

                        <form>

                            <>

                                {currentPage === 0 && (
                                    <InstructionsStep
                                        firstTime={firstTime}
                                        onProceed={() => {
                                            localStorage.setItem("instructionsAccepted", "true");
                                            setCurrentPage(1); // move to Business Entity step
                                            setFirstTime(false);
                                        }}
                                    />
                                )}

                                {/* Step 1: Company Info */}
                                {currentPage === 1 && (

                                    <div className={styles.page}>
                                        <h3>Business Entity Details </h3>
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Full Registered Name (as per PAN)
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="full_registered_name"
                                                value={companyInfo.full_registered_name}
                                                className={`${styles.fieldInput} ${styles.uppercaseInput}`}
                                                maxLength={255}
                                                onChange={(e) => {
                                                    let input = e.target.value;

                                                    // allow letters, numbers, spaces, and common company name characters
                                                    // Allows: A-Z, a-z, 0-9, spaces, periods, hyphens, ampersands, parentheses, apostrophes
                                                    if (/^[A-Za-z0-9\s.\-&()']*$/.test(input)) {
                                                        setCompanyInfo({
                                                            ...companyInfo,
                                                            full_registered_name: input.toUpperCase(),
                                                        });
                                                    }
                                                }}
                                                onBlur={(e) => {
                                                    // ✅ when user leaves the field, clean it up finally
                                                    setCompanyInfo((prev) => ({
                                                        ...prev,
                                                        full_registered_name: prev.full_registered_name
                                                            ?.replace(/\s+/g, " ") // collapse multiple spaces
                                                            .trim()                // remove start/end spaces
                                                            .toUpperCase(),        // ensure uppercase
                                                    }));
                                                }}
                                                required
                                                readOnly={isReadOnly}
                                            />
                                        </div>


                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Nature of Business Entity <span className={styles.requiredSymbol}>*</span>
                                            </label>

                                            <select
                                                name="business_entity_type"
                                                value={companyInfo.business_entity_type}
                                                onChange={(e) => {
                                                    handleCompanyInfoChange(e);  // keep your existing handling

                                                    const selected = e.target.value;

                                                    // Force India for these types:
                                                    const forceIndia =
                                                        selected === "Sole Proprietorship" ||
                                                        selected === "Partnership";

                                                    if (forceIndia) {
                                                        const india = countries.find(
                                                            c => c.country.toLowerCase() === "india"
                                                        );

                                                        setCompanyInfo(prev => ({
                                                            ...prev,
                                                            country_type: "India",
                                                            isOtherCountry: false,
                                                            country_id: india?.id || null,

                                                            // reset these fields
                                                            country_text: "",
                                                            state_text: "",
                                                            state_id: "",
                                                        }));

                                                    } else {
                                                        // Reset country fields when switching to other entity types
                                                        setCompanyInfo(prev => ({
                                                            ...prev,
                                                            country_type: "",
                                                            isOtherCountry: false,
                                                            country_id: null,
                                                            state_id: "",
                                                            country_text: "",
                                                            state_text: "",
                                                        }));
                                                    }
                                                }}
                                                className={styles.fieldInput}
                                                required
                                                disabled={isReadOnly}
                                            >
                                                <option value="">-- Select Business Entity Type --</option>
                                                <option value="Sole Proprietorship">Sole Proprietorship</option>
                                                <option value="Partnership">Partnership</option>
                                                <option value="Limited Liability Partnership">Limited Liability Partnership</option>
                                                <option value="Private Limited Companies">Private Limited Companies</option>
                                                <option value="Public Limited Companies">Public Limited Companies</option>
                                                <option value="One-Person Companies">One-Person Companies</option>
                                                <option value="Section 8 Company">Section 8 Company</option>
                                                <option value="Joint-Venture Company">Joint-Venture Company</option>
                                                <option value="Non-Government Organization(NGO)">
                                                    Non-Government Organization (NGO)
                                                </option>
                                            </select>
                                        </div>


                                        {/* 🟢 Sole Proprietorship → Registration Number */}
                                        {companyInfo.business_entity_type === "Sole Proprietorship" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    Registration Number
                                                    <span className={styles.requiredSymbol}>*</span>

                                                </label>
                                                <input
                                                    type="text"
                                                    name="reg_number"
                                                    value={companyInfo.reg_number || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    required
                                                    readOnly={isReadOnly}
                                                />
                                            </div>
                                        )}

                                        {/* 🟢 Partnership → Firm Registration Number */}
                                        {companyInfo.business_entity_type === "Partnership" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    Registration Number
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="reg_number"
                                                    value={companyInfo.reg_number || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    required
                                                    readOnly={isReadOnly}
                                                />
                                            </div>
                                        )}

                                        {/* 🟢 Limited Liability Partnership → LLP Registration Number */}
                                        {companyInfo.business_entity_type === "Limited Liability Partnership" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    Registration Number
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="reg_number"
                                                    value={companyInfo.reg_number || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    required
                                                    readOnly={isReadOnly}
                                                />
                                            </div>
                                        )}

                                        {/* 🟢 Limited Liability Partnership → LLP Registration Number */}
                                        {companyInfo.business_entity_type === "Private Limited Companies" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    Registration Number
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="reg_number"
                                                    value={companyInfo.reg_number || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    required
                                                    readOnly={isReadOnly}
                                                />
                                            </div>
                                        )}

                                        {/* 🟢 Limited Liability Partnership → LLP Registration Number */}
                                        {companyInfo.business_entity_type === "Public Limited Companies" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    Registration Number
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="reg_number"
                                                    value={companyInfo.reg_number || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    required
                                                    readOnly={isReadOnly}
                                                />
                                            </div>
                                        )}

                                        {/* 🟢 Limited Liability Partnership → LLP Registration Number */}
                                        {companyInfo.business_entity_type === "One-Person Companies" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    Registration Number
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="reg_number"
                                                    value={companyInfo.reg_number || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    required
                                                    readOnly={isReadOnly}
                                                />
                                            </div>
                                        )}

                                        {/* 🟢 Limited Liability Partnership → LLP Registration Number */}
                                        {companyInfo.business_entity_type === "Section 8 Company" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    Registration Number
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="reg_number"
                                                    value={companyInfo.reg_number || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    required
                                                    readOnly={isReadOnly}
                                                />
                                            </div>
                                        )}


                                        {/* 🟢 Limited Liability Partnership → LLP Registration Number */}
                                        {companyInfo.business_entity_type === "Joint-Venture Company" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    Registration Number
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="reg_number"
                                                    value={companyInfo.reg_number || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    required
                                                    readOnly={isReadOnly}
                                                />
                                            </div>
                                        )}


                                        {/* 🟢 Sole Proprietorship → Registration Number */}
                                        {companyInfo.business_entity_type === "Non-Government Organization(NGO)" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    Registration Number
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="reg_number"
                                                    value={companyInfo.reg_number || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    required
                                                    readOnly={isReadOnly}
                                                />
                                            </div>
                                        )}

                                        <div className={styles.fieldRow}>


                                            <label className={styles.fieldLabel}>
                                                Do you have a TAN Number? <span className={styles.requiredSymbol}>*</span>
                                            </label>

                                            <select
                                                name="tanStatus"
                                                value={tanStatus}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    setTanStatus(value);

                                                    // Clear TAN number whenever user selects: no OR blank option
                                                    if (value === "no" || value === "") {
                                                        setCompanyInfo(prev => ({
                                                            ...prev,
                                                            tan_number: ""
                                                        }));
                                                    }
                                                }}
                                                className={styles.fieldInput}
                                                required
                                                disabled={isReadOnly}
                                            >
                                                <option value="">-- Select --</option>
                                                <option value="yes">Yes</option>
                                                <option value="no">No</option>
                                            </select>
                                        </div>

                                        {/* ✅ If YES → TAN Number input */}
                                        {tanStatus === "yes" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    TAN Number
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="tan_number"
                                                    value={companyInfo.tan_number || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    placeholder="Enter TAN Number"
                                                    required
                                                    readOnly={isReadOnly}
                                                />


                                            </div>
                                        )}

                                        {tanStatus === "no" && (
                                            <div className={styles.fieldRow}>
                                                <p style={{ color: "red", fontWeight: "500", margin: 0, paddingLeft: "300px", }}>
                                                    ( Please upload your <strong>TDS Exemption Certificate</strong> in Step 5.)
                                                </p>
                                            </div>
                                        )}


                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Trading Name
                                                <span className={styles.requiredSymbol}>*</span></label>
                                            <input
                                                type="text"
                                                name="trading_name"
                                                value={companyInfo.trading_name || ""}
                                                onChange={handleCompanyInfoChange}
                                                className={styles.fieldInput}
                                                required
                                                readOnly={isReadOnly}
                                            />
                                        </div>


                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Country of Incorporation</label>

                                            <select
                                                name="country_type"
                                                value={companyInfo.country_type}
                                                disabled={
                                                    isReadOnly ||
                                                    ["Sole Proprietorship", "Partnership"].includes(companyInfo.business_entity_type)
                                                }
                                                className={styles.fieldInput}
                                                onChange={(e) => {
                                                    const selected = e.target.value;

                                                    // ---------------------------------------
                                                    // 🟡 Case 1: User selects blank option
                                                    // ---------------------------------------
                                                    if (selected === "") {
                                                        setCompanyInfo(prev => ({
                                                            ...prev,
                                                            country_type: "",
                                                            isOtherCountry: false, // prevent auto Others
                                                            country_id: null,
                                                            state_id: "",
                                                            country_text: "",
                                                            state_text: "",
                                                        }));
                                                        return;
                                                    }

                                                    // ---------------------------------------
                                                    // 🟢 Case 2: India selected
                                                    // ---------------------------------------
                                                    if (selected === "India") {
                                                        const india = countries.find(c => c.country.toLowerCase() === "india");

                                                        setCompanyInfo(prev => ({
                                                            ...prev,
                                                            country_type: "India",
                                                            isOtherCountry: false,
                                                            country_id: india?.id || null,
                                                            country_text: "",
                                                            state_text: "",
                                                            state_id: "",
                                                        }));

                                                        return;
                                                    }else {
                                                        setCompanyInfo((prev) => ({
                                                            ...prev,
                                                            country_type: "Others",
                                                            isOtherCountry: true,

                                                            country_id: null,
                                                            state_id: null,

                                                            country_text: "",
                                                            state_text: "",
                                                        }));
                                                    }



                                                    // ---------------------------------------
                                                    // 🔵 Case 3: Others selected
                                                    // ---------------------------------------
                                                    setCompanyInfo(prev => ({
                                                        ...prev,
                                                        country_type: "Others",
                                                        isOtherCountry: true,
                                                        country_id: null,
                                                        state_id: "",
                                                        country_text: "",
                                                        state_text: "",
                                                    }));
                                                }}
                                            >
                                                <option value="">-- Select Country --</option>
                                                <option value="India">India</option>
                                                <option value="Others">Others</option>
                                            </select>
                                        </div>


                                        {/* ============================
    🌎 OTHERS → COUNTRY + STATE
=============================== */}
                                        {companyInfo.isOtherCountry && (
                                            <>
                                                {/* Country Text */}
                                                <div className={styles.fieldRow}>
                                                    <label className={styles.fieldLabel}>Specify Country</label>
                                                    <input
                                                        type="text"
                                                        value={companyInfo.country_text}
                                                        onChange={(e) =>
                                                            setCompanyInfo(prev => ({
                                                                ...prev,
                                                                country_text: e.target.value.toUpperCase(),
                                                            }))
                                                        }
                                                        className={styles.fieldInput}
                                                        required
                                                    />
                                                </div>

                                                {/* State Text */}
                                                <div className={styles.fieldRow}>
                                                    <label className={styles.fieldLabel}>State / Province</label>
                                                    <input
                                                        type="text"
                                                        value={companyInfo.state_text}
                                                        onChange={(e) =>
                                                            setCompanyInfo(prev => ({
                                                                ...prev,
                                                                state_text: e.target.value.toUpperCase(),
                                                            }))
                                                        }
                                                        className={styles.fieldInput}
                                                        required
                                                    />
                                                </div>
                                            </>
                                        )}


                                        {/* ============================
    🇮🇳 INDIA — STATE DROPDOWN
=============================== */}
                                        {!companyInfo.isOtherCountry && companyInfo.country_type === "India" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>State</label>
                                                <select
                                                    name="state_id"
                                                    value={companyInfo.state_id || ""}
                                                    onChange={(e) =>
                                                        setCompanyInfo(prev => ({
                                                            ...prev,
                                                            state_id: e.target.value,
                                                        }))
                                                    }
                                                    required
                                                    disabled={isReadOnly}
                                                    className={styles.fieldInput}
                                                >
                                                    <option value="">-- Select State --</option>
                                                    {states.map((s) => (
                                                        <option key={s.id} value={s.id}>
                                                            {s.state}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}


                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Telephone Number
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="telephone"
                                                value={
                                                    countryCode
                                                        ? `${countryCode} ${companyInfo.telephone}`
                                                        : companyInfo.telephone
                                                }
                                                onChange={(e) => {
                                                    // remove country code from input text safely
                                                    const input = e.target.value.replace(countryCode, "").trim();

                                                    // ✅ allow only digits (0–9)
                                                    const digitsOnly = input.replace(/[^0-9]/g, "");

                                                    setCompanyInfo({
                                                        ...companyInfo,
                                                        telephone: digitsOnly,
                                                    });
                                                }}
                                                className={styles.fieldInput}
                                                required
                                                readOnly={isReadOnly}
                                            />
                                        </div>


                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Registered Address <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="registered_address"
                                                value={companyInfo.registered_address || ""}
                                                onChange={(e) => {
                                                    // 🏠 Clean + uppercase before updating
                                                    const cleaned = e.target.value.replace(/[^A-Za-z0-9\s,\/-]/g, "").toUpperCase();

                                                    setCompanyInfo((prev) => ({
                                                        ...prev,
                                                        registered_address: cleaned,
                                                        // ✅ If checkbox checked, sync Business Address too
                                                        ...(sameAsRegistered ? { business_address: cleaned } : {}),
                                                    }));

                                                    // If you still use handleCompanyInfoChange elsewhere, you can remove this next line.
                                                    // handleCompanyInfoChange(e); // ❌ no need if we're handling it directly here
                                                }}
                                                placeholder="Enter Registered Address"
                                                className={styles.fieldInput}
                                                required
                                                readOnly={isReadOnly}
                                            />
                                        </div>

                                        {/* ✅ Checkbox for same address */}
                                        <center><div className={styles.fieldRow}>
                                            <label style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <input
                                                    type="checkbox"
                                                    checked={sameAsRegistered}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setSameAsRegistered(checked);
                                                        setCompanyInfo(prev => ({
                                                            ...prev,
                                                            business_address: checked ? prev.registered_address : "",
                                                        }));
                                                    }}
                                                    disabled={isReadOnly}
                                                />
                                                Registered Address same as Business Address
                                            </label>
                                        </div></center>

                                        {/* Business Address field */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Business Address
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="business_address"
                                                value={companyInfo.business_address || ""}
                                                onChange={handleCompanyInfoChange}
                                                className={styles.fieldInput}
                                                required
                                                readOnly={isReadOnly || sameAsRegistered}
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Contact Person<span className={styles.requiredSymbol}>*</span>
                                            </label>

                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    width: "65%",
                                                    border: "1px solid #ccc",
                                                    borderRadius: "6px",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                <select
                                                    name="contact_person_title"
                                                    value={companyInfo.contact_person_title || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    style={{
                                                        border: "none",
                                                        outline: "none",
                                                        padding: "8px 10px",
                                                        width: "80px",
                                                        background: "transparent",
                                                        borderRight: "1px solid #ccc",
                                                        cursor: "pointer",
                                                    }}
                                                    required
                                                    readOnly={isReadOnly}
                                                >

                                                    <option value="Mr.">Mr.</option>
                                                    <option value="Mrs.">Mrs.</option>
                                                    <option value="Ms.">Ms.</option>
                                                </select>

                                                <input
                                                    type="text"
                                                    name="contact_person_name"
                                                    value={companyInfo.contact_person_name || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    placeholder="Enter Contact Person Name"
                                                    style={{
                                                        border: "none",
                                                        outline: "none",
                                                        flex: 1,
                                                        padding: "8px 10px",
                                                        background: "transparent",
                                                    }}
                                                    required
                                                    readOnly={isReadOnly}
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Contact Person Phone Number
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="contact_person_mobile"
                                                value={companyInfo.contact_person_mobile || ""}
                                                onChange={handleCompanyInfoChange}
                                                className={styles.fieldInput}
                                                required
                                                readOnly={isReadOnly}
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Contact Person Email ID
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="contact_person_email"
                                                value={companyInfo.contact_person_email || ""}
                                                onChange={handleCompanyInfoChange}
                                                className={styles.fieldInput}
                                                required
                                                readOnly={isReadOnly}
                                            />
                                        </div>


                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Account Person<span className={styles.requiredSymbol}>*</span>
                                            </label>

                                            <div
                                                style={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    width: "65%",
                                                    border: "1px solid #ccc",
                                                    borderRadius: "6px",
                                                    overflow: "hidden",
                                                }}
                                            >
                                                <select
                                                    name="accounts_person_title"
                                                    value={companyInfo.accounts_person_title || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    style={{
                                                        border: "none",
                                                        outline: "none",
                                                        padding: "8px 10px",
                                                        width: "80px",
                                                        background: "transparent",
                                                        borderRight: "1px solid #ccc",
                                                        cursor: "pointer",
                                                    }}
                                                    required
                                                    readOnly={isReadOnly}
                                                >

                                                    <option value="Mr.">Mr. </option>
                                                    <option value="Mrs.">Mrs.</option>
                                                    <option value="Ms.">Ms.</option>
                                                </select>

                                                <input
                                                    type="text"
                                                    name="accounts_person_name"
                                                    value={companyInfo.accounts_person_name || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    placeholder="Enter Account Person Name"
                                                    style={{
                                                        border: "none",
                                                        outline: "none",
                                                        flex: 1,
                                                        padding: "8px 10px",
                                                        background: "transparent",
                                                    }}
                                                    required
                                                    readOnly={isReadOnly}
                                                />
                                            </div>
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Accounts Person Contact Number
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="accounts_person_contact_no"
                                                value={companyInfo.accounts_person_contact_no || ""}
                                                onChange={handleCompanyInfoChange}
                                                className={styles.fieldInput}
                                                required
                                                readOnly={isReadOnly}
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Accounts Person Email ID
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="accounts_person_email"
                                                value={companyInfo.accounts_person_email || ""}
                                                onChange={handleCompanyInfoChange}
                                                className={styles.fieldInput}
                                                required
                                                readOnly={isReadOnly}
                                            />
                                        </div>

                                    </div>


                                )}

                                {/* STEP 2: MSME */}
                                {currentPage === 2 && (
                                    <div className={styles.page}>
                                        <h3>MSME / Udyam Registration</h3>
                                        {/* 🏢 Registered under MSME Act */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Registered under MSME Act
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>

                                            <select
                                                name="registered_under_msme"
                                                value={msmeInfo.registered_under_msme || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;

                                                    // Set main dropdown value
                                                    setMsmeInfo((prev) => ({
                                                        ...prev,
                                                        registered_under_msme: value,
                                                        udyam_registration_number: "" // 🔥 RESET like TAN Number logic
                                                    }));
                                                }}
                                                className={styles.fieldInput}
                                                required
                                                disabled={isReadOnly}
                                            >
                                                <option value="">Select</option>
                                                <option value="true">Yes</option>
                                                <option value="false">No</option>
                                            </select>
                                        </div>

                                        {/* 🧾 Udyam Registration Number only if MSME = Yes */}
                                        {msmeInfo.registered_under_msme === "true" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    Udyam Registration Number
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>

                                                <input
                                                    type="text"
                                                    name="udyam_registration_number"
                                                    value={msmeInfo.udyam_registration_number || ""}
                                                    onChange={(e) =>
                                                        setMsmeInfo((prev) => ({
                                                            ...prev,
                                                            udyam_registration_number: e.target.value
                                                        }))
                                                    }
                                                    className={styles.fieldInput}
                                                    placeholder="Enter Udyam Registration Number"
                                                    required
                                                    readOnly={isReadOnly}
                                                />
                                            </div>
                                        )}

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Category (Micro/Small/Medium)
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <select
                                                name="category"
                                                value={msmeInfo?.category}
                                                onChange={handleMsmeChange}
                                                className={styles.fieldInput}
                                                disabled={isReadOnly}

                                            >
                                                <option value="">Select</option>
                                                <option value="Micro">Micro</option>
                                                <option value="Small">Small</option>
                                                <option value="Medium">Medium</option>
                                            </select>
                                        </div>

                                    </div>
                                )}

                                {/* STEP 3: GST */}
                                {/* STEP 3: Goods and Services Supplied */}
                                {currentPage === 3 && (
                                    <div className={styles.page}>


                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Type of Counterparty Business
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>

                                            <select
                                                name="type_of_counterparty"
                                                value={goodsServices.type_of_counterparty || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;

                                                    setGoodsServices((prev) => ({
                                                        ...prev,
                                                        type_of_counterparty: value,
                                                        others: "", // 🔥 reset Others field whenever dropdown changes
                                                    }));
                                                }}
                                                className={styles.fieldInput}
                                                required
                                                disabled={isReadOnly}
                                            >
                                                <option value="">Select</option>
                                                <option value="Trading Entity">Trading Entity</option>
                                                <option value="End-Use">End-Use</option>
                                                <option value="Manufacturer">Manufacturer</option>
                                                <option value="Service Provider">Service Provider</option>
                                                <option value="Third Party Payer / Reciever of funds">
                                                    Third Party Payer / Receiver of funds
                                                </option>
                                                <option value="Others">Others</option>
                                            </select>

                                            {/* Show “Others” input only if selected */}
                                            {goodsServices.type_of_counterparty === "Others" && (
                                                <input
                                                    type="text"
                                                    name="others"
                                                    value={goodsServices.others || ""}
                                                    onChange={(e) =>
                                                        setGoodsServices((prev) => ({
                                                            ...prev,
                                                            others: e.target.value,
                                                        }))
                                                    }
                                                    placeholder="Please specify other business type"
                                                    className={styles.fieldInput}
                                                    required
                                                    readOnly={isReadOnly}
                                                />
                                            )}
                                        </div>


                                        <h3 style={{
                                            fontSize: "16px",
                                            fontWeight: 600,
                                            marginBottom: "10px",
                                        }}>Details of the Supplies<span className={styles.requiredSymbol}>*</span></h3>

                                        <div className={styles.fieldRow}>
                                            <select
                                                name="type"
                                                value={goodsServices.type}
                                                onChange={(e) => {
                                                    const value = e.target.value;

                                                    // Auto reset all related fields when dropdown changes
                                                    setGoodsServices((prev) => ({
                                                        ...prev,
                                                        type: value,
                                                    }));

                                                    setGoods(Array(5).fill(""));                // reset goods[]
                                                    setServices(Array(5).fill(""));             // reset services[]
                                                    setGoodsAndServices(
                                                        Array.from({ length: 5 }, () => ({ goods: "", services: "" })) // reset goods & services combined
                                                    );
                                                }}
                                                className={styles.fieldInput}
                                                disabled={isReadOnly}
                                            >
                                                <option value="">Select</option>
                                                <option value="Goods">Goods</option>
                                                <option value="Services">Services</option>
                                                <option value="Goods and Services">Goods and Services</option>
                                            </select>
                                        </div>


                                        {/* ======== GOODS ======== */}
                                        {goodsServices.type === "Goods" && (
                                            <div>
                                                <h4 style={{
                                                    marginBottom: "5px",
                                                }}>Goods</h4>
                                                {[...Array(5)].map((_, index) => (
                                                    <div key={index} className={styles.gsForm_row}>
                                                        <input
                                                            type="text"
                                                            placeholder={`Enter Goods ${index + 1}`}
                                                            value={goods[index] || ""}
                                                            onChange={(e) => gsForm_changeGoods(index, e.target.value)}
                                                            className={styles.gsForm_input}
                                                            readOnly={isReadOnly}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* ======== SERVICES ======== */}
                                        {goodsServices.type === "Services" && (
                                            <div>
                                                <h4 style={{
                                                    marginBottom: "5px",
                                                }}>Services</h4>
                                                {[...Array(5)].map((_, index) => (
                                                    <div key={index} className={styles.gsForm_row}>
                                                        <input
                                                            type="text"
                                                            placeholder={`Enter Service ${index + 1}`}
                                                            value={services[index] || ""}
                                                            onChange={(e) => gsForm_changeService(index, e.target.value)}
                                                            className={styles.gsForm_input}
                                                            readOnly={isReadOnly}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* ======== GOODS & SERVICES ======== */}
                                        {goodsServices.type === "Goods and Services" && (
                                            <div>
                                                <h4 style={{
                                                    marginBottom: "5px",
                                                }}>Goods and Services</h4>
                                                {[...Array(5)].map((_, index) => (
                                                    <div key={index} className={styles.gsForm_combinedRow}>
                                                        <input
                                                            type="text"
                                                            placeholder={`Goods ${index + 1}`}
                                                            value={goodsAndServices[index]?.goods || ""}
                                                            onChange={(e) =>
                                                                gsForm_changeGoodsServices(index, "goods", e.target.value)
                                                            }
                                                            className={styles.gsForm_input}
                                                            readOnly={isReadOnly}
                                                        />
                                                        <input
                                                            type="text"
                                                            placeholder={`Service ${index + 1}`}
                                                            value={goodsAndServices[index]?.services || ""}
                                                            onChange={(e) =>
                                                                gsForm_changeGoodsServices(index, "services", e.target.value)
                                                            }
                                                            className={styles.gsForm_input}
                                                            readOnly={isReadOnly}

                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <h3 style={{ marginTop: "20px" }}>GST Registrations</h3>

                                        {/* GST Applicable */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Is GST Applicable? <span className={styles.requiredSymbol}>*</span>
                                            </label>

                                            <select
                                                name="gst_applicable"
                                                value={gstApplicable}
                                                onChange={(e) => {
                                                    const value = e.target.value;

                                                    // --- SAME RESET LOGIC AS GOODS/SERVICES SELECT ---
                                                    setGstApplicable(value);

                                                    // reset number selection
                                                    setCount(0);

                                                    // reset all gst registration entries
                                                    setgstFormData([]); //  correct setter name

                                                    // reset meta info
                                                    setGstMeta({
                                                        reg_type: "",
                                                        gstr_filling_type: "",
                                                    });
                                                }}
                                                className={styles.fieldInput}
                                                required
                                                disabled={isReadOnly}
                                            >
                                                <option value="">-- Select --</option> {/* 🟢 Default option */}
                                                <option value="true">Yes</option>
                                                <option value="false">No</option>
                                            </select>
                                        </div>

                                        {/* ✅ GST Fields visible only when checkbox is UNCHECKED */}
                                        {gstApplicable === "true" && (

                                            // const payload = {
                                            // gst_applicable: gstApplicable === "true" ? 1 : 0,
                                            // ...other fields
                                            // };

                                            <>
                                                {/* Number of GST Registrations */}
                                                <div className={styles.fieldRow}>
                                                    <label className={styles.fieldLabel}>
                                                        Number of GST Registrations (max 28)
                                                        <span className={styles.requiredSymbol}>*</span>
                                                    </label>

                                                    <select
                                                        className={styles.fieldInput}
                                                        value={count}
                                                        onChange={handleCountChange}
                                                        required
                                                        disabled={isReadOnly}
                                                    >
                                                        <option value={0}>Select</option>
                                                        {[...Array(28)].map((_, i) => (
                                                            <option key={i + 1} value={i + 1}>
                                                                {i + 1}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Dynamic GST Registration Fields */}
                                                {gstformData.map((item, i) => (
                                                    <div
                                                        key={i}
                                                        style={{
                                                            border: "1px solid #ddd",
                                                            padding: "20px",
                                                            borderRadius: "8px",
                                                            marginBottom: "24px",
                                                            backgroundColor: "#fdfdfd",
                                                        }}
                                                    >
                                                        <h4 style={{ marginBottom: "16px", color: "#333" }}>
                                                            Registration {i + 1}
                                                        </h4>

                                                        {/* State */}
                                                        <div className={styles.fieldRow}>
                                                            <label className={styles.fieldLabel}>State Name</label>

                                                            <select
                                                                className={styles.fieldInput}
                                                                value={item.state}
                                                                onChange={(e) =>
                                                                    handleGstFieldChange(i, "state", e.target.value)
                                                                }
                                                                required
                                                                disabled={isReadOnly}
                                                            >
                                                                <option value="">Select State</option>

                                                                {states.map((state) => (
                                                                    <option key={state.id} value={state.id}>
                                                                        {state.state}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>

                                                        {/* GST Number */}
                                                        <div className={styles.fieldRow}>
                                                            <label className={styles.fieldLabel}>
                                                                GST Number (15 digits)
                                                                <span className={styles.requiredSymbol}>*</span>
                                                            </label>

                                                            <input
                                                                type="text"
                                                                maxLength={15}
                                                                className={styles.fieldInput}
                                                                value={item.gstNumber}
                                                                onChange={(e) =>
                                                                    handleGstFieldChange(i, "gstNumber", e.target.value)
                                                                }
                                                                placeholder="Enter GSTIN"
                                                                required
                                                                readOnly={isReadOnly}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Registration Type */}
                                                <div className={styles.fieldRow}>
                                                    <label className={styles.fieldLabel}>
                                                        Registration Type
                                                        <span className={styles.requiredSymbol}>*</span>
                                                    </label>

                                                    <select
                                                        value={gstMeta.reg_type}
                                                        onChange={(e) =>
                                                            setGstMeta((prev) => ({
                                                                ...prev,
                                                                reg_type: e.target.value,
                                                            }))
                                                        }
                                                        className={styles.fieldInput}
                                                        required
                                                        readOnly={isReadOnly}
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="Regular">Regular</option>
                                                        <option value="Composition">Composition</option>
                                                        <option value="SEZ">SEZ</option>
                                                    </select>
                                                </div>

                                                {/* GSTR Filing Type */}
                                                <div className={styles.fieldRow}>
                                                    <label className={styles.fieldLabel}>
                                                        GSTR Filing Type
                                                        <span className={styles.requiredSymbol}>*</span>
                                                    </label>

                                                    <select
                                                        value={gstMeta.gstr_filling_type}
                                                        onChange={(e) =>
                                                            setGstMeta((prev) => ({
                                                                ...prev,
                                                                gstr_filling_type: e.target.value,
                                                            }))
                                                        }
                                                        className={styles.fieldInput}
                                                        required
                                                        disabled={isReadOnly}
                                                    >
                                                        <option value="">Select</option>
                                                        <option value="Monthly">Monthly</option>
                                                        <option value="Quarterly">Quarterly</option>
                                                    </select>
                                                </div>
                                            </>
                                        )}


                                        <h3>Income Tax Details</h3>

                                        <table className={styles?.incomeTaxTable || "incomeTaxTable"}>
                                            <thead>
                                                <tr>
                                                    <th colSpan="3" className={styles?.tableSubtitle}>
                                                        Details of Turnover for the Last 2 Financial Years
                                                    </th>
                                                </tr>
                                                <tr>
                                                    <th>Particulars</th>
                                                    <th>Financial Year - I</th>
                                                    <th>Financial Year - II</th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                {/* Financial Year */}
                                                <tr>
                                                    <td>
                                                        Financial Year <span className={styles.requiredSymbol}>*</span>
                                                    </td>
                                                    {[1, 2].map((i) => (
                                                        <td key={i}>
                                                            <input
                                                                type="text"
                                                                name={`fy${i}`}
                                                                value={formData[`fy${i}`]}
                                                                readOnly
                                                                className={styles.fieldInput}
                                                            />
                                                        </td>
                                                    ))}
                                                </tr>
                                                {/* Currency Type Row */}
                                                <tr>
                                                    <td>Currency Type</td>

                                                    {[1, 2].map((i) => (
                                                        <td key={i}>
                                                            <select
                                                                name={`currencyType${i}`}
                                                                value={formData[`currencyType${i}`] || ""}
                                                                onChange={(e) => {
                                                                    handleIncomeChange(e);
                                                                    // clear currency name if switched back to Rupees
                                                                    if (e.target.value === "Rupees (INR)") {
                                                                        setFormData((prev) => ({
                                                                            ...prev,
                                                                            [`currencyName${i}`]: "",
                                                                        }));
                                                                    }
                                                                }}
                                                                required
                                                                disabled={isReadOnly}
                                                                className={styles.fieldInput}
                                                            >
                                                                <option value="">-- Select Currency Type --</option>
                                                                <option value="Rupees (INR)">Rupees (INR)</option>
                                                                <option value="Others">Others</option>
                                                            </select>
                                                        </td>
                                                    ))}
                                                </tr>

                                                {/* Currency Name Row — shows only if 'Others' selected */}
                                                {["currencyType1", "currencyType2"].some(
                                                    (key) => formData[key] === "Others"
                                                ) && (
                                                        <tr>
                                                            <td>
                                                                Currency Name <span className={styles.requiredSymbol}>*</span>
                                                            </td>
                                                            {[1, 2].map((i) => (
                                                                <td key={i}>
                                                                    {formData[`currencyType${i}`] === "Others" ? (
                                                                        <input
                                                                            type="text"
                                                                            name={`currencyName${i}`}
                                                                            value={formData[`currencyName${i}`] || ""}
                                                                            onChange={(e) => {
                                                                                const upperCaseValue = e.target.value.toUpperCase();
                                                                                setFormData((prev) => ({
                                                                                    ...prev,
                                                                                    [e.target.name]: upperCaseValue,
                                                                                }));
                                                                            }}
                                                                            required
                                                                            readOnly={isReadOnly}
                                                                            className={styles.fieldInput}
                                                                            placeholder="Enter currency name"
                                                                        />
                                                                    ) : (
                                                                        <div style={{ height: "30px" }}></div> // keep table alignment
                                                                    )}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    )}


                                                <tr>
                                                    <td>
                                                        Turnover
                                                    </td>
                                                    {[1, 2].map((i) => (
                                                        <td key={i}>
                                                            <input
                                                                type="number"
                                                                name={`turnover${i}`}
                                                                value={formData[`turnover${i}`] || ""}
                                                                onChange={handleIncomeChange}
                                                                min="0"
                                                                onWheel={(e) => e.target.blur()}
                                                                required
                                                                readOnly={isReadOnly}
                                                                className={styles.fieldInput}
                                                                placeholder={
                                                                    formData[`currencyType${i}`] === "Rupees"
                                                                        ? "Enter amount in INR"
                                                                        : "Enter turnover amount"
                                                                }
                                                            />
                                                        </td>
                                                    ))}
                                                </tr>
                                                {/* ITR Status */}
                                                <tr>
                                                    <td>
                                                        Status of ITR filed (Yes/No)
                                                        <span className={styles.requiredSymbol}>*</span>
                                                    </td>
                                                    {[1, 2].map((i) => (
                                                        <td key={i}>
                                                            <select
                                                                name={`itrStatus${i}`}
                                                                value={formData[`itrStatus${i}`] || ""}
                                                                onChange={(e) => {
                                                                    const value = e.target.value;

                                                                    setFormData((prev) => ({
                                                                        ...prev,
                                                                        [`itrStatus${i}`]: value,
                                                                        // 🔥 Reset dependent fields when status changes
                                                                        [`ackNo${i}`]: "",
                                                                        [`itrDay${i}`]: "",
                                                                        [`itrMonth${i}`]: "",
                                                                        [`itrYear${i}`]: "",
                                                                    }));
                                                                }}
                                                                required
                                                                disabled={isReadOnly}
                                                                className={styles.fieldInput}
                                                            >
                                                                <option value="">Select</option>
                                                                <option value="true">Yes</option>
                                                                <option value="false">No</option>
                                                            </select>
                                                        </td>
                                                    ))}
                                                </tr>

                                                {/* ITR Acknowledgment */}
                                                {["itrStatus1", "itrStatus2"].some((key) => formData[key] === "true") && (
                                                    <tr>
                                                        <td>ITR Acknowledgment No.</td>
                                                        {[1, 2].map((i) => (
                                                            <td key={i}>
                                                                {formData[`itrStatus${i}`] === "true" ? (
                                                                    <input
                                                                        type="text"
                                                                        name={`ackNo${i}`}
                                                                        value={formData[`ackNo${i}`] || ""}
                                                                        onChange={handleIncomeChange}
                                                                        required
                                                                        readOnly={isReadOnly}
                                                                        className={styles.fieldInput}
                                                                    />
                                                                ) : (
                                                                    <div style={{ height: "30px" }}></div>
                                                                )}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                )}

                                                {/* ITR Filed Date */}
                                                {["itrStatus1", "itrStatus2"].some((key) => formData[key] === "true") && (

                                                    <tr>
                                                        <td>
                                                            ITR Filed Date <span className={styles.requiredSymbol}>*</span>
                                                        </td>
                                                        {[1, 2].map((i) => {
                                                            const fy = formData[`fy${i}`];
                                                            const endYear = fy ? parseInt(fy.split("-")[1]) : new Date().getFullYear();
                                                            const itrYears = Array.from({ length: 5 }, (_, idx) => endYear - idx);

                                                            return (
                                                                <td key={i}>
                                                                    {formData[`itrStatus${i}`] === "true" ? (
                                                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                                            {/* Year dropdown */}
                                                                            <select
                                                                                className={styles.fieldInput}
                                                                                value={formData[`itrYear${i}`] || ""}
                                                                                onChange={(e) =>
                                                                                    handleIncomeChange({
                                                                                        target: { name: `itrYear${i}`, value: e.target.value },
                                                                                    })
                                                                                }
                                                                                required
                                                                                disabled={isReadOnly}
                                                                                style={{ width: "75px", textAlign: "center" }}
                                                                            >
                                                                                <option value="">YYYY</option>
                                                                                {itrYears.map((year) => (
                                                                                    <option key={year} value={year}>
                                                                                        {year}
                                                                                    </option>
                                                                                ))}
                                                                            </select>

                                                                            {/* Month */}
                                                                            <select
                                                                                className={styles.fieldInput}
                                                                                value={formData[`itrMonth${i}`] || ""}
                                                                                onChange={(e) =>
                                                                                    handleIncomeChange({
                                                                                        target: { name: `itrMonth${i}`, value: e.target.value },
                                                                                    })
                                                                                }
                                                                                required
                                                                                disabled={isReadOnly}
                                                                                style={{ width: "65px", textAlign: "center" }}
                                                                            >
                                                                                <option value="">MM</option>
                                                                                {[
                                                                                    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                                                                    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                                                                                ].map((month, index) => (
                                                                                    <option key={month} value={String(index + 1).padStart(2, "0")}>
                                                                                        {month}
                                                                                    </option>
                                                                                ))}
                                                                            </select>

                                                                            {/* Day */}
                                                                            <select
                                                                                className={styles.fieldInput}
                                                                                value={formData[`itrDay${i}`] || ""}
                                                                                onChange={(e) =>
                                                                                    handleIncomeChange({
                                                                                        target: { name: `itrDay${i}`, value: e.target.value },
                                                                                    })
                                                                                }
                                                                                style={{ width: "65px", textAlign: "center" }}
                                                                            >
                                                                                <option value="">DD</option>
                                                                                {Array.from(
                                                                                    { length: getDaysInMonth(formData[`itrMonth${i}`], formData[`itrYear${i}`]) },
                                                                                    (_, d) => (
                                                                                        <option key={d + 1} value={String(d + 1).padStart(2, "0")}>
                                                                                            {String(d + 1).padStart(2, "0")}
                                                                                        </option>
                                                                                    )
                                                                                )}
                                                                            </select>
                                                                        </div>
                                                                    ) : (
                                                                        <div style={{ height: "30px" }}></div>
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                )}


                                            </tbody>
                                        </table>


                                    </div>
                                )}


                                {/* STEP 3: Banking & Further Information */}
                                {currentPage === 4 && (
                                    <div className={styles.page}>
                                        <h3>Banking Information</h3>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Account Holder’s Name
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="account_holder_name"
                                                value={bankInfo.account_holder_name}
                                                onChange={handleBankDetailsChange}
                                                className={styles.fieldInput}
                                                required
                                                readOnly={isReadOnly}
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Bank Name
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="bank_name"
                                                value={bankInfo.bank_name}
                                                onChange={handleBankDetailsChange}
                                                className={styles.fieldInput}
                                                required
                                                readOnly={isReadOnly}
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Bank Address
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="bank_address"
                                                value={bankInfo.bank_address}
                                                onChange={handleBankDetailsChange}
                                                className={styles.fieldInput}
                                                required
                                                readOnly={isReadOnly}
                                            />
                                        </div>

                                        {/* Transaction Type */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Transaction Type <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <select
                                                name="transaction_type"
                                                value={bankInfo.transaction_type || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;

                                                    setBankInfo((prev) => ({
                                                        ...prev,
                                                        transaction_type: value,
                                                        ifsc_code: "",
                                                        swift_code: "",
                                                    }));
                                                }}
                                                className={styles.fieldInput}
                                                required
                                            >
                                                <option value="">Select Transaction Type</option>
                                                <option value="Domestic">Domestic</option>
                                                <option value="International">International</option>
                                                <option value="Domestic and International">Domestic and International</option>
                                            </select>
                                        </div>

                                        {/* Country */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Country</label>
                                            <select
                                                name="country_type"
                                                value={bankInfo.country_type}
                                                onChange={(e) => {
                                                    const selected = e.target.value;

                                                    if (selected === "India") {
                                                        const india = countries.find(c => c.country.toLowerCase() === "india");

                                                        setIsOtherBankCountry(false);   // ✅ FIX

                                                        setBankInfo((prev) => ({
                                                            ...prev,
                                                            country_type: "India",
                                                            country_id: india?.id || null,
                                                            country_text: "",
                                                            state_id: "",
                                                            state_text: "",
                                                        }));
                                                    } else {
                                                        setIsOtherBankCountry(true);    // ✅ FIX

                                                        setBankInfo((prev) => ({
                                                            ...prev,
                                                            country_type: "Others",
                                                            country_id: null,
                                                            state_id: null,
                                                            country_text: "",
                                                            state_text: "",
                                                        }));
                                                    }
                                                }}
                                                className={styles.fieldInput}
                                            >
                                                <option value="">-- Select Country --</option>
                                                <option value="India">India</option>
                                                <option value="Others">Others</option>
                                            </select>
                                        </div>

                                        {/* Specify Country if not India */}
                                        {isOtherBankCountry && (
                                            <>
                                                {/* Country Text */}
                                                <div className={styles.fieldRow}>
                                                    <label className={styles.fieldLabel}>Specify Country</label>
                                                    <input
                                                        type="country_text"
                                                        value={bankInfo.country_text}
                                                        onChange={(e) =>
                                                            setBankInfo((prev) => ({
                                                                ...prev,
                                                                country_text: e.target.value.toUpperCase(),
                                                            }))
                                                        }
                                                        required
                                                        className={styles.fieldInput}
                                                    />
                                                </div>


                                            </>
                                        )}

                                        {/* Account Number */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Account Number <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="account_number"
                                                value={bankInfo.account_number || ""}
                                                onChange={handleBankDetailsChange}
                                                className={styles.fieldInput}
                                                required
                                                readOnly={isReadOnly}
                                            />
                                        </div>

                                        {/* IFSC / SWIFT based on Transaction Type */}
                                        {(bankInfo.transaction_type === "Domestic" || bankInfo.transaction_type === "Domestic and International") && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    IFSC Code <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="ifsc_code"
                                                    value={bankInfo.ifsc_code || ""}
                                                    onChange={(e) =>
                                                        setBankInfo((prev) => ({ ...prev, ifsc_code: e.target.value.toUpperCase() }))
                                                    }
                                                    maxLength={11}
                                                    className={styles.fieldInput}
                                                />
                                            </div>
                                        )}

                                        {(bankInfo.transaction_type === "International" || bankInfo.transaction_type === "Domestic and International") && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    SWIFT Code <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="swift_code"
                                                    value={bankInfo.swift_code || ""}
                                                    onChange={(e) =>
                                                        setBankInfo((prev) => ({ ...prev, swift_code: e.target.value.toUpperCase() }))
                                                    }
                                                    maxLength={11}
                                                    className={styles.fieldInput}
                                                />
                                            </div>
                                        )}


                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Beneficiary of the Account
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="beneficiary_name"
                                                value={bankInfo.beneficiary_name}
                                                onChange={handleBankDetailsChange}
                                                className={styles.fieldInput}
                                                required
                                                readOnly={isReadOnly}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* STEP 4: Documents to be enclosed */}
                                {currentPage === 5 && (
                                    <div className={styles.page}>
                                        <h3>Documents to be enclosed</h3>
                                        <p
                                            className={styles.note}
                                            style={{
                                                color: "red",
                                                fontSize: "12px",
                                            }}
                                        >
                                            (Please verify and upload documents in JPG, JPEG, PNG, or PDF format. The
                                            maximum file size allowed is 5 MB.)
                                        </p>

                                        {/* PAN */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>PAN <span className={styles.requiredSymbol}>*</span></label>
                                            <input
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.pdf"
                                                className={styles.fieldInput}
                                                onChange={(e) => handleDocumentChange("pan", e.target.files[0])}
                                                required
                                                readOnly={isReadOnly}
                                            />

                                            {/* ✅ Show uploaded file name */}
                                            {documents.pan?.fileName && (
                                                <span className={styles.fileName}>📄 {documents.pan.fileName}</span>
                                            )}


                                            {documents.pan?.url && (
                                                <a
                                                    href={documents.pan.url.startsWith("blob:")
                                                        ? documents.pan.url // local preview
                                                        : `${process.env.REACT_APP_API_BASE_URL}/${documents.pan.url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.viewButton}

                                                >
                                                    View
                                                </a>
                                            )}
                                        </div>


                                        {/* 🔹 GSTIN Upload Section */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>GSTIN Available</label>

                                            <select
                                                name="gst_available"
                                                value={documents.gst_available || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;

                                                    setDocuments((prev) => ({
                                                        ...prev,
                                                        gst_available: value,

                                                        // Auto-reset GST document when dropdown changes
                                                        gst: value === "true"
                                                            ? prev.gst  // keep existing only if reselected Yes
                                                            : null       // clear when user selects "No"
                                                    }));
                                                }}
                                                className={styles.fieldInput}
                                                required
                                                disabled={isReadOnly}
                                            >
                                                <option value="">Select</option>
                                                <option value="true">Yes</option>
                                                <option value="false">No</option>
                                            </select>
                                        </div>

                                        {/* Show GSTIN upload only if YES */}
                                        {documents.gst_available === "true" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    GSTIN Certificate <span className={styles.requiredSymbol}>*</span>
                                                </label>

                                                <input
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png,.pdf"
                                                    className={styles.fieldInput}
                                                    onChange={(e) => handleDocumentChange("gst", e.target.files[0])}
                                                    readOnly={isReadOnly}
                                                />

                                                {/* File name */}
                                                {documents.gst?.fileName && (
                                                    <span className={styles.fileName}>📄 {documents.gst.fileName}</span>
                                                )}

                                                {/* View Button */}
                                                {documents.gst?.url && (
                                                    <a
                                                        href={
                                                            documents.gst.url.startsWith("blob:")
                                                                ? documents.gst.url
                                                                : `${process.env.REACT_APP_API_BASE_URL}/${documents.gst.url}`
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={styles.viewButton}
                                                    >
                                                        View
                                                    </a>
                                                )}
                                            </div>
                                        )}


                                        {/* MSME Registered? */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Registered under MSME
                                            </label>
                                            <select
                                                value={msmeInfo?.registered_under_msme || ""}
                                                onChange={(e) =>
                                                    setMsmeInfo((prev) => ({
                                                        ...prev,
                                                        registered_under_msme: e.target.value,
                                                    }))
                                                }
                                                className={styles.fieldInput}
                                                required
                                                disabled={true}
                                            >
                                                <option value="">Select</option>
                                                <option value="true">Yes</option>
                                                <option value="false">No</option>

                                            </select>
                                        </div>

                                        {/* MSME Certificate Upload */}
                                        {msmeInfo?.registered_under_msme === "true" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    Upload MSME<span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png,.pdf"
                                                    className={styles.fieldInput}
                                                    onChange={(e) => handleDocumentChange("msme", e.target.files[0])}
                                                    readOnly={isReadOnly}
                                                />
                                                {documents.msme?.fileName && (
                                                    <span className={styles.fileName}>📄 {documents.msme.fileName}</span>
                                                )}
                                                {documents.msme?.url && (
                                                    <a
                                                        href={
                                                            documents.msme.url.startsWith("blob:")
                                                                ? documents.msme.url
                                                                : `${process.env.REACT_APP_API_BASE_URL}/${documents.msme.url}`
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={styles.viewButton}
                                                    >
                                                        View
                                                    </a>
                                                )}
                                            </div>
                                        )}



                                        {/* Cancelled Cheque Leaf Upload */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Cancelled Cheque Leaf

                                            </label>

                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handleDocumentChange(e, "cheque")}
                                                className={styles.fieldInput}
                                                disabled={isReadOnly}
                                            />

                                            {/* ✅ Show uploaded file name */}
                                            {documents.cheque?.fileName && (
                                                <span className={styles.fileName}>📄 {documents.cheque.fileName}</span>
                                            )}


                                            {/* View Button */}
                                            {documents.cheque?.url && (
                                                <a
                                                    href={
                                                        documents.cheque.url.startsWith("blob:")
                                                            ? documents.cheque.url
                                                            : `${process.env.REACT_APP_API_BASE_URL}/${documents.cheque.url}`
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.viewButton}
                                                >
                                                    View
                                                </a>
                                            )}
                                        </div>

                                        {/* 🧾 TAN Certificate / TAN Exemption Certificate */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                {tanStatus === "yes"
                                                    ? "Upload TAN Certificate"
                                                    : tanStatus === "no"
                                                        ? "Upload TAN Exemption Certificate"
                                                        : "TAN Certificate / Exemption Certificate"}
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>

                                            {/* File Upload */}
                                            <input
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.pdf"
                                                className={styles.fieldInput}
                                                onChange={(e) =>
                                                    handleDocumentChange(
                                                        tanStatus === "yes" ? "tanCertificate" : "tanExemption",
                                                        e.target.files[0]
                                                    )
                                                }
                                                required
                                                readOnly={isReadOnly}
                                            />

                                            {/* ============================ */}
                                            {/* TAN Certificate (Yes) */}
                                            {/* ============================ */}
                                            {tanStatus === "yes" && documents.tanCertificate?.fileName && (
                                                <>
                                                    <span className={styles.fileName}>
                                                        📄 {documents.tanCertificate.fileName}
                                                    </span>

                                                    {documents.tanCertificate?.url && (
                                                        <a
                                                            href={
                                                                documents.tanCertificate.url.startsWith("blob:")
                                                                    ? documents.tanCertificate.url
                                                                    : `${process.env.REACT_APP_API_BASE_URL}/${documents.tanCertificate.url}`
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={styles.viewButton}
                                                        >
                                                            View
                                                        </a>
                                                    )}
                                                </>
                                            )}

                                            {/* ============================ */}
                                            {/* TAN Exemption (No) */}
                                            {/* ============================ */}
                                            {tanStatus === "no" && documents.tanExemption?.fileName && (
                                                <>
                                                    <span className={styles.fileName}>
                                                        📄 {documents.tanExemption.fileName}
                                                    </span>

                                                    {documents.tanExemption?.url && (
                                                        <a
                                                            href={
                                                                documents.tanExemption.url.startsWith("blob:")
                                                                    ? documents.tanExemption.url
                                                                    : `${process.env.REACT_APP_API_BASE_URL}/${documents.tanExemption.url}`
                                                            }
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className={styles.viewButton}
                                                        >
                                                            View
                                                        </a>
                                                    )}
                                                </>
                                            )}
                                        </div>



                                        {/* Certificate of Incorporation / Firm Registration */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Registration Certificate <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <input
                                                type="file"
                                                accept=".jpg,.jpeg,.png,.pdf"
                                                className={styles.fieldInput}
                                                onChange={(e) => handleDocumentChange("incorporation", e.target.files[0])}
                                                required
                                                readOnly={isReadOnly}
                                            />

                                            {documents.incorporation?.fileName && (
                                                <span className={styles.fileName}>📄 {documents.incorporation.fileName}</span>
                                            )}

                                            {documents.incorporation?.url && (
                                                <a
                                                    href={documents.incorporation.url.startsWith("blob:")
                                                        ? documents.incorporation.url // local preview
                                                        : `${process.env.REACT_APP_API_BASE_URL}/${documents.incorporation.url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.viewButton}
                                                >
                                                    View
                                                </a>
                                            )}
                                        </div>

                                        {/* TDS Declaration */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>TDS Declaration</label>

                                            <select
                                                name="tds_declaration"
                                                value={documents.tds_declaration || ""}
                                                onChange={(e) => {
                                                    const value = e.target.value;

                                                    setDocuments((prev) => ({
                                                        ...prev,
                                                        tds_declaration: value,

                                                        // Auto-reset uploaded file when user selects "No"
                                                        tds: value === "true" ? prev.tds : null
                                                    }));
                                                }}
                                                className={styles.fieldInput}
                                                required
                                                disabled={isReadOnly}
                                            >
                                                <option value="">Select</option>
                                                <option value="true">Yes</option>
                                                <option value="false">No</option>
                                            </select>
                                        </div>



                                        {/* Show upload only if YES */}
                                        {documents.tds_declaration === "true" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    Upload TDS Declaration <span className={styles.requiredSymbol}>*</span>
                                                </label>

                                                <input
                                                    type="file"
                                                    accept=".jpg,.jpeg,.png,.pdf"
                                                    className={styles.fieldInput}
                                                    onChange={(e) => handleDocumentChange("tds", e.target.files[0])}
                                                    readOnly={isReadOnly}
                                                />

                                                {/* File Name */}
                                                {documents.tds?.fileName && (
                                                    <span className={styles.fileName}>📄 {documents.tds.fileName}</span>
                                                )}

                                                {/* View Button */}
                                                {documents.tds?.url && (
                                                    <a
                                                        href={
                                                            documents.tds.url.startsWith("blob:")
                                                                ? documents.tds.url
                                                                : `${process.env.REACT_APP_API_BASE_URL}/${documents.tds.url}`
                                                        }
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={styles.viewButton}
                                                    >
                                                        View
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                                {/* STEP 6: Declaration & Confidentiality */}
                                {currentPage === 6 && (
                                    <div className={styles.page}>
                                        <h3>Declaration and Acknowledgement</h3>

                                        <p
                                            className={styles.declarationText}
                                            style={{ margin: "10px 0", lineHeight: "1.6", textAlign: "justify" }}
                                        >
                                            I/We{" "}
                                            <input
                                                type="text"
                                                value={vendorDeclarationInfo.name}
                                                onChange={(e) =>
                                                    setVendorDeclarationInfo((prev) => ({
                                                        ...prev,
                                                        name: e.target.value.toUpperCase(),
                                                    }))
                                                }
                                                className={styles.inlineInput}
                                                placeholder="Enter Name"
                                                disabled={isReadOnly}
                                            />{" "}
                                            of{" "}
                                            <input
                                                type="text"
                                                value={vendorDeclarationInfo.organization}
                                                onChange={(e) =>
                                                    setVendorDeclarationInfo((prev) => ({
                                                        ...prev,
                                                        organization: e.target.value.toUpperCase(),
                                                    }))
                                                }
                                                className={styles.inlineInput}
                                                placeholder="Enter Organization"
                                                disabled={isReadOnly}
                                            />{" "}
                                            designated as{" "}
                                            <input
                                                type="text"
                                                value={vendorDeclarationInfo.designation}
                                                onChange={(e) =>
                                                    setVendorDeclarationInfo((prev) => ({
                                                        ...prev,
                                                        designation: e.target.value.toUpperCase(),
                                                    }))
                                                }
                                                className={styles.inlineInput}
                                                placeholder="Enter Designation"
                                                disabled={isReadOnly}
                                            />{" "}
                                            declare that the information provided in this document is true and accurate in
                                            all respects and that we have performed such procedures and inquiries as
                                            necessary to verify the answers.
                                        </p>

                                        <div className={styles.checkboxRow}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={isDeclarationChecked}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setIsDeclarationChecked(checked);


                                                    }}
                                                    disabled={isReadOnly}
                                                    style={{ marginRight: "8px" }}
                                                />
                                                I agree Declaration
                                            </label>
                                        </div>



                                        <p
                                            className={styles.declarationText}
                                            style={{ margin: "10px 0", lineHeight: "1.6", textAlign: "justify" }}
                                        >
                                            I/We{" "}
                                            <input
                                                type="text"
                                                value={countryPartyInfo.name}
                                                onChange={(e) =>
                                                    setCountryPartyInfo((prev) => ({
                                                        ...prev,
                                                        name: e.target.value.toUpperCase(),
                                                    }))
                                                }
                                                className={styles.inlineInput}
                                                placeholder="Enter Name"
                                                disabled={isReadOnly}
                                            />{" "}
                                            representing the country{" "}
                                            <input
                                                type="text"
                                                value={countryPartyInfo.country}
                                                onChange={(e) =>
                                                    setCountryPartyInfo((prev) => ({
                                                        ...prev,
                                                        country: e.target.value.toUpperCase(),
                                                    }))
                                                }
                                                className={styles.inlineInput}
                                                placeholder="Enter Country"
                                                disabled={isReadOnly}
                                            />{" "}
                                            designated as{" "}
                                            <input
                                                type="text"
                                                value={countryPartyInfo.designation}
                                                onChange={(e) =>
                                                    setCountryPartyInfo((prev) => ({
                                                        ...prev,
                                                        designation: e.target.value.toUpperCase(),
                                                    }))
                                                }
                                                className={styles.inlineInput}
                                                placeholder="Enter Designation"
                                                disabled={isReadOnly}
                                            />
                                            , hereby declare that all information provided by our organization is accurate
                                            and complies with the regulations of our respective country.
                                        </p>

                                        {/* Country Party Declaration Section */}
                                        <div className={styles.checkboxRow}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={isCountryPartyChecked}
                                                    onChange={(e) => {
                                                        const checked = e.target.checked;
                                                        setIsCountryPartyChecked(checked);


                                                    }}
                                                    disabled={isReadOnly}
                                                    style={{ marginRight: "8px" }}
                                                />
                                                I agree with Country Party Declaration
                                            </label>
                                        </div>

                                        {/* ✅ Show these 3 fields only when BOTH checkboxes are ticked */}
                                        {isDeclarationChecked && isCountryPartyChecked && (
                                            <div className={styles.declarationBox}>
                                                <div className={styles.fieldRow}>
                                                    <label className={styles.fieldLabel}>Place <span className={styles.requiredSymbol}>*</span></label>
                                                    <input
                                                        type="text"
                                                        value={declarationDetails.place}
                                                        onChange={(e) =>
                                                            setDeclarationDetails((prev) => ({
                                                                ...prev,
                                                                place: e.target.value
                                                                    .replace(/[^A-Za-z\s]/g, "")
                                                                    .replace(/\s+/g, " ")
                                                                    .toUpperCase()
                                                                    .trim(),
                                                            }))
                                                        }
                                                        className={styles.fieldInput}
                                                        readOnly={isReadOnly}
                                                    />
                                                </div>

                                                {/* Date (auto-filled with today's date, not editable) */}
                                                <div className={styles.fieldRow}>
                                                    <label className={styles.fieldLabel}>Date</label>
                                                    <input
                                                        type="date"
                                                        value={
                                                            declarationDetails.date ||
                                                            new Date().toISOString().slice(0, 10) // today's date in yyyy-mm-dd
                                                        }
                                                        onChange={() => { }} // prevent typing
                                                        className={styles.fieldInput}
                                                        readOnly // 🔒 makes it non-editable
                                                    />
                                                </div>

                                                <div className={styles.fieldRow}>
                                                    <label className={styles.fieldLabel}>
                                                        Signature<br />
                                                        (JPG, JPEG, PNG — white background only, max 1 MB) <span className={styles.requiredSymbol}>*</span>
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept=".jpg,.jpeg,.png"
                                                        name="signedFile"
                                                        onChange={handleDeclarationChange}
                                                    />
                                                    {declarationDetails.sign?.file?.name && (
                                                        <span className={styles.fileName}>
                                                            📄 {declarationDetails.sign.file.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>


                                )}
                                {/* ✅ Show comments + navigation buttons only AFTER Instructions */}
                                {currentPage !== 0 && (
                                    <div className="mt-4">
                                        {/* ===== LABEL ===== */}
                                        <label
                                            className={styles.fieldLabel}
                                            style={{
                                                marginBottom: "10px",
                                                marginTop: "50px",
                                                display: "flex",
                                                alignItems: "center",
                                                whiteSpace: "nowrap",
                                                fontSize: "20px",
                                                gap: "6px",
                                            }}
                                        >
                                            <span style={{ flexShrink: 0, fontWeight: 500 }}>Comments</span>
                                        </label>

                                        {/* ===== COMMENTS HISTORY TABLE ===== */}
                                        <table
                                            style={{
                                                width: "100%",
                                                borderCollapse: "collapse",
                                                border: "1px solid #ddd",
                                                marginBottom: "20px",
                                            }}
                                        >
                                            <thead style={{ backgroundColor: "#eee" }}>
                                                <tr>
                                                    <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", color: "#000", width: "20%" }}>S.No</th>
                                                    <th style={{ border: "1px solid #ddd", padding: "8px", color: "#000", width: "20%" }}>Date</th>
                                                    <th style={{ border: "1px solid #ddd", padding: "8px", color: "#000", width: "60%" }}>Comment</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {commentHistory[stepLabels[currentPage]] &&
                                                    commentHistory[stepLabels[currentPage]].length > 0 ? (
                                                    commentHistory[stepLabels[currentPage]].map((item, index) => (
                                                        <tr key={index}>
                                                            <td
                                                                style={{
                                                                    border: "1px solid #ddd",
                                                                    padding: "8px",
                                                                    textAlign: "center",
                                                                    color: "#000",
                                                                }}
                                                            >
                                                                {index + 1}
                                                            </td>
                                                            <td style={{ border: "1px solid #ddd", padding: "8px", color: "#000" }}>{item.comment}</td>

                                                            <td style={{ border: "1px solid #ddd", padding: "8px", color: "#000" }}>{item.commented_on}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4" style={{ textAlign: "center", padding: "10px", color: "#000" }}>
                                                            No comments yet for this step.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>

                                        {/* ===== NAVIGATION BUTTONS ===== */}
                                        <div
                                            className={styles.btnGroup}
                                            style={{
                                                display: "flex",
                                                justifyContent: currentPage === 0 ? "flex-end" : "space-between",
                                                marginTop: "20px",
                                            }}
                                        >
                                            {/* Previous button */}
                                            {currentPage > 0 && (
                                                <button
                                                    type="button"
                                                    onClick={prevPage}
                                                    style={{
                                                        backgroundColor: "#6c757d",
                                                        color: "white",
                                                        border: "none",
                                                        borderRadius: "6px",
                                                        padding: "8px 16px",
                                                        cursor: "pointer",
                                                        fontSize: "14px",
                                                    }}
                                                >
                                                    Previous
                                                </button>
                                            )}

                                            {/* Right-side buttons */}
                                            {rfqStatus !== 8 ? (
                                                <>
                                                    {currentPage < totalSteps - 1 ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => { switch (currentPage) { 
                                                                case 1: handleSubmitCompanyInfo(); 
                                                                break; 
                                                                case 2: handleSaveMsmeInfo(); 
                                                                break; 
                                                                case 3: handleSaveGstForm(); 
                                                                break; 
                                                                case 4: handleSaveBankDetails(); 
                                                                break; 
                                                                case 5: handleSaveDocuments(); 
                                                                break; 
                                                                default: nextPage(); } }}
                                                            style={{
                                                                backgroundColor: "#007bff",
                                                                color: "white",
                                                                border: "none",
                                                                borderRadius: "6px",
                                                                padding: "8px 16px",
                                                                cursor: "pointer",
                                                                fontSize: "14px",
                                                            }}
                                                        >
                                                            Save and Continue
                                                        </button>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={handleOpenModal}
                                                            style={{
                                                                backgroundColor: "#28a745",
                                                                color: "white",
                                                                border: "none",
                                                                borderRadius: "6px",
                                                                padding: "10px 22px",
                                                                cursor: "pointer",
                                                                fontSize: "15px",
                                                                fontWeight: "600",
                                                            }}
                                                        >
                                                            Review All
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                currentPage < totalSteps - 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={nextPage}
                                                        style={{
                                                            backgroundColor: "#6c757d",
                                                            color: "white",
                                                            border: "none",
                                                            borderRadius: "6px",
                                                            padding: "8px 16px",
                                                            cursor: "pointer",
                                                            fontSize: "14px",
                                                        }}
                                                    >
                                                        Next
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    </div>
                                )}



                                <Modal
                                    open={openConfirmModal}
                                    onClose={handleCloseModal}
                                    aria-labelledby="confirm-modal-title"
                                    aria-describedby="confirm-modal-description"
                                    className={styles.reviewModalOverlay}
                                >
                                    <Box className={styles.reviewModalWrapper}>

                                        <h2 className={styles.reviewModalTitle}>
                                            🧾 Review All Details Before Final Submission —{" "}
                                            {new Date().toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </h2>

                                        {/* BUSINESS ENTITY */}
                                        <Box className={styles.reviewSection}>
                                            <h3 className={styles.reviewSectionTitle}>1️⃣ Business Entity Details</h3>
                                            <table className={styles.reviewTable}>
                                                <tbody>
                                                    <tr><td>Full Registered Name</td><td>{companyInfo.full_registered_name}</td></tr>
                                                    <tr>
                                                        <td>Nature of Business Entity</td>
                                                        <td>{companyInfo?.business_entity_type || "Not Provided"}</td>
                                                    </tr>

                                                    {/* Registration Number visible ONLY when business type is chosen */}
                                                    {companyInfo?.business_entity_type && (
                                                        <tr>
                                                            <td>Registration Number</td>
                                                            <td>{companyInfo?.reg_number || "Not Provided"}</td>
                                                        </tr>
                                                    )}
                                                    {/* TAN Status */}
                                                    <tr>
                                                        <td>Do you have a TAN Number?</td>
                                                        <td>{tanStatus === "yes" ? "Yes" : "No"}</td>
                                                    </tr>

                                                    {/* TAN Number — Only if Yes */}
                                                    {tanStatus === "yes" && (
                                                        <tr>
                                                            <td>TAN Number</td>
                                                            <td>{companyInfo?.tan_number || "Not Provided"}</td>
                                                        </tr>
                                                    )}

                                                    {/* If No → show message */}
                                                    {tanStatus === "no" && (
                                                        <tr>
                                                            <td>TAN Requirement</td>
                                                            <td>Please upload your TDS Exemption Certificate in Step 5.</td>
                                                        </tr>
                                                    )}

                                                    {/* Trading Name */}
                                                    <tr>
                                                        <td>Trading Name</td>
                                                        <td>{companyInfo?.trading_name || "Not Provided"}</td>
                                                    </tr>

                                                    {/* Country Type */}
                                                    <tr>
                                                        <td>Country of Incorporation</td>
                                                        <td>{companyInfo?.country_type || "Not Provided"}</td>
                                                    </tr>

                                                    {/* If India → show dropdown country name */}
                                                    {companyInfo?.country_type === "India" && (
                                                        <tr>
                                                            <td>Country</td>
                                                            <td>
                                                                {countries.find(c => c.id == companyInfo?.country_id)?.country || "India"}
                                                            </td>
                                                        </tr>
                                                    )}

                                                    {/* Other Country Input */}
                                                    {companyInfo?.isOtherCountry && (
                                                        <>
                                                            <tr>
                                                                <td>Specify Country</td>
                                                                <td>{companyInfo?.country_text || "Not Provided"}</td>
                                                            </tr>
                                                            <tr>
                                                                <td>State / Province</td>
                                                                <td>{companyInfo?.state_text || "Not Provided"}</td>
                                                            </tr>
                                                        </>
                                                    )}

                                                    {/* State if India */}
                                                    {companyInfo?.country_type === "India" && !companyInfo?.isOtherCountry && (
                                                        <tr>
                                                            <td>State</td>
                                                            <td>
                                                                {states.find(s => s.id == companyInfo?.state_id)?.state || "Not Provided"}
                                                            </td>
                                                        </tr>
                                                    )}

                                                    {/* Telephone */}
                                                    <tr>
                                                        <td>Telephone Number</td>
                                                        <td>{companyInfo?.telephone || "Not Provided"}</td>
                                                    </tr>

                                                    {/* Registered Address */}
                                                    <tr>
                                                        <td>Registered Address</td>
                                                        <td>{companyInfo?.registered_address || "Not Provided"}</td>
                                                    </tr>

                                                    {/* Business Address */}
                                                    <tr>
                                                        <td>Business Address</td>
                                                        <td>{companyInfo?.business_address || "Not Provided"}</td>
                                                    </tr>

                                                    {/* Contact Person */}
                                                    <tr>
                                                        <td>Contact Person</td>
                                                        <td>
                                                            {(companyInfo?.contact_person_title || "") +
                                                                " " +
                                                                (companyInfo?.contact_person_name || "Not Provided")}
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <td>Contact Person Mobile</td>
                                                        <td>{companyInfo?.contact_person_mobile || "Not Provided"}</td>
                                                    </tr>

                                                    <tr>
                                                        <td>Contact Person Email</td>
                                                        <td>{companyInfo?.contact_person_email || "Not Provided"}</td>
                                                    </tr>

                                                    {/* Accounts Person */}
                                                    <tr>
                                                        <td>Accounts Person</td>
                                                        <td>
                                                            {(companyInfo?.accounts_person_title || "") +
                                                                " " +
                                                                (companyInfo?.accounts_person_name || "Not Provided")}
                                                        </td>
                                                    </tr>

                                                    <tr>
                                                        <td>Accounts Person Contact Number</td>
                                                        <td>{companyInfo?.accounts_person_contact_no || "Not Provided"}</td>
                                                    </tr>

                                                    <tr>
                                                        <td>Accounts Person Email</td>
                                                        <td>{companyInfo?.accounts_person_email || "Not Provided"}</td>
                                                    </tr>

                                                </tbody>
                                            </table>
                                        </Box>

                                        {/* ============================
    2. MSME DETAILS (Category always visible)
============================= */}
                                        <Box className={styles.reviewSection}>
                                            <h3 className={styles.reviewSectionTitle}>2️⃣ MSME Details</h3>

                                            <table className={styles.reviewTable}>
                                                <tbody>

                                                    {/* Always show this */}
                                                    <tr>
                                                        <td>Registered under MSME Act</td>
                                                        <td>{msmeInfo?.registered_under_msme === "true" ? "Yes" : "No"}</td>
                                                    </tr>

                                                    {/* Show Udyam Number only when YES */}
                                                    {msmeInfo?.registered_under_msme === "true" && (
                                                        <tr>
                                                            <td>Udyam Registration Number</td>
                                                            <td>{msmeInfo?.udyam_registration_number || "Not Provided"}</td>
                                                        </tr>
                                                    )}

                                                    {/* Category MUST ALWAYS SHOW (YES or NO) */}
                                                    <tr>
                                                        <td>Category (Micro/Small/Medium)</td>
                                                        <td>{msmeInfo?.category || "Not Provided"}</td>
                                                    </tr>

                                                </tbody>
                                            </table>
                                        </Box>

                                        {/* ============================================
   STEP 3 — GST & GOODS/SERVICES REVIEW SECTION
============================================= */}
                                        <Box className={styles.reviewSection}>
                                            <h3 className={styles.reviewSectionTitle}>3️⃣ GST & Goods/Services Information</h3>

                                            <table className={styles.reviewTable}>
                                                <tbody>

                                                    {/* Type of Counterparty */}
                                                    <tr>
                                                        <td>Type of Counterparty Business</td>
                                                        <td>
                                                            {goodsServices.type_of_counterparty}
                                                            {goodsServices.type_of_counterparty === "Others" &&
                                                                goodsServices.others &&
                                                                ` — ${goodsServices.others}`}
                                                        </td>
                                                    </tr>

                                                    {/* Type of Supplies (Goods / Services / Both) */}
                                                    <tr>
                                                        <td>Details of Supplies Type</td>
                                                        <td>{goodsServices.type || "Not Provided"}</td>
                                                    </tr>

                                                    {/* ===================== GOODS ONLY ===================== */}
                                                    {goodsServices.type === "Goods" &&
                                                        goods.some(g => g !== "") && (
                                                            <tr>
                                                                <td>Goods</td>
                                                                <td>
                                                                    <ul style={{ margin: 0, paddingLeft: "18px" }}>
                                                                        {goods.filter(g => g !== "").map((g, i) => (
                                                                            <li key={i}>{g}</li>
                                                                        ))}
                                                                    </ul>
                                                                </td>
                                                            </tr>
                                                        )}

                                                    {/* ===================== SERVICES ONLY ===================== */}
                                                    {goodsServices.type === "Services" &&
                                                        services.some(s => s !== "") && (
                                                            <tr>
                                                                <td>Services</td>
                                                                <td>
                                                                    <ul style={{ margin: 0, paddingLeft: "18px" }}>
                                                                        {services.filter(s => s !== "").map((s, i) => (
                                                                            <li key={i}>{s}</li>
                                                                        ))}
                                                                    </ul>
                                                                </td>
                                                            </tr>
                                                        )}

                                                    {/* ===================== GOODS & SERVICES BOTH ===================== */}
                                                    {goodsServices.type === "Goods and Services" &&
                                                        goodsAndServices.some(item => item.goods || item.services) && (
                                                            <tr>
                                                                <td>Goods & Services</td>
                                                                <td>
                                                                    <ul style={{ margin: 0, paddingLeft: "18px" }}>
                                                                        {goodsAndServices.map((item, i) => {
                                                                            if (!item.goods && !item.services) return null;
                                                                            return (
                                                                                <li key={i}>
                                                                                    {item.goods && <b>Goods:</b>} {item.goods || ""}
                                                                                    {item.services && (
                                                                                        <>
                                                                                            {" | "}
                                                                                            <b>Service:</b> {item.services}
                                                                                        </>
                                                                                    )}
                                                                                </li>
                                                                            );
                                                                        })}
                                                                    </ul>
                                                                </td>
                                                            </tr>
                                                        )}

                                                    {/* GST Applicable */}
                                                    <tr>
                                                        <td>Is GST Applicable?</td>
                                                        <td>{gstApplicable === "true" ? "Yes" : "No"}</td>
                                                    </tr>

                                                    {/* ====================== GST YES DETAILS ======================= */}
                                                    {gstApplicable === "true" && (
                                                        <>
                                                            {/* Number of GST Registrations */}
                                                            <tr>
                                                                <td>Number of GST Registrations</td>
                                                                <td>{count}</td>
                                                            </tr>

                                                            {/* List all GST registration entries */}
                                                            {gstformData.map((item, i) => (
                                                                <tr key={i}>
                                                                    <td>Registration {i + 1}</td>
                                                                    <td>
                                                                        <div><b>State:</b> {states.find(s => s.id == item.state)?.state || "-"}</div>
                                                                        <div><b>GSTIN:</b> {item.gstNumber}</div>
                                                                    </td>
                                                                </tr>
                                                            ))}

                                                            {/* Registration Type */}
                                                            <tr>
                                                                <td>Registration Type</td>
                                                                <td>{gstMeta.reg_type}</td>
                                                            </tr>

                                                            {/* GSTR Filing Type */}
                                                            <tr>
                                                                <td>GSTR Filing Type</td>
                                                                <td>{gstMeta.gstr_filling_type}</td>
                                                            </tr>
                                                        </>
                                                    )}

                                                </tbody>
                                            </table>

                                            {/* ============================== Income Tax Details ============================== */}
                                            <h3 className={styles.reviewSectionTitle} style={{ marginTop: "20px" }}>Income Tax Details</h3>

                                            <table className={styles.reviewTable}>
                                                <thead>
                                                    <tr>
                                                        <th>Particulars</th>
                                                        <th>Financial Year - I</th>
                                                        <th>Financial Year - II</th>
                                                    </tr>
                                                </thead>

                                                <tbody>
                                                    <tr>
                                                        <td>Financial Year</td>
                                                        <td>{formData.fy1}</td>
                                                        <td>{formData.fy2}</td>
                                                    </tr>

                                                    <tr>
                                                        <td>Currency Type</td>
                                                        <td>{formData.currencyType1}</td>
                                                        <td>{formData.currencyType2}</td>
                                                    </tr>

                                                    {(formData.currencyType1 === "Others" || formData.currencyType2 === "Others") && (
                                                        <tr>
                                                            <td>Currency Name</td>
                                                            <td>{formData.currencyType1 === "Others" ? formData.currencyName1 : "-"}</td>
                                                            <td>{formData.currencyType2 === "Others" ? formData.currencyName2 : "-"}</td>
                                                        </tr>
                                                    )}

                                                    <tr>
                                                        <td>Turnover</td>
                                                        <td>{formData.turnover1}</td>
                                                        <td>{formData.turnover2}</td>
                                                    </tr>

                                                    <tr>
                                                        <td>ITR Filed (Yes/No)</td>
                                                        <td>{formData.itrStatus1 === "true" ? "Yes" : "No"}</td>
                                                        <td>{formData.itrStatus2 === "true" ? "Yes" : "No"}</td>
                                                    </tr>

                                                    {(formData.itrStatus1 === "true" || formData.itrStatus2 === "true") && (
                                                        <>
                                                            <tr>
                                                                <td>ITR Acknowledgment No.</td>
                                                                <td>{formData.itrStatus1 === "true" ? formData.ackNo1 : "-"}</td>
                                                                <td>{formData.itrStatus2 === "true" ? formData.ackNo2 : "-"}</td>
                                                            </tr>

                                                            <tr>
                                                                <td>ITR Filed Date</td>
                                                                <td>
                                                                    {formData.itrStatus1 === "true"
                                                                        ? `${formData.itrDay1}/${formData.itrMonth1}/${formData.itrYear1}`
                                                                        : "-"}
                                                                </td>
                                                                <td>
                                                                    {formData.itrStatus2 === "true"
                                                                        ? `${formData.itrDay2}/${formData.itrMonth2}/${formData.itrYear2}`
                                                                        : "-"}
                                                                </td>
                                                            </tr>
                                                        </>
                                                    )}
                                                </tbody>
                                            </table>
                                        </Box>


                                        {/* =====================================================
    STEP 4 — BANKING INFORMATION (Review Modal)
===================================================== */}
                                        <Box className={styles.reviewSection}>
                                            <h3 className={styles.reviewSectionTitle}>4️⃣ Banking Information</h3>

                                            <table className={styles.reviewTable}>
                                                <tbody>

                                                    {/* Account Holder Name */}
                                                    <tr>
                                                        <td>Account Holder’s Name</td>
                                                        <td>{bankInfo.account_holder_name || "Not Provided"}</td>
                                                    </tr>

                                                    {/* Bank Name */}
                                                    <tr>
                                                        <td>Bank Name</td>
                                                        <td>{bankInfo.bank_name || "Not Provided"}</td>
                                                    </tr>

                                                    {/* Bank Address */}
                                                    <tr>
                                                        <td>Bank Address</td>
                                                        <td>{bankInfo.bank_address || "Not Provided"}</td>
                                                    </tr>

                                                    {/* Transaction Type */}
                                                    <tr>
                                                        <td>Transaction Type</td>
                                                        <td>{bankInfo.transaction_type || "Not Provided"}</td>
                                                    </tr>

                                                    {/* Country */}
                                                    <tr>
                                                        <td>Bank Country</td>
                                                        <td>{bankInfo.country_type || "Not Provided"}</td>
                                                    </tr>

                                                    {/* If country == India → show dropdown country */}
                                                    {bankInfo.country_type === "India" && (
                                                        <tr>
                                                            <td>Country</td>
                                                            <td>
                                                                {countries.find(c => c.id == bankInfo.country_id)?.country || "India"}
                                                            </td>
                                                        </tr>
                                                    )}

                                                    {/* If Other Country */}
                                                    {bankInfo.country_type === "Others" && (
                                                        <>
                                                            <tr>
                                                                <td>Specify Country</td>
                                                                <td>{bankInfo.country_text || "Not Provided"}</td>
                                                            </tr>

                                                            <tr>
                                                                <td>State / Province</td>
                                                                <td>{bankInfo.state_text || "Not Provided"}</td>
                                                            </tr>
                                                        </>
                                                    )}

                                                    {/* If India → show State Dropdown */}
                                                    {bankInfo.country_type === "India" && (
                                                        <tr>
                                                            <td>State</td>
                                                            <td>
                                                                {states.find(s => s.id == bankInfo.state_id)?.state || "Not Provided"}
                                                            </td>
                                                        </tr>
                                                    )}

                                                    {/* Account Number */}
                                                    <tr>
                                                        <td>Account Number</td>
                                                        <td>{bankInfo.account_number || "Not Provided"}</td>
                                                    </tr>

                                                    {/* IFSC — only if domestic or both */}
                                                    {(bankInfo.transaction_type === "Domestic" ||
                                                        bankInfo.transaction_type === "Domestic and International") && (
                                                            <tr>
                                                                <td>IFSC Code</td>
                                                                <td>{bankInfo.ifsc_code || "Not Provided"}</td>
                                                            </tr>
                                                        )}

                                                    {/* SWIFT — only if international or both */}
                                                    {(bankInfo.transaction_type === "International" ||
                                                        bankInfo.transaction_type === "Domestic and International") && (
                                                            <tr>
                                                                <td>SWIFT Code</td>
                                                                <td>{bankInfo.swift_code || "Not Provided"}</td>
                                                            </tr>
                                                        )}

                                                    {/* Beneficiary Name */}
                                                    <tr>
                                                        <td>Beneficiary Name</td>
                                                        <td>{bankInfo.beneficiary_name || "Not Provided"}</td>
                                                    </tr>

                                                </tbody>
                                            </table>
                                        </Box>


                                        <Box className={styles.reviewSection}>
                                            <h3 className={styles.reviewSectionTitle}>5️⃣ Documents Uploaded</h3>

                                            <table className={styles.reviewTable}>
                                                <tbody>

                                                    {/* PAN */}
                                                    <tr>
                                                        <td>PAN</td>
                                                        <td>
                                                            {documents.pan?.fileName ? (
                                                                <>
                                                                    📄 {documents.pan.fileName} —
                                                                    <a
                                                                        href={documents.pan.url?.startsWith("blob:")
                                                                            ? documents.pan.url
                                                                            : `${process.env.REACT_APP_API_BASE_URL}/${documents.pan.url}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className={styles.reviewViewLink}
                                                                    >
                                                                        View
                                                                    </a>
                                                                </>
                                                            ) : "Not Uploaded"}
                                                        </td>
                                                    </tr>

                                                    {/* GST Available */}
                                                    <tr>
                                                        <td>GSTIN Available</td>
                                                        <td>{documents.gst_available === "true" ? "Yes" : "No"}</td>
                                                    </tr>

                                                    {/* GST Document — only if Yes */}
                                                    {documents.gst_available === "true" && (
                                                        <tr>
                                                            <td>GST Certificate</td>
                                                            <td>
                                                                {documents.gst?.fileName ? (
                                                                    <>
                                                                        📄 {documents.gst.fileName} —
                                                                        <a
                                                                            href={documents.gst.url?.startsWith("blob:")
                                                                                ? documents.gst.url
                                                                                : `${process.env.REACT_APP_API_BASE_URL}/${documents.gst.url}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className={styles.reviewViewLink}
                                                                        >
                                                                            View
                                                                        </a>
                                                                    </>
                                                                ) : "Not Uploaded"}
                                                            </td>
                                                        </tr>
                                                    )}

                                                    {/* MSME Registered */}
                                                    <tr>
                                                        <td>Registered under MSME</td>
                                                        <td>{msmeInfo.registered_under_msme === "true" ? "Yes" : "No"}</td>
                                                    </tr>

                                                    {/* MSME Certificate — only if Yes */}
                                                    {msmeInfo.registered_under_msme === "true" && (
                                                        <tr>
                                                            <td>MSME Certificate</td>
                                                            <td>
                                                                {documents.msme?.fileName ? (
                                                                    <>
                                                                        📄 {documents.msme.fileName} —
                                                                        <a
                                                                            href={documents.msme.url?.startsWith("blob:")
                                                                                ? documents.msme.url
                                                                                : `${process.env.REACT_APP_API_BASE_URL}/${documents.msme.url}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className={styles.reviewViewLink}
                                                                        >
                                                                            View
                                                                        </a>
                                                                    </>
                                                                ) : "Not Uploaded"}
                                                            </td>
                                                        </tr>
                                                    )}

                                                    {/* Cancelled Cheque */}
                                                    <tr>
                                                        <td>Cancelled Cheque</td>
                                                        <td>
                                                            {documents.cheque?.fileName ? (
                                                                <>
                                                                    📄 {documents.cheque.fileName} —
                                                                    <a
                                                                        href={documents.cheque.url?.startsWith("blob:")
                                                                            ? documents.cheque.url
                                                                            : `${process.env.REACT_APP_API_BASE_URL}/${documents.cheque.url}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className={styles.reviewViewLink}
                                                                    >
                                                                        View
                                                                    </a>
                                                                </>
                                                            ) : "Not Uploaded"}
                                                        </td>
                                                    </tr>

                                                    {/* TAN Certificate / Exemption */}
                                                    <tr>
                                                        <td>{tanStatus === "yes" ? "TAN Certificate" : "TAN Exemption Certificate"}</td>
                                                        <td>
                                                            {tanStatus === "yes" ? (
                                                                documents.tanCertificate?.fileName ? (
                                                                    <>
                                                                        📄 {documents.tanCertificate.fileName} —
                                                                        <a
                                                                            href={documents.tanCertificate.url?.startsWith("blob:")
                                                                                ? documents.tanCertificate.url
                                                                                : `${process.env.REACT_APP_API_BASE_URL}/${documents.tanCertificate.url}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className={styles.reviewViewLink}
                                                                        >
                                                                            View
                                                                        </a>
                                                                    </>
                                                                ) : (
                                                                    "Not Uploaded"
                                                                )
                                                            ) : (
                                                                documents.tanExemption?.fileName ? (
                                                                    <>
                                                                        📄 {documents.tanExemption.fileName} —
                                                                        <a
                                                                            href={documents.tanExemption.url?.startsWith("blob:")
                                                                                ? documents.tanExemption.url
                                                                                : `${process.env.REACT_APP_API_BASE_URL}/${documents.tanExemption.url}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className={styles.reviewViewLink}
                                                                        >
                                                                            View
                                                                        </a>
                                                                    </>
                                                                ) : (
                                                                    "Not Uploaded"
                                                                )
                                                            )}
                                                        </td>
                                                    </tr>

                                                    {/* Incorporation Certificate */}
                                                    <tr>
                                                        <td>Registration / Incorporation Certificate</td>
                                                        <td>
                                                            {documents.incorporation?.fileName ? (
                                                                <>
                                                                    📄 {documents.incorporation.fileName} —
                                                                    <a
                                                                        href={documents.incorporation.url?.startsWith("blob:")
                                                                            ? documents.incorporation.url
                                                                            : `${process.env.REACT_APP_API_BASE_URL}/${documents.incorporation.url}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className={styles.reviewViewLink}
                                                                    >
                                                                        View
                                                                    </a>
                                                                </>
                                                            ) : "Not Uploaded"}
                                                        </td>
                                                    </tr>

                                                    {/* TDS Declaration */}
                                                    <tr>
                                                        <td>TDS Declaration Submitted</td>
                                                        <td>{documents.tds_declaration === "true" ? "Yes" : "No"}</td>
                                                    </tr>

                                                    {/* TDS Document — only if Yes */}
                                                    {documents.tds_declaration === "true" && (
                                                        <tr>
                                                            <td>TDS Declaration Document</td>
                                                            <td>
                                                                {documents.tds?.fileName ? (
                                                                    <>
                                                                        📄 {documents.tds.fileName} —
                                                                        <a
                                                                            href={documents.tds.url?.startsWith("blob:")
                                                                                ? documents.tds.url
                                                                                : `${process.env.REACT_APP_API_BASE_URL}/${documents.tds.url}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className={styles.reviewViewLink}
                                                                        >
                                                                            View
                                                                        </a>
                                                                    </>
                                                                ) : "Not Uploaded"}
                                                            </td>
                                                        </tr>
                                                    )}

                                                </tbody>
                                            </table>
                                        </Box>

                                        {/* =====================================================
    STEP 6 — DECLARATION & ACKNOWLEDGEMENT (Review Modal)
===================================================== */}
                                        <Box className={styles.reviewSection}>
                                            <h3 className={styles.reviewSectionTitle}>6️⃣ Declaration & Acknowledgement</h3>

                                            <table className={styles.reviewTable}>
                                                <tbody>

                                                    {/* Vendor Declaration */}
                                                    <tr>
                                                        <td>Declarant Name</td>
                                                        <td>{vendorDeclarationInfo?.name || "Not Provided"}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Organization</td>
                                                        <td>{vendorDeclarationInfo?.organization || "Not Provided"}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Designation</td>
                                                        <td>{vendorDeclarationInfo?.designation || "Not Provided"}</td>
                                                    </tr>

                                                    {/* Country Party Declaration */}
                                                    <tr>
                                                        <td>Country Party — Name</td>
                                                        <td>{countryPartyInfo?.name || "Not Provided"}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Country Party — Country</td>
                                                        <td>{countryPartyInfo?.country || "Not Provided"}</td>
                                                    </tr>
                                                    <tr>
                                                        <td>Country Party — Designation</td>
                                                        <td>{countryPartyInfo?.designation || "Not Provided"}</td>
                                                    </tr>

                                                    {/* Show these fields only when BOTH agreed */}
                                                    {(isDeclarationChecked && isCountryPartyChecked) && (
                                                        <>
                                                            {/* Place */}
                                                            <tr>
                                                                <td>Place</td>
                                                                <td>{declarationDetails?.place || "Not Provided"}</td>
                                                            </tr>

                                                            {/* Date */}
                                                            <tr>
                                                                <td>Date</td>
                                                                <td>
                                                                    {declarationDetails?.date
                                                                        ? declarationDetails.date
                                                                        : new Date().toISOString().slice(0, 10)}
                                                                </td>
                                                            </tr>

                                                            {/* Signature File */}
                                                            <tr>
                                                                <td>Signature (White Background)</td>
                                                                <td>
                                                                    {declarationDetails?.sign?.file?.name ? (
                                                                        <>
                                                                            📄 {declarationDetails.sign.file.name}
                                                                            {declarationDetails.sign?.url && (
                                                                                <>
                                                                                    {" "}
                                                                                    —{" "}
                                                                                    <a
                                                                                        href={declarationDetails.sign.url.startsWith("blob:")
                                                                                            ? declarationDetails.sign.url
                                                                                            : `${process.env.REACT_APP_API_BASE_URL}/${declarationDetails.sign.url}`}
                                                                                        target="_blank"
                                                                                        rel="noopener noreferrer"
                                                                                        className={styles.reviewViewLink}
                                                                                    >
                                                                                        View
                                                                                    </a>
                                                                                </>
                                                                            )}
                                                                        </>
                                                                    ) : (
                                                                        "Not Uploaded"
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        </>
                                                    )}

                                                </tbody>
                                            </table>
                                        </Box>


                                        {/* ACTION BUTTONS */}
                                        <Box className={styles.reviewActions}>
                                            <Button className={styles.reviewBtnConfirm} onClick={handleFinalSubmit}>
                                                Confirm & Submit
                                            </Button>

                                            <Button className={styles.reviewBtnCancel} onClick={handleCloseModal}>
                                                Go Back
                                            </Button>
                                        </Box>

                                    </Box>
                                </Modal>




                            </>

                        </form>



                    </div>
                </div>
            </div>


        </Box>
    );
};



export default VmsRequest;