import React, { useState } from "react";
import { FaFilePdf, FaSpinner } from "react-icons/fa";

const StructuredPDFButton = ({ studentData, grades, absences, teachers }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState(null);
  
  const handleSavePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Load required libraries with script tags if not already loaded
      await loadJsPdfLibraries();
      
      // Create filename
      const today = new Date();
      const fileName = `${studentData?.name?.replace(/\s+/g, '_') || 'Student'}_Academic_Report_${
        today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${
        today.getDate().toString().padStart(2, '0')
      }.pdf`;
      
      // Get jsPDF from the global scope
      const { jsPDF } = window.jspdf;
      
      // Create new PDF document
      const doc = new jsPDF();
      
      // Check if autotable is properly loaded
      if (typeof doc.autoTable !== 'function') {
        throw new Error("PDF library not properly loaded. Please refresh and try again.");
      }
      
      // Set document properties
      doc.setProperties({
        title: `Academic Report - ${studentData?.name || 'Student'}`,
        subject: 'Academic Performance Report',
        author: 'School Management System',
        creator: 'School Portal'
      });
      
      // Get current date for the report
      const dateString = today.toLocaleDateString();
      
      // Add header with school info and logo
      doc.setFontSize(20);
      doc.setTextColor(44, 62, 80); // Dark blue
      doc.text('Academic Performance Report', 105, 20, { align: 'center' });
      
      // Student information section
      doc.setFontSize(12);
      doc.setTextColor(52, 73, 94); // Slate
      doc.text(`Student: ${studentData?.name || 'N/A'}`, 15, 40);
      doc.text(`Class: ${studentData?.className || 'N/A'}`, 15, 48);
      doc.text(`Date Generated: ${dateString}`, 15, 56);
      doc.text(`School Year: ${today.getFullYear()}`, 15, 64);
      
      // Performance summary section
      doc.setFillColor(241, 196, 15); // Yellow background
      doc.setDrawColor(243, 156, 18); // Orange border
      doc.setTextColor(41, 128, 185); // Blue text
      doc.roundedRect(15, 75, 180, 30, 3, 3, 'FD');
      
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80); // Dark blue
      doc.text('Performance Summary', 105, 85, { align: 'center' });
      
      // Calculate GPA
      const calculateGPA = (gradesList) => {
        if (!gradesList || !gradesList.length) return 0;
        const sum = gradesList.reduce((acc, curr) => acc + curr.grade, 0);
        return (sum / gradesList.length).toFixed(2);
      };
      
      // Display summary metrics
      doc.setFontSize(12);
      doc.text(`Overall GPA: ${calculateGPA(grades)} / 10`, 45, 95);
      doc.text(`Total Absences: ${absences.total}`, 145, 95); // Positioned inside the box
      
      // Add grades table
      if (grades && grades.length > 0) {
        doc.setFontSize(14);
        doc.text('Grade History', 105, 120, { align: 'center' });
        
        // Prepare data for the table
        const tableHeaders = [['Subject', 'Date', 'Grade', 'Teacher']];
        
        const tableData = grades.map(grade => {
          // Find teacher for this subject
          const teacher = teachers.find(t => t.subject === grade.subject);
          
          return [
            grade.subject || 'N/A',
            new Date(grade.sessionDate).toLocaleDateString(),
            // Ensure we only use the number value, not a string that might duplicate
            parseInt(grade.grade).toString(),
            teacher?.name || 'N/A'
          ];
        });
        
        // Create the table - simple version without custom formatting
        doc.autoTable({
          head: tableHeaders,
          body: tableData,
          startY: 125,
          theme: 'grid',
          styles: {
            fontSize: 10,
            cellPadding: 3,
            lineColor: [189, 195, 199],
            lineWidth: 0.2,
          },
          headStyles: {
            fillColor: [52, 152, 219],
            textColor: 255,
            fontStyle: 'bold',
          },
          columnStyles: {
            2: { // Grade column
              halign: 'center',
              cellWidth: 20,
              fontStyle: 'bold'
            }
          }
        });
        
        // Get last auto table ended position
        const finalY = doc.lastAutoTable?.finalY || 150;
        
        // Add footer with page numbers
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(10);
          doc.setTextColor(128, 128, 128);
          doc.text(
            `Page ${i} of ${pageCount}`, 
            doc.internal.pageSize.width / 2, 
            doc.internal.pageSize.height - 10, 
            { align: 'center' }
          );
        }
      }
      
      // Save the PDF
      doc.save(fileName);
      
      setNotification({
        type: 'success',
        message: `PDF saved as "${fileName}"`
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setNotification({
        type: 'error',
        message: error.message || 'Failed to generate PDF. Please try again.'
      });
    } finally {
      setIsGenerating(false);
      
      // Clear notification after 5 seconds
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  // Helper function to dynamically load jsPDF libraries
  const loadJsPdfLibraries = () => {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (window.jspdf && window.jspdf.jsPDF) {
        resolve();
        return;
      }

      // Load jsPDF script
      const jsPdfScript = document.createElement('script');
      jsPdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      jsPdfScript.async = true;
      
      // Load autoTable plugin
      const autoTableScript = document.createElement('script');
      autoTableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js';
      autoTableScript.async = true;
      
      // Handle loading completion
      let loadedCount = 0;
      const handleLoad = () => {
        loadedCount++;
        if (loadedCount === 2) {
          // Both scripts loaded
          if (window.jspdf && window.jspdf.jsPDF) {
            resolve();
          } else {
            reject(new Error("Failed to load PDF libraries properly"));
          }
        }
      };
      
      // Handle errors
      const handleError = () => {
        reject(new Error("Failed to load PDF generation libraries"));
      };
      
      jsPdfScript.onload = handleLoad;
      jsPdfScript.onerror = handleError;
      
      autoTableScript.onload = handleLoad;
      autoTableScript.onerror = handleError;
      
      // Add scripts to document
      document.head.appendChild(jsPdfScript);
      document.head.appendChild(autoTableScript);
    });
  };
  
  return (
    <div className="w-full">
      <button 
        onClick={handleSavePDF}
        disabled={isGenerating}
        className="w-full flex items-center justify-center space-x-2 bg-secondary text-white py-2 px-4 rounded-lg hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <FaSpinner className="animate-spin mr-2" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <FaFilePdf className="mr-2" />
            <span>Save as PDF</span>
          </>
        )}
      </button>
      
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed bottom-4 right-4 max-w-md z-50 rounded-lg shadow-lg p-4 flex items-start space-x-4 ${
          notification.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
            notification.type === "success" ? "bg-green-200" : "bg-red-200"
          }`}>
            {notification.type === "success" ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
            )}
          </div>
          <div className="flex-1 pt-1">
            <p className="text-sm font-medium">
              {notification.message}
            </p>
          </div>
          <button 
            className="flex-shrink-0 ml-1 text-gray-400 hover:text-gray-600"
            onClick={() => setNotification(null)}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

export default StructuredPDFButton;