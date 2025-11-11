import React from "react";
import { useState } from "react";
import styles from "./InstructionsStep.module.css";

const InstructionsStep = ({ firstTime, onProceed }) => {
  const [agreeInstructions, setAgreeInstructions] = useState(false);

  return (

    <div className={styles.instructionsWrapper}>
      <div className={styles.instructionsContainer}>
        <h2 className={styles.title}>Guidelines to Fill the Vendor Registration Form</h2>

        <div className={styles.scrollArea}>
          <h3>📘 <span className={styles.sectionTitle}>General Guidelines</span></h3>
          <ul>
            <li>👉 <strong>Read all instructions carefully</strong> before starting the form.</li>
            <li>Ensure all required <strong>documents and information</strong> are ready before you begin.</li>
            <li>Fields marked with <span className={styles.mandatory}>*</span> are <strong>mandatory</strong>.</li>
            <li>Upload only <strong>JPG, JPEG, PNG, or PDF</strong> formats.</li>
            <li>Maximum file size: <strong className={styles.alert}>5 MB</strong> for documents, and <strong className={styles.alert}>1 MB</strong> for signature/stamp.</li>
            <li>Use <strong>UPPERCASE letters</strong> for all codes like GSTIN, CIN, IFSC, and SWIFT.</li>
            <li>Double-check your entries before submitting — <strong>incorrect data may delay approval.</strong></li>
            <li>Signature must be on a <strong className={styles.highlight}>white background</strong> only.</li>
            <li>💻 Use a <strong>laptop or desktop</strong> for the best experience.</li>
          </ul>

          <h3>🧭 <span className={styles.sectionTitle}>Step-by-Step Instructions</span></h3>

          <h4>🔹 Step 1: Business Entity Details</h4>
          <ul>
            <li>Select your <strong>Business Type</strong> (Proprietorship, Partnership, Private Limited, LLP, NGO, etc.).</li>
            <li>Enter the <strong>Registration Number</strong> as per your entity type (e.g., CIN for companies, NGO Reg. No for NGOs).</li>
            <li>Provide complete <strong>Company Information</strong> – name, PAN, address, and contact details.</li>
            <li>Ensure your organization name matches your <strong>official registration documents.</strong></li>
          </ul>

          <h4>🔹 Step 2: MSME / UDYAM Details</h4>
          <ul>
            <li>Enter your <strong>MSME or UDYAM Registration Number</strong> if applicable.</li>
            <li>Upload the valid MSME/UDYAM certificate in the supported format.</li>
            <li>If not applicable, select or mention <strong>“Not Registered / Not Applicable.”</strong></li>
          </ul>

          <h4>🔹 Step 3: GST Information</h4>
          <ul>
            <li>Enter valid <strong>GSTIN</strong> as per your business registration.</li>
            <li>Upload the <strong>GST Certificate</strong> clearly showing GST number and business name.</li>
            <li>Provide your <strong>ITR Filed Date</strong> and <strong>Acknowledgement Number.</strong></li>
            <li>Select the relevant <strong>Financial Year</strong> from the dropdown (last 5 years available).</li>
            <li>Ensure your GST & ITR details are <strong>accurate and consistent</strong> with official records.</li>
          </ul>

          <h4>🔹 Step 4: Bank Details</h4>
          <ul>
            <li>Select <strong>Transaction Type:</strong> Domestic / International / Both.</li>
            <li>For Domestic → provide <strong>IFSC Code</strong>.</li>
            <li>For International → provide <strong>SWIFT Code</strong>.</li>
            <li>Enter accurate <strong>Account Name, Number, Bank Name,</strong> and <strong>Branch.</strong></li>
            <li>Upload a clear <strong>Cancelled Cheque Leaf</strong> (showing account details clearly).</li>
          </ul>

          <h4>🔹 Step 5: Documents and Attachments</h4>
          <ul>
            <li>Upload all required documents in <strong>JPG, JPEG, PNG, or PDF</strong> format.</li>
            <li>Each file must be under <strong className={styles.alert}>5 MB</strong>.</li>
            <li>Ensure the document names and scanned details are <strong>clearly visible and readable.</strong></li>
            <li>Mandatory uploads include:
              <ul>
                <li>PAN Card</li>
                <li>GST Certificate</li>
                <li>MSME / UDYAM Certificate (if applicable)</li>
                <li>TAN</li>
                <li>Certificate of Incorporation / Firm Registration</li>
                <li>TDS Declaration (if applicable)</li>
                <li>Cancelled Cheque Leaf</li>
              </ul>
            </li>
          </ul>

          <h4>🔹 Step 6: Declaration and Confidentiality</h4>
          <ul>
            <li>Read and confirm both Declaration and Confidentiality & Data Privacy Agreement.</li>
            <li>Fill Place, Date, and upload Signature & Company Stamp on white background.</li>
          </ul>

          <h3>🟢 <span className={styles.sectionTitle}>Before You Submit</span></h3>
          <ul>
            <li>Review all steps carefully before submission.</li>
            <li>Ensure all uploads, names, and numbers are correct and match your documents.</li>
            <li>Incomplete or incorrect details may result in rejection or delay.</li>
          </ul>
        </div>

        {/* ✅ Show checkbox + button only on first visit */}
        {firstTime && (
          <div className={styles.instructionsFooter}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={agreeInstructions}
                onChange={(e) => setAgreeInstructions(e.target.checked)}
              />{" "}
              I have read and understood the instructions.
            </label>

            <div className={styles.popupButtonRow}>
              <button
                className={styles.proceedButton}
                disabled={!agreeInstructions}
                onClick={() => {
                  localStorage.setItem("instructionsAccepted", "true");
                  onProceed();
                }}
              >
                Proceed to Form
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default InstructionsStep;
