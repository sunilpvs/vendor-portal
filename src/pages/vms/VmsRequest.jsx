import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import Header from "../../components/Header";
import styles from "./vms.module.css";
import { Modal, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { addCompanyInfo, addCounterParty, getCompanyInfo, getCounterPartyInfo } from "../../services/vms/counterPartyService";
import { addMsmeDetails, getMsmeDetails } from "../../services/vms/msmeService";
import { addBankDetails, addComplianceDetails, getBankDetails } from "../../services/vms/bankDetailsService";
import { addFinancialDetails, addGoodsAndServices, addGstDetails, addGstRegistrations, addIncomeTaxDetails, addNatureOfBusiness, getGoodsAndServices, getGstDetails, getGstRegistrations, getIncomeTaxDetails } from "../../services/vms/gstService";
import { addDocuments, getDocumentDetails } from "../../services/vms/documentService";

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
    const [gstNotApplicable, setGstNotApplicable] = useState(false);




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

    const handleDocumentChange = (key, file) => {
        if (!validateFile(file)) return; // ✅ Stop if invalid

        // Your existing logic to update state
        setDocuments((prevDocs) => ({
            ...prevDocs,
            [key]: {
                file,
                fileName: file.name,
                url: URL.createObjectURL(file),
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





    const handleDeclarationChange = (e) => {
        const { name, type, files, value } = e.target;

        if (type === "file") {
            const file = files[0];
            if (!file) return; // user canceled file picker

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







    // Step 1: Company Info
    const [companyInfo, setCompanyInfo] = useState({
        full_registered_name: "",
        business_entity_type: "",
        trading_name: "",
        company_email: "",
        telephone: "",
        registered_address: "",
        business_address: "",
        contact_person_name: "",
        contact_person_email: "",
        contact_person_mobile: "",
        website: "",
        country_of_incorporation: "",
        trade_license_number: "",
        cin_number: "",
        pan_number: "",
        tan_number: "",
        gst_vat_number: "",
        accounts_person_name: "",
        accounts_person_contact_no: "",
        accounts_person_email: "",
        reg_number: "", // Dynamic based on business entity type
    });
    const isIndia = countries.find(c => c.id == companyInfo.country_of_incorporation)?.country?.toLowerCase() === "india";


    const selectedEntityType = companyInfo.business_entity_type;
    const showFullCompanyFields = companyTypesRequiringFullDetails.includes(selectedEntityType);
    const showBasicRegistrationField = entitiesRequiringBasicRegistration.includes(selectedEntityType);

    // 🟢 Auto-set India for Sole Proprietorship or Partnership
    useEffect(() => {
        if (["Sole Proprietorship", "Partnership"].includes(companyInfo.business_entity_type)) {
            const india = countries.find(
                (c) => c.country?.toLowerCase() === "india"
            );

            if (india && companyInfo.country_of_incorporation !== india.id) {
                setCompanyInfo((prev) => ({
                    ...prev,
                    country_of_incorporation: india.id,
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
                    trading_name: data.trading_name || "",
                    company_email: data.company_email || "",
                    telephone: data.telephone || "",
                    registered_address: data.registered_address || "",
                    business_address: data.business_address || "",
                    contact_person_name: data.contact_person_name || "",
                    contact_person_email: data.contact_person_email || "",
                    contact_person_mobile: data.contact_person_mobile || "",
                    website: data.website || "",
                    country_of_incorporation: data.country_id || "", //  use ID for dropdown
                    state: data.state_id,
                    trade_license_number: data.trade_license_number || "",
                    cin_number: data.cin_number || "",
                    pan_number: data.pan_number || "",
                    tan_number: data.tan_number || "",
                    gst_vat_number: data.gst_vat_number || "",
                    accounts_person_name: data.accounts_person_name || "",
                    accounts_person_contact_no: data.accounts_person_contact_no || "",
                    accounts_person_email: data.accounts_person_email || "",
                    reg_number: data.reg_number || "",
                };

                setCompanyInfo((prev) => ({ ...prev, ...normalized }));
            } catch (error) {
                console.error("Error fetching company info:", error);
            }
        };

        if (referenceId) fetchCompanyInfo();
    }, [referenceId]);




    const handleSubmitCompanyInfo = async (e) => {

        try {
            const tanFormData = new FormData();
            tanFormData.append("reference_id", referenceId);
            tanFormData.append("tan_number", hasTan === "Yes" ? companyInfo.tan_number : "");
            if (hasTan === "No" && tanExemptionFile) {
                tanFormData.append("tan_exemption_certificate", tanExemptionFile);
            }

            await addCompanyInfo(referenceId, tanFormData);

            toast.success("Company information added successfully!");
            nextPage();
        } catch (error) {
            console.error("Error adding company info:", error);
            toast.error("Error occurred while saving company information.");
        }

        // If CIN exists, ensure it's exactly 21 alphanumeric chars
        if (companyInfo.cin_number) {
            if (!/^[A-Z0-9]{21}$/.test(companyInfo.cin_number)) {
                toast.error("CIN must be exactly 21 alphanumeric characters (A–Z, 0–9).");
                return;
            }
        }


        try {
            // Send companyInfo state as payload
            const response = await addCompanyInfo(referenceId, companyInfo);

            if (response.status === 200 || response.status === 201) {
                toast.success("Company information added successfully!");
                nextPage();
            } else {
                toast.error("Failed to add company information. Please try again.");
                nextPage();
            }
        } catch (error) {
            console.error("Error adding counterparty info:", error);
            toast.error("Error occurred while saving company information.");
            nextPage();
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


    const handleCompanyInfoChange = (e) => {
        const { name, value } = e.target;
        let cleaned = value;

        // Name fields — only letters and spaces, uppercase
        const nameFields = [
            "full_registered_name",
            "trading_name",
            "contact_person_name",
            "accounts_person_name",
        ];

        if (nameFields.includes(name)) {
            // remove anything that's not A-Z or space, then uppercase
            cleaned = value.replace(/[^A-Za-z\s]/g, "").toUpperCase();
        }
        // CIN — uppercase alphanumeric, max 21 chars
        else if (name === "cin_number") {
            cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 21);
        }
        // TAN / PAN / GST / REG / UDYAM — uppercase alphanumeric
        else if (["tan_number", "pan_number", "gst_vat_number", "reg_number", "udyam_registration_number"].includes(name)) {
            cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
        }
        // Addresses — keep as typed
        else if (["registered_address", "business_address", "bank_address"].includes(name)) {
            cleaned = value;
        }
        // Emails — lowercase
        else if (name.includes("email")) {
            cleaned = value.toLowerCase();
        }
        // Phones — digits only
        else if (["telephone", "contact_person_mobile", "accounts_person_contact_no"].includes(name)) {
            cleaned = value.replace(/[^0-9]/g, "");
        }
        // Dropdowns / other allowed fields — keep
        else if ([
            "business_entity_type",
            "country_of_incorporation",
            "state",
            "contact_person_title",
            "accounts_person_title",
        ].includes(name)) {
            cleaned = value;
        }
        // default fallback — uppercase
        else {
            cleaned = value.toUpperCase();
        }

        setCompanyInfo((prev) => ({
            ...prev,
            [name]: cleaned,
        }));

        // keep country autofill logic intact
        if (name === "country_of_incorporation") {
            const selectedCountry = countries.find((c) => c.id == value);
            if (selectedCountry) {
                setCountryCode(selectedCountry.code || "");
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

    const handleSaveMsmeInfo = async () => {
        try {

            const msmePayload = {
                type: "msme",
                registered_under_msme: msmeInfo.registered_under_msme === "true",
                udyam_registration_number: msmeInfo.udyam_registration_number,
                category: msmeInfo.category,
            };

            await addMsmeDetails(referenceId, msmePayload); // vendor_id hardcoded as 3 (replace with dynamic)
            toast.success("MSME Details saved successfully!");
            nextPage();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Failed to save Step 2");
        }
    };


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

    const [goodsServices, setGoodsServices] = useState({
        type_of_counterparty: "",
        others: "",
        items: [],
        type: "",
        description: "",
    });

    const [gstMeta, setGstMeta] = useState({
        reg_type: "",
        periodicity_gstr1: "",
    });


    const [incomeTaxDetails, setIncomeTaxDetails] = useState({
        fin_year: "",
        turnover: "",
        status_of_itr: "",
        itr_ack_num: "",
        itr_filed_date: "",
    });

    // get goods and services
    useEffect(() => {
        const fetchGoodsAndServices = async () => {
            try {
                const response = await getGoodsAndServices(referenceId);
                const data = response?.data;

                if (data && data.length > 0) {
                    // Extract top-level info (shared for all)
                    const type_of_counterparty = data[0].type_of_counterparty || "";
                    const others = data[0].others || "";

                    // Separate by type
                    const goodsList = data
                        .filter(item => item.type === "Goods")
                        .map(item => item.description || "");

                    const servicesList = data
                        .filter(item => item.type === "Services")
                        .map(item => item.description || "");

                    const goodsAndServicesList = data
                        .filter(item => item.type === "Goods and Services")
                        .map(item => {
                            const [goodsPart, servicesPart] = (item.description || "").split("&").map(str => str.trim());
                            return { goods: goodsPart || "", services: servicesPart || "" };
                        });

                    setGoods(goodsList);
                    setServices(servicesList);
                    setGoodsAndServices(goodsAndServicesList);

                    setGoodsServices({
                        type_of_counterparty,
                        others,
                        items: data.map(item => ({
                            type: item.type || "",
                            description: item.description || ""
                        }))
                    });
                }
            } catch (error) {
                console.error("Error fetching Goods and Services:", error);
            }
        };

        if (referenceId) fetchGoodsAndServices();
    }, [referenceId]);

    // get gst registrations
    useEffect(() => {
        const fetchGstRegistrations = async () => {
            try {
                const response = await getGstRegistrations(referenceId);
                const data = response?.data;
                if (data && data.length > 0) {
                    setgstFormData(data.map(item => ({
                        state: item.state || "",
                        gstNumber: item.gst_number || "",
                        regDate: item.reg_date || "",
                    })));
                    setGstMeta({
                        reg_type: data[0].reg_type || "",
                        periodicity_gstr1: data[0].periodicity_gstr1 || "",
                    });
                    setCount(data.length);
                }
            } catch (error) {
                console.error("Error fetching GST Registrations:", error);
            }
        };

        if (referenceId) fetchGstRegistrations();
    }, [referenceId]);


    // get income tax details


    useEffect(() => {
        const fetchIncomeTaxDetails = async () => {
            try {
                const response = await getIncomeTaxDetails(referenceId);
                const data = response?.data;

                if (data && data.length > 0) {
                    // Sort by year if needed, or assume API gives correct order
                    const details = data.slice(0, 3); // limit to 3 FYs

                    setFormData({
                        fy1: details[0]?.fin_year || "",
                        fy2: details[1]?.fin_year || "",


                        turnover1: details[0]?.turnover || "",
                        turnover2: details[1]?.turnover || "",


                        itrStatus1: details[0]?.status_of_itr || "",
                        itrStatus2: details[1]?.status_of_itr || "",


                        ackNo1: details[0]?.itr_ack_num || "",
                        ackNo2: details[1]?.itr_ack_num || "",


                        filedDate1: details[0]?.itr_filed_date || "",
                        filedDate2: details[1]?.itr_filed_date || "",

                    });
                }
            } catch (error) {
                console.error("Error fetching Income Tax Details:", error);
            }
        };

        if (referenceId) fetchIncomeTaxDetails();
    }, [referenceId]);




    // save goods and services
    const handleSaveGoodsServices = async () => {


        try {
            // Combine all goods/services entries
            const items = [
                ...goods.map(g => ({ type: "Goods", description: g })),
                ...services.map(s => ({ type: "Services", description: s })),
                ...goodsAndServices.map(gs => ({
                    type: "Goods and Services",
                    description: `${gs.goods}${gs.goods && gs.services ? " & " : ""}${gs.services}` || ""
                }))
            ];

            let payload = {
                type_of_counterparty: goodsServices.type_of_counterparty || "",
                others: goodsServices.others || null,
                items
            };

            // Validate
            const hasValidItems = items.some(i => i.type && i.description);
            if (!payload.type_of_counterparty || !hasValidItems) {
                toast.error("Type of counterparty and at least one valid goods/service are required.");
                return false;
            }

            await addGoodsAndServices(referenceId, payload);
            toast.success("Goods & Services saved successfully!");
            return true;

        } catch (error) {
            console.error("Error saving Goods/Services:", error);
            toast.error("Failed to save Goods & Services.");
            return false;
        }
    };

    // save gst registrations
    const handleSaveGstRegistrations = async () => {


        try {
            const payload = {
                items: gstformData.map(entry => ({
                    state: entry.state || "",
                    gst_number: entry.gstNumber || "",
                    reg_date: entry.regDate || "",
                })),
                reg_type: gstMeta.reg_type,
                periodicity_gstr1: gstMeta.periodicity_gstr1,
            };

            await addGstRegistrations(referenceId, payload);

            toast.success("GST Registrations saved successfully!");
            return true;
        } catch (error) {
            console.error("Error saving GST Registrations:", error);
            toast.error("Failed to save GST Registrations.");
            return false;
        }
    };

    // save income tax details
    const handleSaveIncomeTaxDetails = async () => {

        try {
            // Prepare payload for all 3 years
            const payload = [1, 2, 3]
                .map(i => ({
                    fin_year: formData[`fy${i}`] || "",
                    turnover: formData[`turnover${i}`] || "",
                    status_of_itr: formData[`itrStatus${i}`] || "",
                    itr_ack_num: formData[`ackNo${i}`] || "",
                    itr_filed_date: formData[`filedDate${i}`] || "",
                }))
                .filter(entry => entry.fin_year); // only include filled rows

            if (payload.length === 0) {
                toast.error("Please fill at least one year's data before saving.");
                return false;
            }

            await addIncomeTaxDetails(referenceId, { items: payload });

            toast.success("Income Tax Details saved successfully!");
            return true;
        } catch (error) {
            console.error("Error saving Income Tax Details:", error);
            toast.error("Failed to save Income Tax Details.");
            return false;
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
                    setGoodsAndServices([
                        { goods: "", services: "" },
                        { goods: "", services: "" },
                        { goods: "", services: "" },
                        { goods: "", services: "" },
                        { goods: "", services: "" },
                    ]);
                }
            }

            // ✅ When user switches away from "Goods and Services", clear the list
            if (name === "type" && cleaned !== "Goods and Services") {
                setGoodsAndServices([]);
            }
        }
    };

    const handleSaveGstForm = async () => {

        const goodsServicesSaved = await handleSaveGoodsServices();
        if (!goodsServicesSaved) return;
        const gstRegistrationsSaved = await handleSaveGstRegistrations();
        if (!gstRegistrationsSaved) return;
        const incomeTaxDetailsSaved = await handleSaveIncomeTaxDetails();
        if (!incomeTaxDetailsSaved) return;
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
        country: "",
        account_number: "",
        ifsc_code: "",
        swift_code: "",
        beneficiary_name: "",
        involves_third_party: null,
        subcontractor_in_sanctioned_country: null,
    });

    useEffect(() => {
        const fetchBankDetails = async () => {
            try {
                const response = await getBankDetails(referenceId);

                if (response?.data?.bank && response?.data?.compliance) {
                    const compliance = response.data.compliance;

                    setBankInfo((prev) => ({
                        ...prev,
                        ...response.data.bank,
                        involves_third_party:
                            compliance.involves_third_party === 1 ||
                                compliance.involves_third_party === true
                                ? "true"
                                : "false",
                        subcontractor_in_sanctioned_country:
                            compliance.subcontractor_in_sanctioned_country === 1 ||
                                compliance.subcontractor_in_sanctioned_country === true
                                ? "true"
                                : "false",
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch bank and compliance details:", err);
            }
        };

        fetchBankDetails();
    }, [referenceId]);

    const handleBankDetailsChange = (e) => {
        const { name, value } = e.target;
        let cleaned = value;

        // 🏦 Account Holder / Beneficiary / Bank / Branch — only letters + spaces, uppercase
        if (["account_holder_name", "beneficiary_name", "bank_name", "branch_name"].includes(name)) {
            cleaned = value.replace(/[^A-Za-z\s]/g, "").toUpperCase();
        }

        // 💳 Account Number — digits only
        else if (name === "account_number") {
            cleaned = value.replace(/[^0-9]/g, "");
        }

        // 🔠 IFSC / SWIFT Codes — uppercase alphanumeric (no limit)
        else if (["ifscCode", "swiftCode"].includes(name)) {
            cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
        }

        // 🏠 Bank Address — keep as typed (case-sensitive)
        else if (name === "bank_address") {
            cleaned = value;
        }

        // 🌍 Country — only letters and spaces (uppercase)
        else if (name === "country") {
            cleaned = value.replace(/[^A-Za-z\s]/g, "").toUpperCase();
        }

        // 🧾 Dropdown fields (Transaction type, third party, etc.) — keep as selected
        else if (
            ["transactionType", "involves_third_party", "subcontractor_in_sanctioned_country"].includes(name)
        ) {
            cleaned = value;
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



    const handleSaveBankDetails = async () => {

        try {
            const bankPayload = {
                type: "bank",
                account_holder_name: bankInfo.account_holder_name,
                bank_name: bankInfo.bank_name,
                bank_address: bankInfo.bank_address,
                country: bankInfo.country,
                account_number: bankInfo.account_number,
                ifsc_code: bankInfo.ifsc_code,
                swift_code: bankInfo.swift_code,
                beneficiary_name: bankInfo.beneficiary_name,
            };

            const compliancePayload = {
                type: "compliance",
                involves_third_party: bankInfo.involves_third_party === "true",
                subcontractor_in_sanctioned_country:
                    bankInfo.subcontractor_in_sanctioned_country === "true",
            };

            console.log("Bank Payload:", bankPayload);
            console.log("Compliance Payload:", compliancePayload);

            await addBankDetails(referenceId, bankPayload);
            await addComplianceDetails(referenceId, compliancePayload);
            toast.success("Bank Details saved successfully!");
            nextPage();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.error || "Failed to save Bank Details");
        }
    };

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
        pan: null,
        gstin: null,
        msme: null,
        cheque: null,
        tan: null,
        incorporation: null,
        tds: null,
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
                            id: doc?.doc_id,     // 👈 keep the id
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
        try {
            const newFilesFormData = new FormData();

            const newFiles = Object.entries(documents).filter(([docType, value]) => value?.file);

            if (newFiles.length === 0) {
                toast.error("No new files to upload. Please continue.");
                nextPage();
                return;
            }

            for (const [docType, value] of newFiles) {
                newFilesFormData.append("files[]", value.file);
                newFilesFormData.append("doc_types[]", docType);
            }

            const response = await addDocuments(referenceId, newFilesFormData); // same endpoint

            if (response?.data?.message?.includes("success")) {
                toast.success("Documents saved successfully!");

                // 🔄 re-fetch updated documents
                const refreshed = await getDocumentDetails(8);
                if (refreshed?.data) {
                    const documents = {};
                    refreshed.data.forEach(doc => {
                        documents[doc?.doc_type] = {
                            file: null,
                            url: doc?.file_path
                        };
                    });
                    setDocuments(documents);
                }

                nextPage();
            } else {
                throw new Error(response?.data?.error || "Unknown error");
            }
        } catch (err) {
            console.error(err);
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
                                                onChange={(e) => {
                                                    let input = e.target.value;

                                                    // ✅ allow letters + spaces while typing
                                                    // but don't immediately collapse or trim (to let typing feel natural)
                                                    if (/^[A-Za-z\s]*$/.test(input)) {
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
                                            <label className={styles.fieldLabel}>Nature of Business Entity
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <select
                                                name="business_entity_type"
                                                value={companyInfo.business_entity_type}
                                                onChange={handleCompanyInfoChange}
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
                                                <option value="Non-Government Organization(NGO)">Non-Government Organization (NGO)</option>
                                            </select>
                                        </div>

                                        {(showFullCompanyFields || companyInfo.business_entity_type === "Section 8 Company") && (
                                            <>
                                                {/* CIN visible for Section 8 too */}
                                                <div className={styles.fieldRow}>
                                                    <label className={styles.fieldLabel}>
                                                        Company Identification Number (CIN)
                                                        <span className={styles.requiredSymbol}>*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="cin_number"
                                                        value={companyInfo.cin_number || ""}
                                                        onChange={handleCinChange}
                                                        className={styles.fieldInput}
                                                        required
                                                        readOnly={isReadOnly}
                                                        maxLength={21}
                                                        pattern="[A-Za-z0-9]{21}"
                                                        title="CIN must be 21 alphanumeric characters (A-Z, 0-9)"
                                                        style={{ textTransform: "uppercase" }}
                                                    />
                                                </div>



                                            </>
                                        )}

                                        {/* 🟢 Sole Proprietorship → Registration Number */}
                                        {companyInfo.business_entity_type === "Sole Proprietorship" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    Registration Number

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
                                                    Firm Registration Number
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="firm_reg_number"
                                                    value={companyInfo.firm_reg_number || ""}
                                                    onChange={(e) =>
                                                        setCompanyInfo((prev) => ({
                                                            ...prev,
                                                            firm_reg_number: e.target.value.toUpperCase(),
                                                        }))
                                                    }
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
                                                    LLP Registration Number
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="llp_reg_number"
                                                    value={companyInfo.llp_reg_number || ""}
                                                    onChange={(e) =>
                                                        setCompanyInfo((prev) => ({
                                                            ...prev,
                                                            llp_reg_number: e.target.value.toUpperCase(),
                                                        }))
                                                    }
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
                                                    Registration Number (as per incorporation certificate)
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

                                        {/* 🟢 TAN Number Section (generalized for all) */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Do you have a TAN Number?
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <select
                                                value={hasTan}
                                                onChange={(e) => {
                                                    setHasTan(e.target.value);
                                                    // clear previous values when changing
                                                    if (e.target.value === "Yes") {
                                                        setTanExemptionFile(null);
                                                    } else {
                                                        setCompanyInfo((prev) => ({ ...prev, tan_number: "" }));
                                                    }
                                                }}
                                                className={styles.fieldInput}
                                                required
                                                disabled={isReadOnly}
                                            >
                                                <option value="">-- Select --</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>
                                        </div>

                                        {/* ✅ If YES → TAN Number input */}
                                        {hasTan === "Yes" && (
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

                                        {/* ✅ If NO → Upload TAN Exemption Certificate */}
                                        {hasTan === "No" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    Upload TAN Exemption Certificate
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={(e) => setTanExemptionFile(e.target.files[0])}
                                                    className={styles.fieldInput}
                                                    required
                                                    disabled={isReadOnly}
                                                />
                                                {tanExemptionFile && (
                                                    <small style={{ color: "#007bff", marginTop: "5px" }}>
                                                        Selected file: {tanExemptionFile.name}
                                                    </small>
                                                )}
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
                                            <label className={styles.fieldLabel}>
                                                Country of Incorporation
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>

                                            <select
                                                name="country_of_incorporation"
                                                value={companyInfo.country_of_incorporation || ""}
                                                onChange={handleCompanyInfoChange}
                                                className={styles.fieldInput}
                                                required
                                                disabled={
                                                    isReadOnly ||
                                                    ["Sole Proprietorship", "Partnership"].includes(companyInfo.business_entity_type)
                                                }
                                            >
                                                <option value="">-- Select Country --</option>
                                                {countries.map((country) => (
                                                    <option key={country.id} value={country.id}>
                                                        {country.country}
                                                    </option>
                                                ))}
                                            </select>


                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                State / Province
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>

                                            {isIndia ? (
                                                // ✅ Show dropdown if country is India
                                                <select
                                                    name="state"
                                                    value={companyInfo.state || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    required
                                                    disabled={isReadOnly}
                                                >
                                                    <option value="">-- Select State --</option>
                                                    {states.map((state) => (
                                                        <option key={state.id} value={state.id}>
                                                            {state.state}
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                // 🌎 Show text input if not India
                                                <input
                                                    type="text"
                                                    name="state"
                                                    value={companyInfo.state || ""}
                                                    onChange={(e) => {
                                                        const cleaned = e.target.value.replace(/[^A-Za-z\s]/g, "").toUpperCase();
                                                        setCompanyInfo(prev => ({ ...prev, state: cleaned }));
                                                    }}
                                                    className={styles.fieldInput}
                                                    placeholder="Enter State / Province"
                                                    required
                                                    readOnly={isReadOnly}
                                                />
                                            )}
                                        </div>
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
                                                Registered Address
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="registered_address"
                                                value={companyInfo.registered_address || ""}
                                                onChange={(e) => {
                                                    handleCompanyInfoChange(e);
                                                    if (sameAsRegistered) {
                                                        setCompanyInfo(prev => ({
                                                            ...prev,
                                                            business_address: e.target.value,
                                                        }));
                                                    }
                                                }}
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

                                                    <option value="Mr">Mr</option>
                                                    <option value="Mrs">Mrs</option>
                                                    <option value="Ms">Ms</option>
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
                                                Website
                                            </label>
                                            <input
                                                type="text"
                                                name="website"
                                                value={companyInfo.website || ""}
                                                onChange={(e) => {
                                                    let val = e.target.value.trim();

                                                    // ✅ remove spaces inside (user can’t type "example .com")
                                                    val = val.replace(/\s+/g, "");

                                                    // ✅ optional: auto-add https:// if user types "example.com"
                                                    if (val && !/^https?:\/\//i.test(val)) {
                                                        val = "https://" + val;
                                                    }

                                                    setCompanyInfo({
                                                        ...companyInfo,
                                                        website: val,
                                                    });
                                                }}
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
                                                    name="account_person_title"
                                                    value={companyInfo.account_person_title || ""}
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

                                                    <option value="Mr">Mr</option>
                                                    <option value="Mrs">Mrs</option>
                                                    <option value="Ms">Ms</option>
                                                </select>

                                                <input
                                                    type="text"
                                                    name="account_person_name"
                                                    value={companyInfo.account_person_name || ""}
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
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Registered under MSME Act
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <select
                                                name="registered_under_msme"
                                                value={msmeInfo?.registered_under_msme}
                                                onChange={handleMsmeChange}
                                                className={styles.fieldInput}
                                                required
                                                disabled={isReadOnly}

                                            >
                                                <option value="">Select</option>
                                                <option value="true">Yes</option>
                                                <option value="false">No</option>
                                            </select>
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Udyam Registration Number
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="udyam_registration_number"
                                                value={msmeInfo?.udyam_registration_number}
                                                onChange={handleMsmeChange}
                                                className={styles.fieldInput}
                                                required
                                                readOnly={isReadOnly}

                                            />
                                        </div>
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


                                        <div className={styles.fieldRow} >
                                            <label className={styles.fieldLabel}>Type of Counterparty Business
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <select
                                                name="type_of_counterparty"
                                                value={goodsServices.type_of_counterparty}
                                                onChange={(e) => handleGoodsServicesChange(e, 'goodsServices')}
                                                className={styles.fieldInput}
                                                required
                                                disabled={isReadOnly}
                                            >
                                                <option value="">Select</option>
                                                <option value="Trading Entity">Trading Entity</option>
                                                <option value="End-Use">End-Use</option>
                                                <option value="Manufacturer">Manufacturer</option>
                                                <option value="Service Provider">Service provider</option>
                                                <option value="Third Party Payer / Reciever of funds">Third party payer/receiver of funds</option>
                                                <option value="Others">Others</option>
                                            </select>

                                            {goodsServices.type_of_counterparty === 'Others' && (
                                                <input
                                                    type="text"
                                                    name="others"
                                                    value={goodsServices.others}
                                                    onChange={(e) => handleGoodsServicesChange(e, 'goodsServices')}
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
                                                onChange={(e) =>
                                                    setGoodsServices((prev) => ({ ...prev, type: e.target.value }))
                                                }
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

                                        {/* ✅ Checkbox — controls GST field visibility */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>GST Not Applicable<br></br>(other Than India)</label>
                                            <div className={styles.checkboxRow}>
                                                <label>
                                                    <input
                                                        type="checkbox"
                                                        checked={gstNotApplicable}
                                                        onChange={(e) => setGstNotApplicable(e.target.checked)}
                                                        disabled={isReadOnly}
                                                    />{" "}
                                                    If applicable
                                                </label>
                                            </div>
                                        </div>

                                        {/* ✅ GST Fields visible only when checkbox is UNCHECKED */}
                                        {!gstNotApplicable && (
                                            <>
                                                {/* Number selection */}
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

                                                {/* Dynamic registration fields */}
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

                                                        <div className={styles.fieldRow}>
                                                            <label className={styles.fieldLabel}>
                                                                State Name
                                                                <span className={styles.requiredSymbol}>*</span>
                                                            </label>
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

                                                {/* Registration Type Dropdown */}
                                                <div className={styles.fieldRow}>
                                                    <label className={styles.fieldLabel}>
                                                        Registration Type
                                                        <span className={styles.requiredSymbol}>*</span>
                                                    </label>
                                                    <select
                                                        value={gstMeta.reg_type}
                                                        onChange={(e) =>
                                                            setGstMeta((prev) => ({ ...prev, reg_type: e.target.value }))
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
                                                        value={gstMeta.periodicity_gstr1}
                                                        onChange={(e) =>
                                                            setGstMeta((prev) => ({
                                                                ...prev,
                                                                periodicity_gstr1: e.target.value,
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
                                                    <td>
                                                        Currency Type
                                                    </td>

                                                    {[1, 2].map((i) => (
                                                        <td key={i}>
                                                            <select
                                                                name={`currencyType${i}`}
                                                                value={formData[`currencyType${i}`] || ""}
                                                                onChange={(e) => {
                                                                    handleIncomeChange(e);
                                                                    // clear currency name if switched back to Rupees
                                                                    if (e.target.value === "Rupees") {
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
                                                                <option value="Rupees">Rupees (INR)</option>
                                                                <option value="Others">Others</option>
                                                            </select>
                                                        </td>
                                                    ))}
                                                </tr>

                                                {/* Currency Name Row (only shows if 'Others' selected) */}
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
                                                                            onChange={handleIncomeChange}
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
                                                                value={formData[`itrStatus${i}`]}
                                                                onChange={handleIncomeChange}
                                                                required
                                                                disabled={isReadOnly}
                                                                className={styles.fieldInput}
                                                            >
                                                                <option value="">Select</option>
                                                                <option value="Yes">Yes</option>
                                                                <option value="No">No</option>
                                                            </select>
                                                        </td>
                                                    ))}
                                                </tr>

                                                {/* ITR Acknowledgment */}
                                                {["itrStatus1", "itrStatus2"].some((key) => formData[key] === "Yes") && (
                                                    <tr>
                                                        <td>
                                                            ITR Acknowledgment No.

                                                        </td>
                                                        {[1, 2].map((i) => (
                                                            <td key={i}>
                                                                {formData[`itrStatus${i}`] === "Yes" ? (
                                                                    <input
                                                                        type="text"
                                                                        name={`ackNo${i}`}
                                                                        value={formData[`ackNo${i}`]}
                                                                        onChange={handleIncomeChange}
                                                                        required
                                                                        readOnly={isReadOnly}
                                                                        className={styles.fieldInput}
                                                                    />
                                                                ) : (
                                                                    <div style={{ height: "30px" }}></div> // keeps alignment
                                                                )}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                )}

                                                {/* ITR Filed Date */}
                                                {["itrStatus1", "itrStatus2"].some((key) => formData[key] === "Yes") && (
                                                    <tr>
                                                        <td>
                                                            ITR Filed Date
                                                            <span className={styles.requiredSymbol}>*</span>
                                                        </td>

                                                        {[1, 2].map((i) => {
                                                            const fy = formData[`fy${i}`];
                                                            const endYear = fy ? parseInt(fy.split("-")[1]) : new Date().getFullYear();

                                                            // Generate last 5 years from end year
                                                            const itrYears = Array.from({ length: 5 }, (_, idx) => endYear - idx);

                                                            return (
                                                                <td key={i}>
                                                                    {formData[`itrStatus${i}`] === "Yes" ? (
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

                                                                            {/* Month dropdown */}
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
                                                                                    <option
                                                                                        key={month}
                                                                                        value={String(index + 1).padStart(2, "0")}
                                                                                    >
                                                                                        {month}
                                                                                    </option>
                                                                                ))}
                                                                            </select>

                                                                            {/* Day dropdown */}
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

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Transaction Type <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <select
                                                name="transactionType"
                                                value={bankInfo.transactionType || ""}
                                                onChange={(e) =>
                                                    setBankInfo((prev) => ({ ...prev, transactionType: e.target.value }))
                                                }
                                                className={styles.fieldInput}
                                                required
                                            >
                                                <option value="">Select Transaction Type</option>
                                                <option value="Domestic">Domestic</option>
                                                <option value="International">International</option>
                                                <option value="Domestic and International">Domestic and International</option>
                                            </select>
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Country
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>

                                            <select
                                                name="country"
                                                value={bankInfo.country || ""}
                                                onChange={handleBankDetailsChange}
                                                className={styles.fieldInput}
                                                required
                                                disabled={isReadOnly}
                                            >
                                                <option value="">-- Select Country --</option>
                                                {countries.map((country) => (
                                                    <option key={country.id} value={country.id}>
                                                        {country.country}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>



                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Account Number
                                                <span className={styles.requiredSymbol}>*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="account_number"
                                                value={bankInfo.account_number}
                                                onChange={handleBankDetailsChange}
                                                className={styles.fieldInput}
                                                required
                                                readOnly={isReadOnly}
                                            />
                                        </div>

                                        {bankInfo.transactionType === "Domestic" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>IFSC Code
                                                    <span className={styles.requiredSymbol}>*</span></label>
                                                <input
                                                    type="text"
                                                    name="ifscCode"
                                                    value={bankInfo.ifscCode || ""}
                                                    onChange={(e) =>
                                                        setBankInfo((prev) => ({
                                                            ...prev,
                                                            ifscCode: e.target.value.toUpperCase(), // 🔠 force uppercase
                                                        }))
                                                    }
                                                    maxLength={11}
                                                    className={styles.fieldInput}
                                                />
                                            </div>
                                        )}

                                        {bankInfo.transactionType === "International" && (
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>SWIFT Code
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="swiftCode"
                                                    value={bankInfo.swiftCode || ""}
                                                    onChange={(e) =>
                                                        setBankInfo((prev) => ({
                                                            ...prev,
                                                            swiftCode: e.target.value.toUpperCase(), // 🔠 force uppercase
                                                        }))
                                                    }
                                                    maxLength={11}
                                                    className={styles.fieldInput}
                                                />
                                            </div>
                                        )}

                                        {bankInfo.transactionType === "Domestic and International" && (
                                            <>
                                                <div className={styles.fieldRow}>
                                                    <label className={styles.fieldLabel}>IFSC Code
                                                        <span className={styles.requiredSymbol}>*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="ifscCode"
                                                        value={bankInfo.ifscCode || ""}
                                                        onChange={(e) =>
                                                            setBankInfo((prev) => ({
                                                                ...prev,
                                                                ifscCode: e.target.value.toUpperCase(),
                                                            }))
                                                        }

                                                        className={styles.fieldInput}
                                                    />
                                                </div>
                                                <div className={styles.fieldRow}>
                                                    <label className={styles.fieldLabel}>SWIFT Code
                                                        <span className={styles.requiredSymbol}>*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="swiftCode"
                                                        value={bankInfo.swiftCode || ""}
                                                        onChange={(e) =>
                                                            setBankInfo((prev) => ({
                                                                ...prev,
                                                                swiftCode: e.target.value.toUpperCase(),
                                                            }))
                                                        }

                                                        className={styles.fieldInput}
                                                    />
                                                </div>
                                            </>
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



                                        {/* GSTIN */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                GSTIN
                                            </label>

                                            {/* Dropdown */}
                                            <select
                                                name="gstin"
                                                value={documentStatus.gstin || ""}
                                                onChange={handleDocumentStatusChange}
                                                required
                                                disabled={isReadOnly}
                                                className={styles.fieldInput}
                                            >
                                                <option value="">-- Select --</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>

                                            {/* File upload only if Yes */}
                                            {documentStatus.gstin === "Yes" && (
                                                <>
                                                    <input
                                                        type="file"
                                                        accept=".jpg,.jpeg,.png,.pdf"
                                                        className={styles.fieldInput}
                                                        onChange={(e) => handleDocumentChange("gstin", e.target.files[0])}
                                                        required
                                                        readOnly={isReadOnly}
                                                    />

                                                    {documents.gstin?.fileName && (
                                                        <span className={styles.fileName}>📄 {documents.gstin.fileName}</span>
                                                    )}

                                                    {documents.gstin?.url && (
                                                        <a
                                                            href={
                                                                documents.gstin.url.startsWith("blob:")
                                                                    ? documents.gstin.url
                                                                    : `${process.env.REACT_APP_API_BASE_URL}/${documents.gstin.url}`
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
                                        {/* MSME Certificate */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>MSME Certificate (if any)</label>

                                            <select
                                                name="msme"
                                                value={documentStatus.msme || ""}
                                                onChange={handleDocumentStatusChange}
                                                disabled={isReadOnly}
                                                className={styles.fieldInput}
                                            >
                                                <option value="">-- Select --</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>

                                            {documentStatus.msme === "Yes" && (
                                                <>
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
                                                </>
                                            )}
                                        </div>

                                        {/* Cancelled Cheque Leaf Upload */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Cancelled Cheque Leaf

                                            </label>

                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handleValidatedFileChange(e, "cheque")}
                                                className={styles.fieldInput}
                                                disabled={isReadOnly}
                                            />

                                            {documents.cheque?.url && (
                                                <a
                                                    href={documents.cheque.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.fileLink}
                                                >
                                                    View Uploaded Cheque
                                                </a>
                                            )}
                                        </div>

                                        {/* 🟢 TAN Certificate Upload */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                TAN Certificate

                                            </label>

                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handleValidatedFileChange(e, "tan")}
                                                className={styles.fieldInput}
                                                disabled={isReadOnly}
                                            />

                                            {documents.tan?.url && (
                                                <a
                                                    href={documents.tan.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.fileLink}
                                                >
                                                    View
                                                </a>
                                            )}
                                        </div>

                                        {/* Certificate of Incorporation / Firm Registration */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Registration Certificate
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

                                        {/* TDS Declaration for Exemption */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>TDS Declaration for Exemption</label>

                                            <select
                                                name="tds"
                                                value={documentStatus.tds || ""}
                                                onChange={handleDocumentStatusChange}
                                                disabled={isReadOnly}
                                                className={styles.fieldInput}
                                            >
                                                <option value="">-- Select --</option>
                                                <option value="Yes">Yes</option>
                                                <option value="No">No</option>
                                            </select>

                                            {documentStatus.tds === "Yes" && (
                                                <>
                                                    <input
                                                        type="file"
                                                        accept=".jpg,.jpeg,.png,.pdf"
                                                        className={styles.fieldInput}
                                                        onChange={(e) => handleDocumentChange("tds", e.target.files[0])}
                                                        readOnly={isReadOnly}
                                                    />

                                                    {documents.tds?.fileName && (
                                                        <span className={styles.fileName}>📄 {documents.tds.fileName}</span>
                                                    )}

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
                                                </>
                                            )}
                                        </div>

                                    </div>
                                )}

                                {/* STEP 6: Declaration & Confidentiality */}
                                {currentPage === 6 && (
                                    <div className={styles.page}>
                                        <h3>Declaration and Acknowledgement</h3>

                                        {/* ✅ Declaration Section */}
                                        <p className={styles.declarationText}>
                                            I/We <strong>{declarationDetails.name || "________"}</strong> of{" "}
                                            <strong>{declarationDetails.organization || "________"}</strong> designated as{" "}
                                            <strong>{declarationDetails.designation || "________"}</strong> declare that the
                                            information provided in this document is true and accurate in all respects and
                                            that we have performed such procedures and inquiries as necessary to verify the
                                            answers.
                                        </p>

                                        {/* Declaration Checkbox */}
                                        <div className={styles.checkboxRow}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={agreeDeclaration}
                                                    onChange={(e) => handleCheckbox("declaration", e.target.checked)}
                                                />{" "}
                                                I agree with the above Declaration
                                            </label>
                                        </div>

                                        {/* ✅ Counterparty Section */}
                                        <p className={styles.declarationText}>
                                            I/We <strong>{counterpartyDetails.name || "________"}</strong> of{" "}
                                            <strong>{counterpartyDetails.organization || "________"}</strong> designated as{" "}
                                            <strong>{counterpartyDetails.designation || "________"}</strong> confirm that all
                                            the information shared is accurate and valid. I/We acknowledge that this document
                                            will be used for official evaluation purposes only.
                                        </p>

                                        {/* Counterparty Checkbox */}
                                        <div className={styles.checkboxRow}>
                                            <label>
                                                <input
                                                    type="checkbox"
                                                    checked={agreeCounterparty}
                                                    onChange={(e) => handleCheckbox("counterparty", e.target.checked)}
                                                />{" "}
                                                I agree with the above Counterparty Declaration
                                            </label>
                                        </div>

                                        {/* ✅ Show these 3 fields only when BOTH checkboxes are ticked */}
                                        {agreeDeclaration && agreeCounterparty && (
                                            <div className={styles.declarationBox}>
                                                <div className={styles.fieldRow}>
                                                    <label className={styles.fieldLabel}>Place</label>
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
                                                        (JPG, JPEG, PNG — white background only, max 1 MB)
                                                    </label>
                                                    <input
                                                        type="file"
                                                        accept=".jpg,.jpeg,.png"
                                                        onChange={handleSignatureUpload}
                                                        className={styles.fieldInput}
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
                                                    <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center", color: "#000" }}>S.No</th>
                                                    <th style={{ border: "1px solid #ddd", padding: "8px", color: "#000" }}>Date</th>
                                                    <th style={{ border: "1px solid #ddd", padding: "8px", color: "#000" }}>Comment</th>
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
                                                            onClick={() => {
                                                                switch (currentPage) {
                                                                    case 0:
                                                                        handleSubmitCompanyInfo();
                                                                        break;
                                                                    case 1:
                                                                        handleSaveMsmeInfo();
                                                                        break;
                                                                    case 2:
                                                                        handleSaveGstForm();
                                                                        break;
                                                                    case 3:
                                                                        handleSaveBankDetails();
                                                                        break;
                                                                    case 4:
                                                                        handleSaveDocuments();
                                                                        break;
                                                                    default:
                                                                        nextPage();
                                                                }
                                                            }}
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
                                    sx={{
                                        position: "fixed",
                                        top: 0,
                                        left: 0,
                                        width: "100vw",
                                        height: "100vh",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                                        zIndex: 2000,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            backgroundColor: "#fff",
                                            color: "#1a1a1a",
                                            borderRadius: "14px",
                                            padding: "30px 40px",
                                            width: "90%",
                                            maxWidth: "950px",
                                            maxHeight: "90vh",
                                            overflowY: "auto",
                                            fontFamily: "'Segoe UI', Roboto, sans-serif",
                                            boxShadow: "0 8px 35px rgba(0,0,0,0.4)",
                                            position: "relative",
                                        }}
                                    >
                                        {/* Header */}
                                        <h2
                                            id="confirm-modal-title"
                                            style={{
                                                textAlign: "center",
                                                marginBottom: "25px",
                                                fontSize: "26px",
                                                fontWeight: "700",
                                                color: "#0d47a1",
                                            }}
                                        >
                                            🧾 Review All Details Before Final Submission —{" "}
                                            {new Date().toLocaleDateString("en-GB", {
                                                day: "2-digit",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </h2>

                                        {/* --- Step Sections --- */}
                                        {[
                                            {
                                                title: "1️⃣ Business Entity Details",
                                                content: (
                                                    <>
                                                        {renderValue("Full Registered Name", companyInfo.full_registered_name)}
                                                        {renderValue("Business Entity Type", companyInfo.business_entity_type)}
                                                        {renderValue("Trading Name", companyInfo.trading_name)}
                                                        {renderValue("Telephone", companyInfo.telephone)}
                                                        {renderValue("Country of Incorporation", countries.find(c => c.id == companyInfo.country_of_incorporation)?.country)}
                                                        {renderValue("Registered Address", companyInfo.registered_address)}
                                                        {renderValue("Business Address", companyInfo.business_address)}
                                                        {renderValue("Contact Person Name", companyInfo.contact_person_name)}
                                                        {renderValue("Contact Person Email", companyInfo.contact_person_email)}
                                                    </>
                                                ),
                                            },
                                            {
                                                title: "2️⃣ MSME Details",
                                                content: (
                                                    <>
                                                        {renderValue("Registered under MSME", msmeInfo.registered_under_msme === "true" ? "Yes" : "No")}
                                                        {renderValue("Udyam Registration Number", msmeInfo.udyam_registration_number)}
                                                        {renderValue("Category", msmeInfo.category)}
                                                    </>
                                                ),
                                            },
                                            {
                                                title: "3️⃣ GST & Goods/Services Information",
                                                content: (
                                                    <>
                                                        {renderValue("Type of Counterparty", goodsServices.type_of_counterparty)}
                                                        {renderValue("Other Type", goodsServices.others)}
                                                        {renderValue("Registration Type", gstMeta.reg_type)}
                                                        {renderValue("Periodicity of GSTR-1", gstMeta.periodicity_gstr1)}
                                                    </>
                                                ),
                                            },
                                            {
                                                title: "4️⃣ Bank Details",
                                                content: (
                                                    <>
                                                        {renderValue("Account Holder Name", bankInfo.account_holder_name)}
                                                        {renderValue("Bank Name", bankInfo.bank_name)}
                                                        {renderValue("Account Number", bankInfo.account_number)}
                                                        {renderValue("IFSC Code", bankInfo.ifsc_code)}
                                                        {renderValue("SWIFT Code", bankInfo.swift_code)}
                                                        {renderValue("Beneficiary Name", bankInfo.beneficiary_name)}
                                                    </>
                                                ),
                                            },
                                            {
                                                title: "5️⃣ Documents Uploaded",
                                                content: (
                                                    <ul style={{ listStyle: "none", paddingLeft: "0" }}>
                                                        {Object.entries(documents).map(([key, value]) => (
                                                            <li key={key} style={{ marginBottom: "6px" }}>
                                                                <b style={{ textTransform: "capitalize" }}>{key}</b> —{" "}
                                                                {value?.url ? (
                                                                    <a
                                                                        href={value.url}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        style={{ color: "#1976d2", textDecoration: "underline" }}
                                                                    >
                                                                        View
                                                                    </a>
                                                                ) : (
                                                                    "Not Uploaded"
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ),
                                            },
                                            {
                                                title: "6️⃣ Declaration & Acknowledgement",
                                                content: (
                                                    <>
                                                        {renderValue("Name", declarationInfo.name)}
                                                        {renderValue("Organization", declarationInfo.organization)}
                                                        {renderValue("Designation", declarationInfo.designation)}
                                                        {renderValue("Date", declarationInfo.date)}
                                                        {renderValue("Place", declarationInfo.place)}
                                                    </>
                                                ),
                                            },
                                        ].map((section, index) => (
                                            <Box
                                                key={index}
                                                sx={{
                                                    border: "1px solid #e0e0e0",
                                                    borderRadius: "10px",
                                                    padding: "20px 25px",
                                                    mb: 3,
                                                    backgroundColor: "#f9fbff",
                                                }}
                                            >
                                                <h3
                                                    style={{
                                                        marginBottom: "10px",
                                                        fontSize: "18px",
                                                        fontWeight: "600",
                                                        color: "#0d47a1",
                                                        borderBottom: "2px solid #bbdefb",
                                                        paddingBottom: "4px",
                                                    }}
                                                >
                                                    {section.title}
                                                </h3>
                                                <div style={{ lineHeight: "1.6", fontSize: "15px", color: "#222" }}>{section.content}</div>
                                            </Box>
                                        ))}

                                        {/* --- Action Buttons --- */}
                                        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 4 }}>
                                            <Button
                                                variant="contained"
                                                color="success"
                                                onClick={handleFinalSubmit}
                                                sx={{
                                                    px: 4,
                                                    py: 1,
                                                    fontWeight: "600",
                                                    textTransform: "none",
                                                    fontSize: "15px",
                                                }}
                                            >
                                                Confirm & Submit
                                            </Button>
                                            <Button
                                                variant="outlined"
                                                color="error"
                                                onClick={handleCloseModal}
                                                sx={{
                                                    px: 4,
                                                    py: 1,
                                                    fontWeight: "600",
                                                    textTransform: "none",
                                                    fontSize: "15px",
                                                }}
                                            >
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
