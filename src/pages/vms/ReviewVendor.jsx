import React, {useEffect, useState} from "react";
import {Box} from "@mui/material";
import Header from "../../components/Header";
import styles from "./vms.module.css";
import {useNavigate} from "react-router-dom";
import {addCounterParty, getCounterPartyInfo} from "../../services/vms/counterPartyService";
import {addBranches, addMsmeDetails, getMsmeDetails} from "../../services/vms/msmeService";
import {addBankDetails, addComplianceDetails, getBankDetails} from "../../services/vms/bankDetailsService";
import {addFinancialDetails, addGstDetails, addNatureOfBusiness, getGstDetails} from "../../services/vms/gstService";
import {addDocuments, getDocumentDetails} from "../../services/vms/documentService";

import {addDeclarations, getDeclarations} from "../../services/vms/declarationService";
import {useParams} from "react-router-dom";
import {addComments, getComments} from "../../services/vms/commentsService";
import {getVendorId} from "../../services/vms/referenceIdService";
import {toast} from "react-hot-toast";


const ReviewVendor = () => {
    const [vendors, setVendors] = useState([]);
    const [selectedVendorId, setSelectedVendorId] = useState("");

    const [currentPage, setCurrentPage] = useState(0);
    const totalSteps = 6;

    const {reference_id} = useParams();
    const [selectedVendorReferenceId, setSelectedVendorReferenceId] = useState('');
    const navigate = useNavigate();

    const [vendorId, setVendorId] = useState('');

 

    useEffect(() => {
        const fetchVendorId = async () => {
            try {
                console.log("Fetching vendor ID for reference ID:", selectedVendorReferenceId);
                const response = await getVendorId(selectedVendorReferenceId);
                console.log("Vendor ID response:", response);

                if (response?.data?.vendor_id) {
                    console.log(response?.data?.vendor_id);
                    setVendorId(response?.data?.vendor_id);
                }else{
                    console.log("No reference id found");
                }
            } catch (err) {
                console.error("Failed to fetch reference id:", err);
            }
        };

        fetchVendorId();
    }, [selectedVendorReferenceId]);


    const handleVendorChange = (e) => {
    const vendorId = e.target.value;
    setSelectedVendorId(vendorId);

    const selectedVendor = vendors.find(v => String(v.id) === vendorId); // force type match
    if (selectedVendor) {
        const referenceId = selectedVendor.reference_id;
        setSelectedVendorReferenceId(referenceId);
        console.log("Selected Vendor Reference ID:", referenceId);
    }
};


    const stepLabels = [
        "Business Entity Details",
        "MSME",
        "GST",
        "Bank",
        "Documents",
        "Declaration",
    ];


    const [branchDetails, setBranchDetails] = useState([]);

    const handleAddBranchDetailClick = () => {
        if (branchDetails.length < 10) {
            setBranchDetails(prev => [
                ...prev,
                {branch_name: '', address: '', gstn_number: ''}
            ]);
        }
    };
    const handleFieldChange = (index, fieldName, value) => {
        setBranchDetails((prev) => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                [fieldName]: value,
            };
            return updated;
        });
    };


    const handleDeleteField = (indexToRemove) => {
        setBranchDetails(prev => prev.filter((_, index) => index !== indexToRemove));
    };
    
    const [goods, setGoods] = useState(['']);
  const [services, setServices] = useState(['']);
  const [goodsAndServices, setGoodsAndServices] = useState(['']);

 
   const handleAddField = (list, setList) => {
  if (list.length < 5) {
    setList([...list, ""]);
  }
};

const handleGoodsandServicesChange = (setList, index, value) => {
  setList((prev) => {
    const updated = [...prev];
    updated[index] = value;
    return updated;
  });
};

const handleDeletegoodsandservicesField = (list, setList, indexToDelete) => {
  const updatedList = [...list];
  updatedList.splice(indexToDelete, 1);
  setList(updatedList);
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

    const availableYears = generateYearRanges(2021, 50); // Generate 10 years

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

    // Nature value change
    const handleNatureChange = (field, value) => {
        setNatureOfBusiness(prev => ({
            ...prev,
            [field]: value
        }));
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
            [docType]: {file, url: null}
        }));
    };


    const handleDeclarationChange = (e) => {
        const {name, value, type, files} = e.target;

        if (type === 'file') {
            console.log("File selected:", files[0]);
            setDeclarationInfo((prev) => ({
                ...prev,
                [name]: files[0] || null,
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

 

  // ✅ Handle all input fields (including turnover validation)
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
    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const res = await getVendorCombo([
                    "id",
                    "reference_id",
                    "vendor_name",
                    "email",
                ]);
                const fetchedVendors = res.data.rfqs || [];
                setVendors(fetchedVendors);

                // Match vendor by reference_id
                const matchedVendor = fetchedVendors.find(
                    (v) => v.reference_id === reference_id
                );

                if (matchedVendor) {
                    setSelectedVendorId(matchedVendor.id); // set selected by ID
                } else {
                    navigate("/review-vendor");
                }
            } catch (err) {
                console.error("Failed to fetch vendors", err);
            }
        };

        fetchVendors();
    }, [reference_id]);


    const nextPage = () => {
        if (currentPage < totalSteps - 1) setCurrentPage(currentPage + 1);
    };
    const prevPage = () => {
        if (currentPage > 0) setCurrentPage(currentPage - 1);
    };


    // Step 0 : Comments
    const [comments, setComments] = useState({
        CompanyInfo: '',
        MSME: '',
        GST: '',
        Bank: '',
        Documents: '',
        Declaration: ''
    });


    const updateStepComment = (stepName, commentText) => {
        setComments((prev) => ({
            ...prev,
            [stepName]: commentText
        }));
    };

    useEffect(() => {
        const fetchExistingComments = async () => {
            try {
                const res = await getComments(vendorId);
                const dbComments = res.data.comments || [];

                const mapped = {};
                dbComments.forEach(c => {
                    mapped[c.step_name] = c.comment_text;
                });

                setComments(mapped);
            } catch (error) {
                console.error("Failed to load comments", error);
            }
        };

        fetchExistingComments();
    }, [vendorId]);


    const handleRejectOrSendBack = async () => {
        try {
            for (const [stepName, commentText] of Object.entries(comments)) {
                if (commentText.trim()) {
                    const payload = {
                        step_name: stepName,
                        comment_text: commentText
                    };
                    await addComments(vendorId, payload);
                }
            }

            // Now call your reject/send-back logic
            // await rejectVendor(vendorId); // Replace with your logic
            toast.success("Form rejected and comments submitted.");
        } catch (error) {
            console.error("Error submitting comments:", error);
            toast.error("Failed to submit comments.");
        }
    };


 const [businessDetails, setBusinessDetails] = useState({
    business_entity_type: '',
    cin: '',
    tan: '',
    registration_number: '',
    company_email: '',
    trade_license_number: '',
    country_of_origin: '',
    registration_as_per_certificate: '',
  });

  const handleBusinessDetailsChange = (e) => {
    const { name, value } = e.target;
    setBusinessDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
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

  const countries = [
    'India',
    'United States',
    'United Kingdom',
    'Germany',
    'France',
    'Canada',
    'Australia',
    'Singapore',
    'Japan',
    'China',
  ];

const selectedEntityType = businessDetails.business_entity_type;
  const showFullCompanyFields = companyTypesRequiringFullDetails.includes(selectedEntityType);
  const showBasicRegistrationField = entitiesRequiringBasicRegistration.includes(selectedEntityType);

    // Step 1: Company Info
    const [companyInfo, setCompanyInfo] = useState({
        full_registered_name: "",
        business_entity_type: "",
        trading_name: "",
        company_email: "",
        telephone: "",
        registered_address: "",
        business_address: "",
        contact_person_details: "",
        website: "",
        country_of_incorporation: "",
        trade_license_number: "",
        cin_number: "",
        pan_number: "",
        tan_number: "",
        gst_vat_number: "",
        accounts_manager_name: "",
        accounts_manager_contact_no: "",
        accounts_manager_email: "",
    });


    useEffect(() => {
        const fetchCounterParty = async () => {
            try {
                const response = await getCounterPartyInfo(vendorId); // 👈 pass correct ID
                if (response?.data) {
                    setCompanyInfo((prev) => ({
                        ...prev,
                        ...response?.data, // fill with API values
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch counterparty info:", err);
            }
        };

        fetchCounterParty();
    }, [vendorId]);

  

    const handleCompanyInfoChange = (e) => {
        const {name, value} = e.target;
        setCompanyInfo((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // STEP 2: MSME and Branch details
    const [msmeInfo, setMsmeInfo] = useState({
        registered_under_msme: "",
        udyam_registration_number: "",
        category: "",
    });

    useEffect(() => {
        const fetchMsme = async () => {
            try {
                const response = await getMsmeDetails(7); // 👈 pass correct vendor_id
                if (response?.data?.msme) {
                    setMsmeInfo((prev) => ({
                        ...prev,
                        ...response?.data?.msme, // fill with API values
                    }));
                }

                if (response?.data?.branches?.length) {
                    // Normalize data to ensure no undefined values
                    const branches = response?.data?.branches?.map(branch => ({
                        branch_name: branch.branch_name || "",
                        address: branch.address || "",
                        gstn_number: branch.gstn_number || "",
                    }));
                    setBranchDetails(branches);
                    console.log("Branches set:", branches);
                }

            } catch (err) {
                console.error("Failed to fetch MSME info:", err);
            }
        };

        fetchMsme();
    }, []);
    const handleMsmeChange = (e) => {
        const {name, value} = e.target;
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

            const branchPayload = {
                type: "branch",
                branches: branchDetails, // already in correct format
            };

            console.log(msmePayload);
            console.log(branchPayload);
            await addMsmeDetails(vendorId, msmePayload); // vendor_id hardcoded as 3 (replace with dynamic)
            await addBranches(vendorId, branchPayload);
            alert("Step 2 saved successfully!");
            nextPage();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Failed to save Step 2");
        }
    };


    // STEP 3: Goods/Services and GST Information

    const [natureOfBusiness, setNatureOfBusiness] = useState({
        trading_entity: '',
        end_use: '',
        manufacturer: '',
        service_provider: '',
        third_party_payer: '',
        others: ''
    });

const numberedStates = [
  "1",  "2",  "3",  "4",  "5",  "6",  "7",
  "8",  "9",  "10", "11", "12", "13", "14",
  "15", "16", "17", "18", "19", "20", "21",
  "22", "23", "24", "25", "26", "27", "28"
];

const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar",
  "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra",
  "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

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

const handleInputChange = (index, field, value) => {
  const updated = [...formData];
  updated[index][field] = value;
  setgstFormData(updated);
};

const indianStates1 = [
  "Andaman & Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh",
  "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra & Nagar Haveli",
  "Daman & Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jammu & Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh",
  "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Other Territory", "Puducherry",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttarakhand", "Uttar Pradesh", "West Bengal"
];
    useEffect(() => {
        const fetchGstDetails = async () => {
            try {
                const response = await getGstDetails(8);

             
                if (response?.data?.nature) {
                    setNatureOfBusiness((prev) => ({
                        ...prev,
                        ...response?.data?.nature,
                    }));
                }
                console.log(response?.data);
                if (response?.data?.financials?.length) {
                    const financialData = response?.data?.financials.map(f => ({
                        year: f.fin_year,
                        total_sales_volume: f.total_sales_volume || "",
                        total_sales_amount: f.total_sales_amount || "",
                        export_sales_volume: f.export_sales_volume || "",
                        export_sales_amount: f.export_sales_amount || "",
                        file: f.financial_report_path || null,

                    }));
                    setYearlyData(financialData);
                    console.log("financial data" + yearlyData);
                }

            } catch (err) {
                console.error("Failed to fetch GST info:", err);
            }
        };

        fetchGstDetails();
    }, []);


    const handleSaveGstDetails = async () => {
        try {
            
           
           

            // 2️⃣ Save Financials
            for (const entry of yearlyData) {
                const formData = new FormData();
                formData.append('fin_year', entry.year);
                formData.append('total_sales_volume', entry.total_sales_volume || '');
                formData.append('total_sales_amount', entry.total_sales_amount || '');
                formData.append('export_sales_volume', entry.export_sales_volume || '');
                formData.append('export_sales_amount', entry.export_sales_amount || '');
                formData.append('financial_report', entry.file);

                if (!entry.file) {
                    alert(`Please upload financial report for year ${entry.year}`);
                    return;
                }

                await addFinancialDetails(vendorId, formData);
            }

            // 3️⃣ Save Nature of Business
            await addNatureOfBusiness(vendorId, natureOfBusiness);

            alert("Step 3 saved successfully!");
            nextPage();

        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Failed to save GST details");
        }
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
        involves_third_party: false,
        subcontractor_in_sanctioned_country: false,
    });

    useEffect(() => {
        const fetchBankDetails = async () => {
            try {
                const response = await getBankDetails(8); // 👈 pass correct vendor_id
                if (response?.data?.bank && response?.data?.compliance) {
                    console.log("bank and compliance data are present");
                    console.log(response?.data?.bank);
                    setBankInfo((prev) => ({
                        ...prev,
                        ...response?.data?.bank,
                        ...{
                            involves_third_party: response?.data?.compliance?.involves_third_party === 1,
                            subcontractor_in_sanctioned_country: response?.data?.compliance?.subcontractor_in_sanctioned_country === 1,
                        }
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch bank and compliance details:", err);
            }
        };

        fetchBankDetails();
    }, [vendorId]);

    const handleBankDetailsChange = (e) => {
        const {name, value} = e.target;

        const booleanFields = ['involves_third_party', 'subcontractor_in_sanctioned_country'];
        const parsedValue = booleanFields.includes(name) ? value === 'true' : value;

        setBankInfo((prev) => ({
            ...prev,
            [name]: parsedValue,
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
                involves_third_party: bankInfo.involves_third_party === "true" || bankInfo.involves_third_party === "Yes",
                subcontractor_in_sanctioned_country: bankInfo.subcontractor_in_sanctioned_country === "true" || bankInfo.subcontractor_in_sanctioned_country === "Yes",

            };

            console.log(bankPayload);
            console.log(compliancePayload);
            await addBankDetails(vendorId, bankPayload); // vendor_id hardcoded as 3 (replace with dynamic)
            await addComplianceDetails(vendorId, compliancePayload);
            alert("Step 4 saved successfully!");
            nextPage();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Failed to save Step 4");
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
                const response = await getDocumentDetails(8); // API: GET /documents?vendor_id=4
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
    }, [vendorId]);


    const handleSaveDocuments = async () => {
        try {
            const newFilesFormData = new FormData();

            const newFiles = Object.entries(documents).filter(([docType, value]) => value?.file);

            if (newFiles.length === 0) {
                alert("No new files to upload. Please continue.");
                nextPage();
                return;
            }

            for (const [docType, value] of newFiles) {
                newFilesFormData.append("files[]", value.file);
                newFilesFormData.append("doc_types[]", docType);
            }

            const response = await addDocuments(vendorId, newFilesFormData); // same endpoint

            if (response?.data?.message?.includes("success")) {
                alert("Documents saved successfully!");

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
            alert("Failed to upload documents. Please try again.");
        }
    };


    // Step 6: Declarations

    const [declarationInfo, setDeclarationInfo] = useState({
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


 useEffect(() => {
        const fetchDeclarations = async () => {
            try {
                const response = await getDeclarations(8);
                console.log("Fetched declarations:", response);

                if (response?.data && response?.data?.length > 0) {
                    const declaration = response?.data[0];
                    console.log("declaration:", declaration);

                    const mainMatch = declaration?.declaration_text?.match(
                        /I\/We\s+(.*?)\s+of\s+(.*?)\s+designated\s+as\s+(.*?)\s/i
                    );

                    const confMatch = declaration.confidentiality_ack?.match(
                        /I\/We\s+(.*?)\s+of\s+(.*?)\s+designated/i
                    );

                    setDeclarationInfo({
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
    }, [vendorId]);




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
            formData.append('signed_file', declarationInfo.signedFile);

            console.log('signedFile:', declarationInfo.signedFile);
            console.log('signedFile type:', typeof declarationInfo.signedFile);
            console.log('FormData preview:');

            console.log("signedFile:", declarationInfo.signedFile);
            console.log("signedFile instanceof File:", declarationInfo.signedFile instanceof File);

            for (let pair of formData.entries()) {
                console.log(pair[0], pair[1]);
            }

            await addDeclarations(vendorId, formData); // replace 4 with actual vendor_id

            alert("Step 5 submitted successfully!");
            nextPage(); // move to next step
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Failed to submit declaration");
        }
    };


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
                                    className={`${styles.tab} ${
                                        currentPage === index ? styles.activeTab : ""
                                    }`}
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
                                            </label>
                                            <input
                                                type="text"
                                                name="full_registered_name"
                                                value={companyInfo.full_registered_name}
                                                onChange={handleCompanyInfoChange}
                                                className={styles.fieldInput}
                                                readOnly
                                              
                                            />
                                        </div>

                                       <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Nature of Business Entity
                                            </label>
                                 <select
          name="business_entity_type"
          value={businessDetails.business_entity_type}
          onChange={handleBusinessDetailsChange}
          className={styles.fieldInput}
          disabled
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
                                                <option value="Non-Government Organization (NGO)">Non-Government Organization (NGO)</option>
                                            </select>
                                            </div>

                                            {/* Conditional Fields */}
         {showFullCompanyFields && (
        <>
          <div className={styles.fieldRow}>
            <label className={styles.fieldLabel}>Company Identification Number (CIN)</label>
            <input
              type="text"
              name="cin"
              value={businessDetails.cin}
              onChange={handleBusinessDetailsChange}
              className={styles.fieldInput}
              readOnly
            />
          </div>

          <div className={styles.fieldRow}>
            <label className={styles.fieldLabel}>TAN Number</label>
            <input
              type="text"
              name="tan"
              value={businessDetails.tan}
              onChange={handleBusinessDetailsChange}
              className={styles.fieldInput}
              readOnly
            />
          </div>

          <div className={styles.fieldRow}>
            <label className={styles.fieldLabel}>Company Registration Number</label>
            <input
              type="text"
              name="registration_number"
              value={businessDetails.registration_number}
              onChange={handleBusinessDetailsChange}
              className={styles.fieldInput}
              readOnly
            />
          </div>

          <div className={styles.fieldRow}>
            <label className={styles.fieldLabel}>Company Email</label>
            <input
              type="email"
              name="company_email"
              value={businessDetails.company_email}
              onChange={handleBusinessDetailsChange}
              className={styles.fieldInput}
              readOnly
            />
          </div>

          <div className={styles.fieldRow}>
            <label className={styles.fieldLabel}>Country of Origin of Incorporation</label>
            <select
              name="country_of_origin"
              value={businessDetails.country_of_origin}
              onChange={handleBusinessDetailsChange}
              className={styles.fieldInput}
              disabled
            >
              <option value="">-- Select Country --</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          
          <div className={styles.fieldRow}>
            <label className={styles.fieldLabel}>Trade License Number</label>
            <input
              type="text"
              name="trade_license_number"
              value={businessDetails.trade_license_number}
              onChange={handleBusinessDetailsChange}
              className={styles.fieldInput}
              readOnly
            />
          </div>
        </>
      )}

           {/* Non-company types: Registration Number as per incorporation certificate */}
      {showBasicRegistrationField && (
        <div className={styles.fieldRow}>
          <label className={styles.fieldLabel}>
            Registration Number (as per incorporation certificate)
          </label>
          <input
            type="text"
            name="registration_as_per_certificate"
            value={businessDetails.registration_as_per_certificate}
            onChange={handleBusinessDetailsChange}
            className={styles.fieldInput}
            readOnly
          />
        </div>
      )}


                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Trading Name
                                            </label>
                                            <input
                                                type="text"
                                                name="trading_name"
                                                value={companyInfo.trading_name}
                                                onChange={handleCompanyInfoChange}
                                                className={styles.fieldInput}
                                                readOnly
                                            />
                                        </div>

                                        

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Telephone Number</label>
                                            <input
                                                type="text"
                                                name="telephone"
                                                value={companyInfo.telephone}
                                                onChange={handleCompanyInfoChange}
                                                className={styles.fieldInput}
                                                readOnly
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Registered Address</label>
                                            <input
                                                type="text"
                                                name="registered_address"
                                                value={companyInfo.registered_address}
                                                onChange={handleCompanyInfoChange}
                                                className={styles.fieldInput}
                                                readOnly
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Business Address (if different)
                                            </label>
                                            <input
                                                type="text"
                                                name="business_address"
                                                value={companyInfo.business_address}
                                                onChange={handleCompanyInfoChange}
                                                className={styles.fieldInput}
                                                readOnly
                                            />
                                        </div>


                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Contact Person Phone Number
                                            </label>
                                            <input
                                                type="text"
                                                name="contact_person_phone"
                                                value={companyInfo.contact_person_details}
                                                onChange={handleCompanyInfoChange}
                                                className={styles.fieldInput}
                                                readOnly
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Contact Person Mail Id
                                            </label>
                                            <input
                                                type="text"
                                                name="contact_person_mail"
                                                value={companyInfo.contact_person_details}
                                                onChange={handleCompanyInfoChange}
                                                className={styles.fieldInput}
                                                readOnly
                                            />
                                        </div>


                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Website</label>
                                            <input
                                                type="text"
                                                name="website"
                                                value={companyInfo.website}
                                                onChange={handleCompanyInfoChange}
                                                className={styles.fieldInput}
                                                readOnly
                                            />
                                        </div>


                                
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Name of the Accounts Person</label>
                                            <input
                                                type="text"
                                                name="accounts_manager_name"
                                                value={companyInfo.accounts_manager_name}
                                                onChange={handleCompanyInfoChange}
                                                className={styles.fieldInput}
                                                readOnly
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Contact Details of Accounts
                                                Person</label>
                                            <input
                                                type="text"
                                                name="accounts_manager_contact_no"
                                                value={companyInfo.accounts_manager_contact_no}
                                                onChange={handleCompanyInfoChange}
                                                className={styles.fieldInput}
                                                readOnly
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Email Id of Accounts Person</label>
                                            <input
                                                type="email"
                                                name="accounts_manager_email"
                                                value={companyInfo.accounts_manager_email}
                                                onChange={handleCompanyInfoChange}
                                                className={styles.fieldInput}
                                                readOnly
                                            />
                                        </div>

                                        <div className="form-group mt-4">
                                            <label className={styles.fieldLabel} style={{ marginBottom: "10px", display: "block" }}>
                                                Comment for Company Info
                                                </label>
                                                                                        <textarea
                                                    className="form-control"
                                                    rows={5}   // 👈 increase number of rows (default is 2)
                                                    placeholder="Write a comment for Company Info"
                                                    value={comments['CompanyInfo']}
                                                    onChange={(e) => updateStepComment('CompanyInfo', e.target.value)}
                                                />
                                        </div>
                                        <div className={styles.btnGroup}>
                                            <button type="button" onClick={nextPage}>
                                                Next
                                            </button>
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
                                            </label>
                                            <select
                                                name="registered_under_msme"
                                                value={msmeInfo?.registered_under_msme}
                                                onChange={handleMsmeChange}
                                                className={styles.fieldInput}
                                                disabled
                                             
                                            >
                                                <option value="">Select</option>
                                                <option value="true">Yes</option>
                                                <option value="false">No</option>
                                            </select>
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Udyam Registration Number
                                            </label>
                                            <input
                                                type="text"
                                                name="udyam_registration_number"
                                                value={msmeInfo?.udyam_registration_number}
                                                onChange={handleMsmeChange}
                                                className={styles.fieldInput}
                                                readonly
                                            />
                                        </div>
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Category (Micro/Small/Medium)
                                            </label>
                                            <select
                                                name="category"
                                                value={msmeInfo?.category}
                                                onChange={handleMsmeChange}
                                                className={styles.fieldInput}
                                                disabled
                                            
                                            >
                                                <option value="">Select</option>
                                                <option value="Micro">Micro</option>
                                                <option value="Small">Small</option>
                                                <option value="Medium">Medium</option>
                                            </select>
                                        </div>


                                        {branchDetails.map((detail, index) => (
                                            <div key={index} className={styles.fieldGroup}>
                                                <div className={styles.fieldRow}>
                                                    <label className={styles.fieldLabel}>Branch Name</label>
                                                    <input
                                                        type="text"
                                                        name="branch_name"
                                                        className={styles.fieldInput}
                                                        value={detail?.branch_name}
                                                        
                                                        onChange={(e) =>
                                                            handleFieldChange(index, "branch_name", e.target.value)
                                                        }
                                                        readonly
                                                    />
                                                </div>

                                                <hr/>
                                            </div>
                                        ))}

                                        <div className="form-group mt-4">
                                            <label className={styles.fieldLabel} style={{ marginBottom: "10px", display: "block" }}>
                                            Comment for MSME</label>
                                            <textarea
                                                className="form-control"
                                                 rows={5} 
                                                placeholder={`Write a comment for MSME`}
                                                value={comments['MSME']}
                                                onChange={(e) => updateStepComment('MSME', e.target.value)}
                                            />
                                        </div>
                                        <div className={styles.btnGroup}>
                                            <button type="button" onClick={nextPage}>
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3: GST */}
                                {/* STEP 3: Goods and Services Supplied */}
                                {currentPage === 2 && (
                                    <div className={styles.page}>
                                        

                                            <div className={styles.fieldRow} >
                                                <label className={styles.fieldLabel}>Type of Counterparty Business</label>
                                                <select
                                                    name="businessType"
                                                    value={businessType}
                                                    onChange={handleBusinessTypeChange}
                                                    className={styles.fieldInput}
                                                    disabled
                                                >
                                                    <option value="">Select</option>
                                                    <option value="Trading entity">Trading entity</option>
                                                    <option value="End-Use">End-Use</option>
                                                    <option value="Manufacturer">Manufacturer</option>
                                                    <option value="Service provider">Service provider</option>
                                                    <option value="Third party payer/receiver of funds">Third party payer/receiver of funds</option>
                                                    <option value="Other">Other (please specify)</option>
                                                </select>

                                               {businessType === 'Other' && (
                                                    <input
                                                    type="text"
                                                    name="otherBusinessType"
                                                    value={otherBusinessType}
                                                    onChange={(e) => setOtherBusinessType(e.target.value)}
                                                    placeholder="Please specify other business type"
                                                    className={styles.fieldInput}
                                                    readonly
                                                    />
                                                )}
                                                </div>

                                                <h3>Details of the Supplies</h3>
  <div className={styles.goodsRow}>
  <label className={styles.goodsLabel}>Goods</label>
  <div className={styles.goodsGroup}>
    <div className={styles.inlineInputButton}>
      <input
        type="text"
        value={goods[0] || ""}
        onChange={(e) => handleGoodsandServicesChange(setGoods, 0, e.target.value)}
        className={styles.goodsInput}
        readonly
      />
      {goods.length < 5 && (
        <button
          type="button"
          onClick={() => handleAddField(goods, setGoods)}
          className={styles.goodsAddButton}
        >
          Add
        </button>
      )}
    </div>

    {goods.slice(1).map((value, index) => (
      <div key={index + 1} className={styles.inputWithDelete}>
        <input
          type="text"
          value={value}
          onChange={(e) => handleGoodsandServicesChange(setGoods, index + 1, e.target.value)}
          className={styles.goodsInput}
           readonly
        />
        <button
          type="button"
          onClick={() => handleDeletegoodsandservicesField(goods, setGoods, index + 1)}
          className={styles.deleteButton}
        >
          Delete
        </button>
      </div>
    ))}
  </div>
</div>


<div className={styles.servicesRow}>
  <label className={styles.servicesLabel}>Services</label>
  <div className={styles.servicesGroup}>
    <div className={styles.inlineInputButton}>
      <input
        type="text"
        value={services[0] || ""}
        onChange={(e) => handleGoodsandServicesChange(setServices, 0, e.target.value)}
        className={styles.servicesInput}
         readonly
      />
      {services.length < 5 && (
        <button
          type="button"
          onClick={() => handleAddField(services, setServices)}
          className={styles.servicesAddButton}
        >
          Add
        </button>
      )}
    </div>

    {services.slice(1).map((value, index) => (
      <div key={index + 1} className={styles.inputWithDelete}>
        <input
          type="text"
          value={value}
          onChange={(e) => handleGoodsandServicesChange(setServices, index + 1, e.target.value)}
          className={styles.servicesInput}
           readonly
        />
        <button
          type="button"
          onClick={() => handleDeletegoodsandservicesField(services, setServices, index + 1)}
          className={styles.deleteButton}
        >
          Delete
        </button>
      </div>
    ))}
  </div>
</div>

<div className={styles.goodsAndServicesRow}>
  <label className={styles.goodsAndServicesLabel}>Goods and Services</label>
  <div className={styles.goodsAndServicesGroup}>
    <div className={styles.inlineInputButton}>
      <input
        type="text"
        value={goodsAndServices[0] || ""}
        onChange={(e) => handleGoodsandServicesChange(setGoodsAndServices, 0, e.target.value)}
        className={styles.goodsAndServicesInput}
         readonly
      />
      {goodsAndServices.length < 5 && (
        <button
          type="button"
          onClick={() => handleAddField(goodsAndServices, setGoodsAndServices)}
          className={styles.goodsAndServicesAddButton}
        >
          Add
        </button>
      )}
    </div>

    {goodsAndServices.slice(1).map((value, index) => (
      <div key={index + 1} className={styles.inputWithDelete}>
        <input
          type="text"
          value={value}
          onChange={(e) =>
            handleGoodsandServicesChange(setGoodsAndServices, index + 1, e.target.value)
          }
          className={styles.goodsAndServicesInput}
           readonly
        />
        <button
          type="button"
          onClick={() =>
            handleDeletegoodsandservicesField(goodsAndServices, setGoodsAndServices, index + 1)
          }
          className={styles.deleteButton}
        >
          Delete
        </button>
      </div>
    ))}
  </div>
</div>

  

                                         <h3>GST Registrations</h3>
{/* Number selection */}
<div className={styles.fieldRow}>
  <label className={styles.fieldLabel}>Number of GST Registrations (max 28)</label>
  <select
    className={styles.fieldInput}
    value={count}
    onChange={handleCountChange}
    disabled
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
      <label className={styles.fieldLabel}>State Name</label>
      <select
        className={styles.fieldInput}
        value={item.state}
        onChange={(e) => handleInputChange(i, "state", e.target.value)}
        disabled
      >
        <option value="">Select State</option>
        {indianStates1.map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </select>
    </div>

    <div className={styles.fieldRow}>
      <label className={styles.fieldLabel}>GST Number (15 digits)</label>
      <input
        type="text"
        maxLength={15}
        className={styles.fieldInput}
        value={item.gstNumber}
        onChange={(e) =>
          handleInputChange(i, "gstNumber", e.target.value)
        }
        placeholder="Enter GSTIN"
        readonly
      />
    </div>

    <div className={styles.fieldRow}>
      <label className={styles.fieldLabel}>Registration Date</label>
      <input
        type="date"
        className={styles.fieldInput}
        value={item.regDate}
        onChange={(e) => handleInputChange(i, "regDate", e.target.value)}
        readonly
      />
    </div>
  </div>
))}




                                       {/* Registration Type Dropdown */}
                                        <div className={styles.fieldRow}>
                                        <label className={styles.fieldLabel}>
                                            Registration Type
                                        </label>
                                        <select
                                            name="registrationType"
                                            value={msmeInfo?.registrationType}
                                            onChange={handleMsmeChange}
                                            className={styles.fieldInput}
                                            disabled
                                        >
                                            <option value="">Select</option>
                                            <option value="Regular">Regular</option>
                                            <option value="Composition">Composition</option>
                                            <option value="Regular SEZ">Regular SEZ</option>
                                        </select>
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Periodicity of GSTR-1
                                            </label>
                                            <select
                                                name="gstr1Periodicity"
                                                value={msmeInfo?.gstr1Periodicity}
                                                onChange={handleMsmeChange}
                                                className={styles.fieldInput}
                                                disabled
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
          <td>Financial Year</td>
          <td>
            <select name="fy1" value={formData.fy1} onChange={handleChange}>
              <option value="">Select</option>
              {getFilteredYears("fy1").map((fy) => (
                <option key={fy} value={fy}>
                  {fy}
                </option>
              ))}
            </select>
          </td>

          <td>
            <select
              name="fy2"
              value={formData.fy2}
              onChange={handleChange}
              disabled={!formData.fy1}
            >
              <option value="">Select</option>
              {getFilteredYears("fy2").map((fy) => (
                <option key={fy} value={fy}>
                  {fy}
                </option>
              ))}
            </select>
          </td>

          <td>
            <select
              name="fy3"
              value={formData.fy3}
              onChange={handleChange}
              disabled={!formData.fy2}
            >
              <option value="">Select</option>
              {getFilteredYears("fy3").map((fy) => (
                <option key={fy} value={fy}>
                  {fy}
                </option>
              ))}
            </select>
          </td>
        </tr>

        {/* Turnover field — allows 0 and positive numbers */}
        <tr>
          <td>Turnover</td>
          {[1, 2, 3].map((i) => (
            <td key={i}>
              <input
                type="number"
                name={`turnover${i}`}
                value={formData[`turnover${i}`]}
                onChange={handleIncomeChange}
                min="0" // ✅ allows 0 and positive
                onWheel={(e) => e.target.blur()} // prevent scroll changing value
              />
            </td>
          ))}
        </tr>

        {/* ITR Status */}
        <tr>
          <td>Status of ITR filed (Yes/No)</td>
          {[1, 2, 3].map((i) => (
            <td key={i}>
              <select name={`itrStatus${i}`} value={formData[`itrStatus${i}`]} onChange={handleIncomeChange}>
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </td>
          ))}
        </tr>

        {/* ITR Acknowledgment */}
        <tr>
          <td>ITR Acknowledgment No.</td>
          {[1, 2, 3].map((i) => (
            <td key={i}>
              <input type="text" name={`ackNo${i}`} value={formData[`ackNo${i}`]} onChange={handleIncomeChange} />
            </td>
          ))}
        </tr>

        {/* Filed Date */}
        <tr>
          <td>ITR Filed Date</td>
          {[1, 2, 3].map((i) => (
            <td key={i}>
              <input type="date" name={`filedDate${i}`} value={formData[`filedDate${i}`]} onChange={handleIncomeChange} />
            </td>
          ))}
        </tr>
      </tbody>
    </table>
                                      
                                        {/* Counterparty Business */}
                                       

                                        <div className="form-group mt-4">
                                            <label className={styles.fieldLabel} style={{ marginBottom: "10px", display: "block" }}>Comment for GST</label>
                                            <textarea
                                                className="form-control"
                                                rows={5} 
                                                placeholder={`Write a comment for GST`}
                                                value={comments['GST']}
                                                onChange={(e) => updateStepComment('GST', e.target.value)}
                                                
                                            />
                                        </div>

                                        {/* Navigation Buttons */}

                                        <div className={styles.btnGroup}>
                                            <button type="button" onClick={nextPage}>
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}


                                {/* STEP 3: Banking & Further Information */}
                                {currentPage === 3 && (
                                    <div className={styles.page}>
                                        <h3>Banking Information</h3>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Account Holder’s Name</label>
                                            <input
                                                type="text"
                                                name="account_holder_name"
                                                value={bankInfo.account_holder_name}
                                                
                                                className={styles.fieldInput}
                                                readonly
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Bank Name</label>
                                            <input
                                                type="text"
                                                name="bank_name"
                                                value={bankInfo.bank_name}
                                             
                                                className={styles.fieldInput}
                                                readonly
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Bank Address</label>
                                            <input
                                                type="text"
                                                name="bank_address"
                                                value={bankInfo.bank_address}
                                           
                                                className={styles.fieldInput}
                                                readonly
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Country</label>
                                            <input
                                                type="text"
                                                name="country"
                                                value={bankInfo.country}
                                             
                                                className={styles.fieldInput}
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Account Number</label>
                                            <input
                                                type="text"
                                                name="account_number"
                                                value={bankInfo.account_number}
                                               
                                                className={styles.fieldInput}
                                                readonly
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>IFSC Code</label>
                                            <input
                                                type="text"
                                                name="ifsc_code"
                                                value={bankInfo.ifsc_code}
                                             
                                                className={styles.fieldInput}
                                                readonly
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>SWIFT Code</label>
                                            <input
                                                type="text"
                                                name="swift_code"
                                                value={bankInfo.swift_code}
                                              
                                                className={styles.fieldInput}
                                                readonly
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Beneficiary of the Account</label>
                                            <input
                                                type="text"
                                                name="beneficiary_name"
                                                value={bankInfo.beneficiary_name}
                                             
                                                className={styles.fieldInput}
                                                readonly
                                            />
                                        </div>

                                        <h3 className={styles.subHeading}>Further Information</h3>
                                        <p style={{color: "black"}}>
                                            Please answer the following questions (to the best of your knowledge):
                                        </p>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Will the proposed business involve a third party acting on your behalf
                                                (e.g., an intermediary or agent)?
                                            </label>
                                            <select
                                                name="involves_third_party"
                                                value={String(bankInfo.involves_third_party)}
                                          
                                                className={styles.fieldInput}
                                                disabled
                                            >
                                                <option value="">Select</option>
                                                <option value="true">Yes</option>
                                                <option value="false">No</option>
                                            </select>
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>
                                                Will you use a third party or subcontractor to act on your behalf or
                                                make/receive payments in relation to the proposed business relationship
                                                with any sanctioned country?
                                            </label>
                                            <select
                                                name="subcontractor_in_sanctioned_country"
                                                value={String(bankInfo.subcontractor_in_sanctioned_country)}
                                             
                                                className={styles.fieldInput}
                                                disabled
                                            >
                                                <option value="">Select</option>
                                                <option value="true">Yes</option>
                                                <option value="false">No</option>
                                            </select>
                                        </div>

                                        <div className="form-group mt-4">
                                            <label className={styles.fieldLabel} style={{ marginBottom: "10px", display: "block" }} >Comment for Bank</label>
                                            <textarea
                                                className="form-control"
                                                  rows={5}
                                                placeholder={`Write a comment for Bank`}
                                                value={comments['Bank']}
                                                onChange={(e) => updateStepComment('Bank', e.target.value)}
                                            />
                                        </div>

                                        <div className={styles.btnGroup}>
                                            <button type="button" onClick={nextPage}>
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}



                                {/* STEP 4: Documents to be enclosed */}
                                {currentPage === 4 && (
                                    <div className={styles.page}>
                                        <h3>Documents to be enclosed</h3>

                                        {/* PAN */}
                                        {/* PAN */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>PAN</label>
                                            <input
                                                type="file"
                                                className={styles.fieldInput}
                                                style={{display: "none"}}      // ✅ hidden input
                                            />
                                            {documents.pan?.url && (
                                                <a
                                                    href={`${process.env.REACT_APP_API_BASE_URL}/${documents.pan.url}`}
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
                                            <label className={styles.fieldLabel}>GSTIN</label>
                                            <input
                                                type="file"
                                                className={styles.fieldInput}
                                                style={{display: "none"}}
                                            />
                                            {documents.gstin?.url && (
                                                <a
                                                    href={`${process.env.REACT_APP_API_BASE_URL}/${documents.gstin.url}`}
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
                                            <label className={styles.fieldLabel}>MSME Certificate (if any)</label>
                                            <input
                                                type="file"
                                                className={styles.fieldInput}
                                                style={{display: "none"}}
                                            />
                                            {documents.msme?.url && (
                                                <a
                                                    href={`${process.env.REACT_APP_API_BASE_URL}/${documents.msme.url}`}
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
                                            <label className={styles.fieldLabel}>Cancelled Cheque Leaf</label>
                                            <input
                                                type="file"
                                                className={styles.fieldInput}
                                                style={{display: "none"}}
                                            />
                                            {documents.cheque?.url && (
                                                <a
                                                    href={`${process.env.REACT_APP_API_BASE_URL}/${documents.cheque.url}`}
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
                                            <label className={styles.fieldLabel}>TAN</label>
                                            <input
                                                type="file"
                                                className={styles.fieldInput}
                                                style={{display: "none"}}
                                            />
                                            {documents.tan?.url && (
                                                <a
                                                    href={`${process.env.REACT_APP_API_BASE_URL}/${documents.tan.url}`}
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
                                            <label className={styles.fieldLabel}>Certificate of Incorporation / Firm
                                                Registration</label>
                                            <input
                                                type="file"
                                                className={styles.fieldInput}
                                                style={{display: "none"}}
                                            />
                                            {documents.incorporation?.url && (
                                                <a
                                                    href={`${process.env.REACT_APP_API_BASE_URL}/${documents.incorporation.url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.viewButton}
                                                >
                                                    View Certificate of Incorporation / Firm Registration
                                                </a>
                                            )}
                                        </div>

                                        {/* TDS Declaration for Exemption */}
                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>TDS Declaration for Exemption</label>
                                            <input
                                                type="file"
                                                className={styles.fieldInput}
                                                style={{display: "none"}}
                                            />
                                            {documents.tds?.url && (
                                                <a
                                                    href={`${process.env.REACT_APP_API_BASE_URL}/${documents.tds.url}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className={styles.viewButton}
                                                >
                                                    View TDS Declaration
                                                </a>
                                            )}
                                        </div>

                                        <div className="form-group mt-4">
                                            <label className={styles.fieldLabel}  style={{ marginBottom: "10px", display: "block" }} >Comment for Documents</label>
                                            <textarea
                                                className="form-control"
                                                 rows={5}
                                                placeholder={`Write a comment for Documents`}
                                                value={comments['Documents']}
                                                onChange={(e) => updateStepComment('Documents', e.target.value)}
                                            />
                                        </div>

                                        <div className={styles.btnGroup}>

                                            <button type="button" onClick={nextPage}>
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}


                                {/* STEP 6: Declaration */}
                                {/* STEP 6: Declaration & Confidentiality */}
                                {currentPage === 5 && (
                                    <div className={styles.page}>
                                        <h3>Declaration</h3>
                                        <p className={styles.paragraph}>
                                            I/We{" "}
                                            <input
                                                type="text"
                                                className={styles.inlineInput}
                                                value={declarationInfo.name}
                                                name="name"
                                                placeholder="Your Name"
                                                
                                            />{" "}
                                            of{" "}
                                            <input
                                                type="text"
                                                className={styles.inlineInput}
                                                value={declarationInfo.organization}
                                                name="organization"
                                                placeholder="Your Organization"
                                             
                                            />{" "}
                                            designated as{" "}
                                            <input
                                                type="text"
                                                className={styles.inlineInput}
                                                value={declarationInfo.designation}
                                                name="designation"
                                                placeholder="Designation"
                                            
                                            />{" "}
                                            declare the information provided in this document is true and accurate in
                                            all respects and that we have performed such procedures and inquiries as
                                            necessary to verify the answers; and
                                        </p>

                                        <h3>Confidentiality and Data Privacy</h3>
                                        <p className={styles.paragraph}>
                                            I/We{" "}
                                            <input
                                                type="text"
                                                value={declarationInfo.confidentiality_name}
                                                className={styles.inlineInput}
                                                name="confidentiality_name"
                                                placeholder="Your Name"
                                               
                                            />{" "}
                                            of{" "}
                                            <input
                                                type="text"
                                                className={styles.inlineInput}
                                                value={declarationInfo.confidentiality_org}
                                                name="confidentiality_org"
                                                placeholder="Organization"
                                               
                                            />{" "}
                                            designated as{" "}
                                            <input
                                                type="text"
                                                className={styles.inlineInput}
                                                value={declarationInfo.confidentiality_designation}
                                                name="confidentiality_designation"
                                                placeholder="Designation"
                                             
                                            />{" "}
                                            acknowledge that the contents of this document and of any of the documents
                                            enclosed hereto may be shared, used, and stored by ABGT and its affiliates
                                            worldwide in connection with the administration of the parties'
                                            relationship or as otherwise required by applicable laws or regulations.
                                        </p>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Authorized Signatory</label>

                                            {/* Hidden file input */}
                                            <input
                                                type="file"
                                                className={styles.fieldInput}
                                                style={{display: "none"}}      // ✅ completely hidden
                                            />

                                            {declarationInfo.signedFile && (
                                            <a
                                                href={`${process.env.REACT_APP_API_BASE_URL}/${declarationInfo.signedFile}`}
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
                                                  
                                            />
                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Date</label>
                                            <input type="date"
                                                   className={styles.fieldInput}
                                                   value={declarationInfo.date}
                                                   onChange={handleDeclarationChange}
                                                   placeholder="Date"
                                                   name="date"
                                                  
                                            />

                                        </div>

                                        <div className={styles.fieldRow}>
                                            <label className={styles.fieldLabel}>Place</label>
                                            <input type="text"
                                                   className={styles.fieldInput}
                                                   value={declarationInfo.place}
                                                   onChange={handleDeclarationChange}
                                                   placeholder="Place"
                                                   name="place"
                                                 
                                            />
                                        </div>

                                        <div className="form-group mt-4">
                                            <label className={styles.fieldLabel} style={{ marginBottom: "10px", display: "block" }} >Comment for Declaration</label>
                                            <textarea
                                                className="form-control"
                                               rows={5}
                                                placeholder={`Write a comment for Declaration`}
                                                value={comments['Declaration']}
                                                onChange={(e) => updateStepComment('Declaration', e.target.value)}
                                            />
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            gap: '8px',          // small gap between buttons
                                            marginTop: '12px'
                                        }}>
                                            <button
                                                type="button"
                                                style={{
                                                    padding: '6px 14px',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    color: '#fff',
                                                    fontSize: '14px',
                                                    backgroundColor: '#6c757d',   // Previous (gray)
                                                    cursor: 'pointer'
                                                }}
                                                onClick={prevPage}
                                            >
                                                Previous
                                            </button>

                                            <button
                                                type="button"
                                                style={{
                                                    padding: '6px 14px',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    color: '#fff',
                                                    fontSize: '14px',
                                                    backgroundColor: '#28a745',   // Submit (green)
                                                    cursor: 'pointer'
                                                }}
                                                //onClick={handleSubmit}
                                            >
                                                Submit
                                            </button>

                                            <button
                                                type="button"
                                                style={{
                                                    padding: '8px 16px',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    color: '#fff',
                                                    fontSize: '14px',
                                                    backgroundColor: '#17a2b8',   // Send Back (teal/blue)
                                                    cursor: 'pointer'
                                                }}
                                                //onClick={handleSendBack}
                                            >
                                                Send Back
                                            </button>

                                            <button
                                                type="button"
                                                style={{
                                                    padding: '6px 14px',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    color: '#fff',
                                                    fontSize: '14px',
                                                    backgroundColor: '#dc3545',   // Reject (red)
                                                    cursor: 'pointer'
                                                }}
                                                // onClick={handleReject}
                                            >
                                                Reject
                                            </button>
                                        </div>

                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            
    
        </Box>
    );
};

export default ReviewVendor;
