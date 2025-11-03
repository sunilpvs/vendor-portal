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


const VmsRequest = () => {
    const [referenceId, setReferenceId] = useState(null);
    const [rfqStatus, setRfqStatus] = useState(null);
    const readOnlyStatuses = [8, 9, 11, 12, 13, 14];
    const isReadOnly = readOnlyStatuses.includes(rfqStatus);
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);

    const [currentPage, setCurrentPage] = useState(0);
    const totalSteps = 6;

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


    const getCountries = async () => {
        try {
            const response = await getCountryCombo();
            const countriesResp = response?.data || [];  // Default to empty array if no data
            console.log(countriesResp);
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
        "Business Entity Details",
        "MSME Details",
        "GST Information",
        "Bank Details",
        "Documents and Attachments",
        "Declaration and Acknowledgement",
    ];


    const [goods, setGoods] = useState([]);
    const [services, setServices] = useState([]);
    const [goodsAndServices, setGoodsAndServices] = useState([]);

    // ======== GOODS ========
    const gsForm_addGoods = () => {
        if (goods.length < 5) setGoods([...goods, ""]);
    };

    const gsForm_changeGoods = (index, value) => {
        const updated = [...goods];
        updated[index] = value;
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

    const gsForm_changeService = (index, value) => {
        const updated = [...services];
        updated[index] = value;
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

    const gsForm_changeGoodsServices = (index, field, value) => {
        const updated = [...goodsAndServices];
        updated[index][field] = value;
        setGoodsAndServices(updated);
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

    const handleDocumentChange = (docType, file) => {
        setDocuments(prev => ({
            ...prev,
            [docType]: {
                file,
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
        for (let y = currentYear - 3; y < currentYear; y++) {
            years.push(`${y}-${y + 1}`);
        }
        return years;
    };

    const financialYears = generateFinancialYears();
    const [formData, setFormData] = useState({
        fy1: "",
        fy2: "",
        fy3: "",
        turnover1: "",
        turnover2: "",
        turnover3: "",
        itrStatus1: "",
        itrStatus2: "",
        itrStatus3: "",
        ackNo1: "",
        ackNo2: "",
        ackNo3: "",
        filedDate1: "",
        filedDate2: "",
        filedDate3: "",
    });

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const fy1 = `${currentYear - 1}-${currentYear}`;
        const fy2 = `${currentYear - 2}-${currentYear - 1}`;
        const fy3 = `${currentYear - 3}-${currentYear - 2}`;

        setFormData((prev) => ({
            ...prev,
            fy1,
            fy2,
            fy3,
        }));
    }, []);





    const handleIncomeChange = (e) => {
        const { name, value } = e.target;

        // Allow only 0 or positive numbers for turnover fields
        if (name.startsWith("turnover")) {
            if (value === "" || /^[0-9]*$/.test(value)) {
                setFormData((prev) => ({ ...prev, [name]: value }));
            }
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
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
        'Non-Government Organization (NGO)',
    ];





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


    const selectedEntityType = companyInfo.business_entity_type;
    const showFullCompanyFields = companyTypesRequiringFullDetails.includes(selectedEntityType);
    const showBasicRegistrationField = entitiesRequiringBasicRegistration.includes(selectedEntityType);


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
                updatedInfo.cin_number = null;
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
        setCompanyInfo((prev) => ({
            ...prev,
            [name]: value,
        }));
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
        setMsmeInfo((prev) => ({
            ...prev,
            [name]: value,
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
                        fy3: details[2]?.fin_year || "",

                        turnover1: details[0]?.turnover || "",
                        turnover2: details[1]?.turnover || "",
                        turnover3: details[2]?.turnover || "",

                        itrStatus1: details[0]?.status_of_itr || "",
                        itrStatus2: details[1]?.status_of_itr || "",
                        itrStatus3: details[2]?.status_of_itr || "",

                        ackNo1: details[0]?.itr_ack_num || "",
                        ackNo2: details[1]?.itr_ack_num || "",
                        ackNo3: details[2]?.itr_ack_num || "",

                        filedDate1: details[0]?.itr_filed_date || "",
                        filedDate2: details[1]?.itr_filed_date || "",
                        filedDate3: details[2]?.itr_filed_date || "",
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
            updated[index][field] = value;
            return updated;
        });
    };

    // handle goods and services input changes
    const handleGoodsServicesChange = (e, section) => {
        const { name, value } = e.target;
        if (section === 'goodsServices') {
            setGoodsServices(prev => ({ ...prev, [name]: value }));
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
        setBankInfo((prev) => ({
            ...prev,
            [name]: value,
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


    return (
        <Box m="50px">
            <Header
                title="Customer / Vendor Registration"
                subtitle="Vendor Management System"
            />



            {/* Stepper */}

            <div className={styles.container}>
                <div className={styles.vmsWrapper}>
                    {/* Sidebar */}
                    <div className={styles.verticalTabs}>
                        {stepLabels.map((label, index) => (
                            <div
                                key={index}
                                className={`${styles.tab} ${currentPage === index ? styles.activeTab : ""
                                    } ${currentPage > index ? styles.completedTab : ""}`}
                                onClick={() => setCurrentPage(index)}
                            >
                                <div className={styles.tabIcon}>{index + 1}</div>
                                <div className={styles.tabLabel}>{label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Form content */}
                    <div className={styles.formOuter}>
                        <form>
                            {/* Step 1: Company Info */}
                            {currentPage === 0 && (

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
                                            className={styles.fieldInput}
                                            onChange={(e) =>
                                                setCompanyInfo({ ...companyInfo, full_registered_name: e.target.value })
                                            }
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

                                    {/* Conditional Fields */}
                                    {showFullCompanyFields && (
                                        <>
                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    Company Identification Number (CIN)
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    name="cin_number"
                                                    value={companyInfo.cin_number || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    disabled={companyInfo.business_entity_type === "Section 8 Company"}
                                                    required

                                                    readOnly={isReadOnly}
                                                />
                                            </div>

                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>TAN Number
                                                    <span className={styles.requiredSymbol}>*</span></label>
                                                <input
                                                    type="text"
                                                    name="tan_number"
                                                    value={companyInfo.tan_number || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    disabled={companyInfo.business_entity_type === "Section 8 Company"}
                                                    required

                                                    readOnly={isReadOnly}
                                                />
                                            </div>

                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>Company Registration Number
                                                    <span className={styles.requiredSymbol}>*</span></label>
                                                <input
                                                    type="text"
                                                    name="reg_number"
                                                    value={companyInfo.reg_number || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    disabled={companyInfo.business_entity_type === "Section 8 Company"}
                                                    required

                                                    readOnly={isReadOnly}
                                                />
                                            </div>

                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>Company Email
                                                    <span className={styles.requiredSymbol}>*</span></label>
                                                <input
                                                    type="email"
                                                    name="company_email"
                                                    value={companyInfo.company_email || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    required

                                                    readOnly={isReadOnly}
                                                />
                                            </div>

                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>Trade License Number
                                                    <span className={styles.requiredSymbol}>*</span></label>
                                                <input
                                                    type="text"
                                                    name="trade_license_number"
                                                    value={companyInfo.trade_license_number || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    required
                                                    readOnly={isReadOnly}
                                                />
                                            </div>

                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>PAN Number
                                                    <span className={styles.requiredSymbol}>*</span></label>
                                                <input
                                                    type="text"
                                                    name="pan_number"
                                                    value={companyInfo.pan_number || ""}
                                                    onChange={handleCompanyInfoChange}
                                                    className={styles.fieldInput}
                                                    required
                                                    readOnly={isReadOnly}
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* For simpler entities: Registration Number only */}
                                    {showBasicRegistrationField && (
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
                                        <label className={styles.fieldLabel}>Telephone Number
                                            <span className={styles.requiredSymbol}>*</span></label>
                                        <input
                                            type="text"
                                            name="telephone"
                                            value={companyInfo.telephone || ""}
                                            onChange={handleCompanyInfoChange}
                                            className={styles.fieldInput}
                                            required
                                            readOnly={isReadOnly}
                                        />
                                    </div>

                                    <div className={styles.fieldRow}>
                                        <label className={styles.fieldLabel}>Registered Address
                                            <span className={styles.requiredSymbol}>*</span></label>
                                        <input
                                            type="text"
                                            name="registered_address"
                                            value={companyInfo.registered_address || ""}
                                            onChange={handleCompanyInfoChange}
                                            className={styles.fieldInput}
                                            required
                                            readOnly={isReadOnly}
                                        />
                                    </div>

                                    <div className={styles.fieldRow}>
                                        <label className={styles.fieldLabel}>Business Address (if different)
                                            <span className={styles.requiredSymbol}>*</span></label>
                                        <input
                                            type="text"
                                            name="business_address"
                                            value={companyInfo.business_address || ""}
                                            onChange={handleCompanyInfoChange}
                                            className={styles.fieldInput}
                                            required
                                            readOnly={isReadOnly}
                                        />
                                    </div>

                                    <div className={styles.fieldRow}>
                                        <label className={styles.fieldLabel}>Country of Incorporation
                                            <span className={styles.requiredSymbol}>*</span>
                                        </label>
                                        <select
                                            name="country_of_incorporation"
                                            value={companyInfo.country_of_incorporation || ""}
                                            onChange={handleCompanyInfoChange}
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
                                        <label className={styles.fieldLabel}>State
                                            <span className={styles.requiredSymbol}>*</span>
                                        </label>
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
                                    </div>

                                    <div className={styles.fieldRow}>
                                        <label className={styles.fieldLabel}>Contact Person Name
                                            <span className={styles.requiredSymbol}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="contact_person_name"
                                            value={companyInfo.contact_person_name || ""}
                                            onChange={handleCompanyInfoChange}
                                            className={styles.fieldInput}
                                            required
                                            readOnly={isReadOnly}
                                        />
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
                                        <label className={styles.fieldLabel}>Website
                                            <span className={styles.requiredSymbol}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="website"
                                            value={companyInfo.website || ""}
                                            onChange={handleCompanyInfoChange}
                                            className={styles.fieldInput}
                                            required
                                            readOnly={isReadOnly}
                                        />
                                    </div>

                                    <div className={styles.fieldRow}>
                                        <label className={styles.fieldLabel}>Accounts Person Name
                                            <span className={styles.requiredSymbol}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="accounts_person_name"
                                            value={companyInfo.accounts_person_name || ""}
                                            onChange={handleCompanyInfoChange}
                                            className={styles.fieldInput}
                                            required
                                            readOnly={isReadOnly}
                                        />
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
                            {currentPage === 1 && (
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
                            {currentPage === 2 && (
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

                                    <h3 style={{ marginTop: "20px", }}>GST Registrations</h3>
                                    {/* Number selection */}
                                    <div className={styles.fieldRow}>
                                        <label className={styles.fieldLabel}>Number of GST Registrations (max 28)
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
                                                <label className={styles.fieldLabel}>State Name
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <select
                                                    className={styles.fieldInput}
                                                    value={item.state}
                                                    onChange={(e) => handleGstFieldChange(i, "state", e.target.value)}
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
                                                <label className={styles.fieldLabel}>GST Number (15 digits)
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    maxLength={15}
                                                    className={styles.fieldInput}
                                                    value={item.gstNumber}
                                                    onChange={(e) => handleGstFieldChange(i, "gstNumber", e.target.value)}
                                                    placeholder="Enter GSTIN"
                                                    required
                                                    readOnly={isReadOnly}
                                                />
                                            </div>

                                            <div className={styles.fieldRow}>
                                                <label className={styles.fieldLabel}>
                                                    Registration Date
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </label>

                                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                    {/* Day dropdown */}
                                                    <select
                                                        className={styles.fieldInput}
                                                        value={item.regDay || ""}
                                                        onChange={(e) => handleGstFieldChange(i, "regDay", e.target.value)}
                                                        required
                                                        disabled={isReadOnly}
                                                        style={{ width: "70px", textAlign: "center" }}
                                                    >
                                                        <option value="">DD</option>
                                                        {[...Array(31)].map((_, day) => (
                                                            <option key={day + 1} value={String(day + 1).padStart(2, "0")}>
                                                                {String(day + 1).padStart(2, "0")}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    {/* Month dropdown */}
                                                    <select
                                                        className={styles.fieldInput}
                                                        value={item.regMonth || ""}
                                                        onChange={(e) => handleGstFieldChange(i, "regMonth", e.target.value)}
                                                        required
                                                        disabled={isReadOnly}
                                                        style={{ width: "90px", textAlign: "center" }}
                                                    >
                                                        <option value="">MM</option>
                                                        {[
                                                            "Jan",
                                                            "Feb",
                                                            "Mar",
                                                            "Apr",
                                                            "May",
                                                            "Jun",
                                                            "Jul",
                                                            "Aug",
                                                            "Sep",
                                                            "Oct",
                                                            "Nov",
                                                            "Dec",
                                                        ].map((month, index) => (
                                                            <option
                                                                key={month}
                                                                value={String(index + 1).padStart(2, "0")}
                                                            >
                                                                {month}
                                                            </option>
                                                        ))}
                                                    </select>

                                                    {/* Year dropdown */}
                                                    <select
                                                        className={styles.fieldInput}
                                                        value={item.regYear || ""}
                                                        onChange={(e) => handleGstFieldChange(i, "regYear", e.target.value)}
                                                        required
                                                        disabled={isReadOnly}
                                                        style={{ width: "90px", textAlign: "center" }}
                                                    >
                                                        <option value="">YYYY</option>
                                                        {Array.from({ length: 50 }, (_, idx) => new Date().getFullYear() - idx).map(
                                                            (year) => (
                                                                <option key={year} value={year}>
                                                                    {year}
                                                                </option>
                                                            )
                                                        )}
                                                    </select>
                                                </div>
                                            </div>

                                        </div>
                                    ))}



                                    {/* Registration Type Dropdown */}
                                    <div className={styles.fieldRow}>
                                        <label className={styles.fieldLabel}>Registration Type
                                            <span className={styles.requiredSymbol}>*</span>
                                        </label>
                                        <select
                                            value={gstMeta.reg_type}
                                            onChange={(e) => setGstMeta(prev => ({ ...prev, reg_type: e.target.value }))}
                                            className={styles.fieldInput}
                                            required
                                            readOnly={isReadOnly}
                                        >
                                            <option value="">Select</option>
                                            <option value="Regular">Regular</option>
                                            <option value="Composition">Composition</option>
                                            <option value="Regular SEZ">Regular SEZ</option>
                                        </select>
                                    </div>

                                    <div className={styles.fieldRow}>
                                        <label className={styles.fieldLabel}>Periodicity of GSTR-1
                                            <span className={styles.requiredSymbol}>*</span></label>
                                        <select
                                            value={gstMeta.periodicity_gstr1}
                                            onChange={(e) => setGstMeta(prev => ({ ...prev, periodicity_gstr1: e.target.value }))}
                                            className={styles.fieldInput}
                                            required
                                            disabled={isReadOnly}
                                        >
                                            <option value="">Select</option>
                                            <option value="Monthly">Monthly</option>
                                            <option value="Quarterly">Quarterly</option>
                                        </select>
                                    </div>


                                    <h3>Income Tax Details</h3>

                                    <table className={styles?.incomeTaxTable || "incomeTaxTable"}>
                                        <thead>
                                            <tr>
                                                <th colSpan="4" className={styles?.tableSubtitle}>
                                                    Details of Turnover for the Last 3 Financial Years
                                                </th>
                                            </tr>
                                            <tr>
                                                <th>Particulars</th>
                                                <th>Financial Year - I</th>
                                                <th>Financial Year - II</th>
                                                <th>Financial Year - III</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            {/* Financial Year */}
                                            <tr>
                                                <td>
                                                    Financial Year <span className={styles.requiredSymbol}>*</span>
                                                </td>
                                                {[1, 2, 3].map((i) => (
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

                                            {/* Turnover field — allows 0 and positive numbers */}
                                            <tr>
                                                <td>Turnover
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </td>
                                                {[1, 2, 3].map((i) => (
                                                    <td key={i}>
                                                        <input
                                                            type="number"
                                                            name={`turnover${i}`}
                                                            value={formData[`turnover${i}`]}
                                                            onChange={handleIncomeChange}
                                                            min="0" // ✅ allows 0 and positive
                                                            onWheel={(e) => e.target.blur()} // prevent scroll changing value
                                                            required
                                                            readOnly={isReadOnly}
                                                        />
                                                    </td>
                                                ))}
                                            </tr>

                                            {/* ITR Status */}
                                            <tr>
                                                <td>Status of ITR filed (Yes/No)
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </td>
                                                {[1, 2, 3].map((i) => (
                                                    <td key={i}>
                                                        <select name={`itrStatus${i}`}
                                                            value={formData[`itrStatus${i}`]}
                                                            onChange={handleIncomeChange}
                                                            required
                                                            disabled={isReadOnly}
                                                        >
                                                            <option value="">Select</option>
                                                            <option value="Yes">Yes</option>
                                                            <option value="No">No</option>
                                                        </select>
                                                    </td>
                                                ))}
                                            </tr>

                                            {/* ITR Acknowledgment */}
                                            {["itrStatus1", "itrStatus2", "itrStatus3"].some(
                                                (key) => formData[key] === "Yes"
                                            ) && (
                                                    <tr>
                                                        <td>
                                                            ITR Acknowledgment No.
                                                            <span className={styles.requiredSymbol}>*</span>
                                                        </td>
                                                        {[1, 2, 3].map((i) => (
                                                            <td key={i}>
                                                                {formData[`itrStatus${i}`] === "Yes" ? (
                                                                    <input
                                                                        type="text"
                                                                        name={`ackNo${i}`}
                                                                        value={formData[`ackNo${i}`]}
                                                                        onChange={handleIncomeChange}
                                                                        required
                                                                        readOnly={isReadOnly}
                                                                    />
                                                                ) : (
                                                                    <div style={{ height: "30px" }}></div> // keeps table alignment neat
                                                                )}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                )}


                                            {/* Filed Date */}
                                            <tr>
                                                <td>
                                                    ITR Filed Date
                                                    <span className={styles.requiredSymbol}>*</span>
                                                </td>

                                                {[1, 2, 3].map((i) => {
                                                    // Get Financial Year string (like "2024-2025")
                                                    const fy = formData[`fy${i}`];
                                                    // Extract the second part (ending year) as base year
                                                    const endYear = fy ? parseInt(fy.split("-")[1]) : new Date().getFullYear();

                                                    // Generate last 5 years based on FY end year
                                                    const itrYears = Array.from({ length: 5 }, (_, idx) => endYear - idx);

                                                    return (
                                                        <td key={i}>
                                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                                {/* Day dropdown */}
                                                                <select
                                                                    className={styles.fieldInput}
                                                                    value={formData[`itrDay${i}`] || ""}
                                                                    onChange={(e) =>
                                                                        handleIncomeChange({
                                                                            target: { name: `itrDay${i}`, value: e.target.value },
                                                                        })
                                                                    }
                                                                    required
                                                                    disabled={isReadOnly}
                                                                    style={{ width: "65px", textAlign: "center" }}
                                                                >
                                                                    <option value="">DD</option>
                                                                    {[...Array(31)].map((_, day) => (
                                                                        <option key={day + 1} value={String(day + 1).padStart(2, "0")}>
                                                                            {String(day + 1).padStart(2, "0")}
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
                                                                        "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug",
                                                                        "Sep",
                                                                        "Oct",
                                                                        "Nov",
                                                                        "Dec",
                                                                    ].map((month, index) => (
                                                                        <option key={month} value={String(index + 1).padStart(2, "0")}>
                                                                            {month}
                                                                        </option>
                                                                    ))}
                                                                </select>

                                                                {/* Year dropdown (Dynamic 5-year range based on FY) */}
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
                                                            </div>
                                                        </td>
                                                    );
                                                })}
                                            </tr>


                                        </tbody>
                                    </table>


                                </div>
                            )}


                            {/* STEP 3: Banking & Further Information */}
                            {currentPage === 3 && (
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
                                        <label className={styles.fieldLabel}>Country
                                            <span className={styles.requiredSymbol}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="country"
                                            value={bankInfo.country}
                                            onChange={handleBankDetailsChange}
                                            className={styles.fieldInput}
                                            required
                                            readOnly={isReadOnly}
                                        />
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

                                    <div className={styles.fieldRow}>
                                        <label className={styles.fieldLabel}>IFSC Code
                                            <span className={styles.requiredSymbol}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="ifsc_code"
                                            value={bankInfo.ifsc_code}
                                            onChange={handleBankDetailsChange}
                                            className={styles.fieldInput}
                                            required
                                            readOnly={isReadOnly}
                                        />
                                    </div>

                                    <div className={styles.fieldRow}>
                                        <label className={styles.fieldLabel}>SWIFT Code
                                            <span className={styles.requiredSymbol}>*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="swift_code"
                                            value={bankInfo.swift_code}
                                            onChange={handleBankDetailsChange}
                                            className={styles.fieldInput}
                                            required
                                            readOnly={isReadOnly}
                                        />
                                    </div>

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

                                    <h3 className={styles.subHeading}>Further Information</h3>
                                    <p>
                                        Please answer the following questions (to the best of your knowledge):
                                    </p>

                                    <div className={styles.fieldRow}>
                                        <label className={styles.fieldLabel}>
                                            Will the proposed business involve a third party acting on your behalf (e.g., an intermediary or agent)?
                                            <span className={styles.requiredSymbol}>*</span>
                                        </label>
                                        <select
                                            name="involves_third_party"
                                            value={bankInfo.involves_third_party ?? ""} // This converts true/false to "true"/"false"
                                            onChange={handleBankDetailsChange}
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
                                            Will you use a third party or subcontractor to act on your behalf or make/receive payments in relation to the proposed business relationship with any sanctioned country?
                                            <span className={styles.requiredSymbol}>*</span>
                                        </label>
                                        <select
                                            name="subcontractor_in_sanctioned_country"
                                            value={bankInfo.subcontractor_in_sanctioned_country ?? ""}
                                            onChange={handleBankDetailsChange}
                                            className={styles.fieldInput}
                                            required
                                            disabled={isReadOnly}
                                        >
                                            <option value="">Select</option>
                                            <option value="true">Yes</option>
                                            <option value="false">No</option>
                                        </select>
                                    </div>


                                </div>
                            )}

                            {/* STEP 4: Documents to be enclosed */}
                            {currentPage === 4 && (
                                <div className={styles.page}>
                                    <h3>Documents to be enclosed</h3>

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

                                        {documents.pan?.url && (
                                            <a
                                                href={documents.pan.url.startsWith("blob:")
                                                    ? documents.pan.url // local preview
                                                    : `${process.env.REACT_APP_API_BASE_URL}/${documents.pan.url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.viewButton}

                                            >
                                                View PAN
                                            </a>
                                        )}
                                    </div>

                                    {/* GSTIN */}
                                    <div className={styles.fieldRow}>
                                        <label className={styles.fieldLabel}>GSTIN <span className={styles.requiredSymbol}>*</span></label>
                                        <input
                                            type="file"
                                             accept=".jpg,.jpeg,.png,.pdf"
                                            className={styles.fieldInput}
                                            onChange={(e) => handleDocumentChange("gstin", e.target.files[0])}
                                            required
                                            readOnly={isReadOnly}
                                        />

                                        {documents.gstin?.url && (
                                            <a
                                                href={documents.gstin.url.startsWith("blob:")
                                                    ? documents.gstin.url // local preview
                                                    : `${process.env.REACT_APP_API_BASE_URL}/${documents.gstin.url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.viewButton}

                                            >
                                                View GSTIN
                                            </a>
                                        )}
                                    </div>

                                    {/* MSME Certificate */}
                                    <div className={styles.fieldRow}>
                                        <label className={styles.fieldLabel}>MSME Certificate (if any)
                                            <span className={styles.requiredSymbol}>*</span>
                                        </label>
                                        <input
                                            type="file"
                                             accept=".jpg,.jpeg,.png,.pdf"
                                            className={styles.fieldInput}
                                            onChange={(e) => handleDocumentChange("msme", e.target.files[0])}
                                            required
                                            readOnly={isReadOnly}
                                        />

                                        {documents.msme?.url && (
                                            <a
                                                href={documents.msme.url.startsWith("blob:")
                                                    ? documents.msme.url // local preview
                                                    : `${process.env.REACT_APP_API_BASE_URL}/${documents.msme.url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.viewButton}

                                            >
                                                View MSME Certificate
                                            </a>
                                        )}
                                    </div>

                                    {/* Cancelled Cheque Leaf */}
                                    <div className={styles.fieldRow}>
                                        <label className={styles.fieldLabel}>Cancelled Cheque Leaf
                                            <span className={styles.requiredSymbol}>*</span>
                                        </label>
                                        <input
                                            type="file"
                                             accept=".jpg,.jpeg,.png,.pdf"
                                            className={styles.fieldInput}
                                            onChange={(e) => handleDocumentChange("cheque", e.target.files[0])}
                                            required
                                            readOnly={isReadOnly}
                                        />

                                        {documents.cheque?.url && (
                                            <a
                                                href={documents.cheque.url.startsWith("blob:")
                                                    ? documents.cheque.url // local preview
                                                    : `${process.env.REACT_APP_API_BASE_URL}/${documents.cheque.url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.viewButton}
                                            >
                                                View Cancelled Cheque Leaf
                                            </a>
                                        )}
                                    </div>

                                    {/* TAN */}
                                    <div className={styles.fieldRow}>
                                        <label className={styles.fieldLabel}>TAN
                                            <span className={styles.requiredSymbol}>*</span>
                                        </label>
                                        <input
                                            type="file"
                                             accept=".jpg,.jpeg,.png,.pdf"
                                            className={styles.fieldInput}
                                            onChange={(e) => handleDocumentChange("tan", e.target.files[0])}
                                            required
                                            readOnly={isReadOnly}
                                        />

                                        {documents.tan?.url && (
                                            <a
                                                href={documents.tan.url.startsWith("blob:")
                                                    ? documents.tan.url // local preview
                                                    : `${process.env.REACT_APP_API_BASE_URL}/${documents.tan.url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.viewButton}
                                            >
                                                View TAN
                                            </a>
                                        )}
                                    </div>

                                    {/* Certificate of Incorporation / Firm Registration */}
                                    <div className={styles.fieldRow}>
                                        <label className={styles.fieldLabel}>Certificate of Incorporation / Firm Registration
                                            <span className={styles.requiredSymbol}>*</span>
                                        </label>
                                        <input
                                            type="file"
                                             accept=".jpg,.jpeg,.png,.pdf"
                                            className={styles.fieldInput}
                                            onChange={(e) => handleDocumentChange("incorporation", e.target.files[0])}
                                            required
                                            readOnly={isReadOnly}
                                        />

                                        {documents.incorporation?.url && (
                                            <a
                                                href={documents.incorporation.url.startsWith("blob:")
                                                    ? documents.incorporation.url // local preview
                                                    : `${process.env.REACT_APP_API_BASE_URL}/${documents.incorporation.url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.viewButton}
                                            >
                                                View Certificate of Incorporation
                                            </a>
                                        )}
                                    </div>

                                    {/* TDS Declaration for Exemption */}
                                    <div className={styles.fieldRow}>
                                        <label className={styles.fieldLabel}>TDS Declaration for Exemption
                                            <span className={styles.requiredSymbol}>*</span>
                                        </label>
                                        <input
                                            type="file"
                                             accept=".jpg,.jpeg,.png,.pdf"
                                            className={styles.fieldInput}
                                            onChange={(e) => handleDocumentChange("tds", e.target.files[0])}
                                            required
                                            readOnly={isReadOnly}
                                        />

                                        {documents.tds?.url && (
                                            <a
                                                href={documents.tds.url.startsWith("blob:")
                                                    ? documents.tds.url // local preview
                                                    : `${process.env.REACT_APP_API_BASE_URL}/${documents.tds.url}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.viewButton}
                                            >
                                                View TDS Declaration
                                            </a>
                                        )}
                                    </div>

                                </div>
                            )}

                            {/* STEP 6: Declaration & Confidentiality */}
                            {currentPage === 5 && (
                                <div className={styles.page}>
                                    <h3>Declaration</h3>
                                    <p className={styles.paragraph}>
                                        I/We <span className={styles.requiredSymbol}>*</span>{" "}
                                        <input
                                            type="text"
                                            className={styles.inlineInput}
                                            value={declarationInfo?.name}
                                            onChange={handleDeclarationChange}
                                            placeholder="Your Name"
                                            name="name"
                                            required
                                            readOnly={isReadOnly}
                                        />{" "}
                                        of <span className={styles.requiredSymbol}>*</span>{" "}
                                        <input
                                            type="text"
                                            value={declarationInfo.organization}
                                            className={styles.inlineInput}
                                            onChange={handleDeclarationChange}
                                            placeholder="Your Organization"
                                            name="organization"
                                            required
                                            readOnly={isReadOnly}
                                        />{" "}
                                        designated as <span className={styles.requiredSymbol}>*</span>{" "}
                                        <input
                                            type="text"
                                            className={styles.inlineInput}
                                            value={declarationInfo.designation}
                                            onChange={handleDeclarationChange}
                                            placeholder="Designation"
                                            name="designation"
                                            required
                                            readOnly={isReadOnly}
                                        />{" "}
                                        declare the information provided in this document is true and accurate in
                                        all respects and that we have performed such procedures and inquiries as
                                        necessary to verify the answers; and
                                    </p>

                                    <h3>Confidentiality and Data Privacy</h3>
                                    <p className={styles.paragraph}>
                                        I/We <span className={styles.requiredSymbol}>*</span>{" "}
                                        <input
                                            type="text"
                                            value={declarationInfo.confidentiality_name}
                                            className={styles.inlineInput}
                                            onChange={handleDeclarationChange}
                                            placeholder="Your Name"
                                            name="confidentiality_name"
                                            required
                                            readOnly={isReadOnly}
                                        />{" "}
                                        of <span className={styles.requiredSymbol}>*</span>{" "}
                                        <input
                                            type="text"
                                            className={styles.inlineInput}
                                            value={declarationInfo.confidentiality_org}
                                            onChange={handleDeclarationChange}
                                            placeholder="Organization"
                                            name="confidentiality_org"
                                            required
                                            readOnly={isReadOnly}
                                        />{" "}
                                        designated as <span className={styles.requiredSymbol}>*</span>{" "}
                                        <input
                                            type="text"
                                            className={styles.inlineInput}
                                            value={declarationInfo?.confidentiality_designation}
                                            onChange={handleDeclarationChange}
                                            placeholder="Designation"
                                            name="confidentiality_designation"
                                            required
                                            readOnly={isReadOnly}
                                        />{" "}
                                        acknowledge that the contents of this document and of any of the documents
                                        enclosed hereto may be shared, used, and stored by ABGT and its affiliates
                                        worldwide in connection with the administration of the parties'
                                        relationship or as otherwise required by applicable laws or regulations.
                                    </p>

                                    <div className={styles.fieldRow}>
                                        <label className={styles.fieldLabel}>Authorized Signatory
                                            <span className={styles.requiredSymbol}>*</span>
                                        </label>
                                        <input type="file"
                                            className={styles.fieldInput}
                                            accept=".pdf,.jpg,.jpeg,.png"

                                            name="signedFile"
                                            onChange={handleDeclarationChange}
                                            required
                                            readOnly={isReadOnly}
                                        />
                                        {declarationInfo.signedFile && (
                                            <a
                                                href={typeof declarationInfo.signedFile === "object" &&
                                                    declarationInfo.signedFile.url?.startsWith("blob:")
                                                    ? declarationInfo.signedFile.url // local preview
                                                    : `${process.env.REACT_APP_API_BASE_URL}/${declarationInfo.signedFile}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={styles.viewButton}
                                            >
                                                View Signed Document
                                            </a>
                                        )}
                                    </div>

                                    <div className={styles.fieldRow}>
                                        <label className={styles.fieldLabel}>Title</label>
                                        <input type="text"
                                            className={styles.fieldInput}
                                            value={declarationInfo.title}
                                            onChange={handleDeclarationChange}
                                            placeholder="Title"
                                            name="title"
                                            required
                                            readOnly={isReadOnly}
                                        />
                                    </div>

                                    <div className={styles.fieldRow}>
                                        <label className={styles.fieldLabel}>Date
                                            <span className={styles.requiredSymbol}>*</span>
                                        </label>
                                        <input type="date"
                                            className={styles.fieldInput}
                                            value={declarationInfo.date}
                                            onChange={handleDeclarationChange}
                                            placeholder="Date"
                                            name="date"
                                            required
                                            readOnly={isReadOnly}
                                        />

                                    </div>

                                    <div className={styles.fieldRow}>
                                        <label className={styles.fieldLabel}>Place
                                            <span className={styles.requiredSymbol}>*</span>
                                        </label>
                                        <input type="text"
                                            className={styles.fieldInput}
                                            value={declarationInfo.place}
                                            onChange={handleDeclarationChange}
                                            placeholder="Place"
                                            name="place"
                                            required
                                            readOnly={isReadOnly}
                                        />
                                    </div>

                                </div>
                            )}
                            {/* 🔹 Dynamic Comments Section (for all steps) */}
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
                                    <span style={{ flexShrink: 0, fontWeight: 500 }}>Comments for</span>
                                    <span style={{ fontWeight: 500 }}>{stepLabels[currentPage]}</span>
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
                                            <th style={{ border: "1px solid #ddd", padding: "8px", color: "#000" }}>Comment</th>
                                            <th style={{ border: "1px solid #ddd", padding: "8px", color: "#000" }}>Commenter Name</th>
                                            <th style={{ border: "1px solid #ddd", padding: "8px", color: "#000" }}>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {/* ✅ Table rows change dynamically per step */}
                                        {commentHistory[stepLabels[currentPage]] &&
                                            commentHistory[stepLabels[currentPage]].length > 0 ? (
                                            commentHistory[stepLabels[currentPage]].map((item, index) => (
                                                <tr key={index}>
                                                    <td
                                                        style={{
                                                            border: "1px solid #ddd",
                                                            padding: "8px",
                                                            textAlign: "center",
                                                            color: "#000"
                                                        }}
                                                    >
                                                        {index + 1}
                                                    </td>
                                                    <td style={{ border: "1px solid #ddd", padding: "8px", color: "#000" }}>{item.comment}</td>
                                                    <td style={{ border: "1px solid #ddd", padding: "8px", color: "#000" }}>{item.commenter_name}</td>
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

                                <div
                                    className={styles.btnGroup}
                                    style={{
                                        display: "flex",
                                        justifyContent: currentPage === 0 ? "flex-end" : "space-between",
                                        marginTop: "20px",
                                    }}
                                >
                                    {/* 🔹 Previous button (always visible except first step) */}
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

                                    {/* 🔹 Middle or right-side buttons */}
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
                                                            case 5:
                                                                handleOpenModal();
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
                                                        padding: "8px 16px",
                                                        cursor: "pointer",
                                                        fontSize: "14px",
                                                    }}
                                                >
                                                    Submit
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        /* 🔹 Read-only mode: show only Next button (except on last step) */
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

                            <Modal
                                open={openConfirmModal}
                                onClose={handleCloseModal}
                                aria-labelledby="confirmation-modal-title"
                                aria-describedby="confirmation-modal-description"
                            >
                                <div
                                    style={{
                                        backgroundColor: "white",
                                        padding: "30px",
                                        borderRadius: "10px",
                                        width: "400px",
                                        margin: "100px auto",
                                        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                                        textAlign: "center",
                                    }}
                                >
                                    <h3 id="confirmation-modal-title" style={{ margin: "20px 0", color: "#000" }}>Confirm Submission</h3>
                                    <p id="confirmation-modal-description" style={{ margin: "20px 0", color: "#000", fontSize: "16px" }}>
                                        Once you click submit, you can’t edit the form again.
                                    </p>

                                    <div style={{ display: "flex", justifyContent: "space-around", marginTop: "20px" }}>
                                        <Button
                                            variant="outlined"
                                            onClick={handleCloseModal}
                                            style={{ width: "40%" }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleFinalSubmit}
                                            style={{ width: "40%", backgroundColor: "green" }}
                                            back
                                        >
                                            Confirm Submit
                                        </Button>

                                    </div>
                                </div>
                            </Modal>


                        </form>
                    </div>
                </div>
            </div>


        </Box>
    );
};

export default VmsRequest;
