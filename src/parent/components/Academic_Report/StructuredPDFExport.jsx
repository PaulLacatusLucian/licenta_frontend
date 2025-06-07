import React, { useState } from "react";
import { FaFilePdf, FaSpinner } from "react-icons/fa";
import { useTranslation } from 'react-i18next';

const StructuredPDFButton = ({ studentData, grades, absences, teachers }) => {
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Funktion zur Übersetzung von Fächern
  const getTranslatedSubject = (subject) => {
    if (subject && t(`admin.teachers.subjects.list.${subject}`) !== `admin.teachers.subjects.list.${subject}`) {
      return t(`admin.teachers.subjects.list.${subject}`);
    }
    return subject || '';
  };
  
  const handleSavePDF = async () => {
    setIsGenerating(true);
    
    try {
      // Lade erforderliche Bibliotheken mit Script-Tags falls nicht bereits geladen
      await loadJsPdfLibraries();
      
      // Erstelle Dateinamen
      const today = new Date();
      const fileName = `${studentData?.name?.replace(/\s+/g, '_') || 'Student'}_${t('parent.academicReport.pdf.fileNamePart')}_${
        today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${
        today.getDate().toString().padStart(2, '0')
      }.pdf`;
      
      // Hole jsPDF aus dem globalen Scope
      const { jsPDF } = window.jspdf;
      
      // Erstelle neues PDF-Dokument
      const doc = new jsPDF();
      
      // Überprüfe ob autotable richtig geladen ist
      if (typeof doc.autoTable !== 'function') {
        throw new Error(t('parent.academicReport.pdf.libraryError'));
      }
      
      // Setze Dokumenteigenschaften
      doc.setProperties({
        title: `${t('parent.academicReport.pdf.documentTitle')} - ${studentData?.name || 'Student'}`,
        subject: t('parent.academicReport.pdf.documentSubject'),
        author: t('parent.academicReport.pdf.author'),
        creator: t('parent.academicReport.pdf.creator')
      });
      
      // Hole aktuelles Datum für den Bericht
      const dateString = today.toLocaleDateString();
      
      // Füge Header mit Schulinformationen und Logo hinzu
      doc.setFontSize(20);
      doc.setTextColor(44, 62, 80); // Dunkelblau
      doc.text(t('parent.academicReport.pdf.title'), 105, 20, { align: 'center' });
      
      // Schülerinformations-Bereich
      doc.setFontSize(12);
      doc.setTextColor(52, 73, 94); // Schiefer
      doc.text(`${t('parent.academicReport.pdf.student')}: ${studentData?.name || t('common.notAvailable')}`, 15, 40);
      doc.text(`${t('parent.academicReport.pdf.class')}: ${studentData?.className || t('common.notAvailable')}`, 15, 48);
      doc.text(`${t('parent.academicReport.pdf.dateGenerated')}: ${dateString}`, 15, 56);
      doc.text(`${t('parent.academicReport.pdf.schoolYear')}: ${today.getFullYear()}`, 15, 64);
      
      // Leistungszusammenfassungs-Bereich
      doc.setFillColor(241, 196, 15); // Gelber Hintergrund
      doc.setDrawColor(243, 156, 18); // Oranger Rand
      doc.setTextColor(41, 128, 185); // Blauer Text
      doc.roundedRect(15, 75, 180, 30, 3, 3, 'FD');
      
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80); // Dunkelblau
      doc.text(t('parent.academicReport.pdf.performanceSummary'), 105, 85, { align: 'center' });
      
      // Berechne Notendurchschnitt
      const calculateGPA = (gradesList) => {
        if (!gradesList || !gradesList.length) return 0;
        const sum = gradesList.reduce((acc, curr) => acc + curr.grade, 0);
        return (sum / gradesList.length).toFixed(2);
      };
      
      // Zeige Zusammenfassungsmetriken
      doc.setFontSize(12);
      doc.text(`${t('parent.academicReport.pdf.overallGPA')}: ${calculateGPA(grades)} / 10`, 45, 95);
      doc.text(`${t('parent.academicReport.pdf.totalAbsences')}: ${absences.total}`, 145, 95); // Positioniert innerhalb der Box
      
      // Füge Notentabelle hinzu
      if (grades && grades.length > 0) {
        doc.setFontSize(14);
        doc.text(t('parent.academicReport.pdf.gradeHistory'), 105, 120, { align: 'center' });
        
        // Bereite Daten für die Tabelle vor
        const tableHeaders = [[
          t('parent.academicReport.pdf.table.subject'),
          t('parent.academicReport.pdf.table.date'),
          t('parent.academicReport.pdf.table.grade'),
          t('parent.academicReport.pdf.table.teacher')
        ]];
        
        const tableData = grades.map(grade => {
          // Finde Lehrer für dieses Fach
          const teacher = teachers.find(t => t.subject === grade.subject);
          
          return [
            getTranslatedSubject(grade.subject) || t('common.notAvailable'),
            new Date(grade.sessionDate).toLocaleDateString(),
            // Stelle sicher, dass wir nur den Zahlenwert verwenden
            parseInt(grade.grade).toString(),
            teacher?.name || t('common.notAvailable')
          ];
        });
        
        // Erstelle die Tabelle - einfache Version ohne benutzerdefinierte Formatierung
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
            2: { // Notenspalte
              halign: 'center',
              cellWidth: 20,
              fontStyle: 'bold'
            }
          }
        });
        
        // Hole letzte Auto-Tabellen-Endposition
        const finalY = doc.lastAutoTable?.finalY || 150;
        
        // Füge Fußzeile mit Seitenzahlen hinzu
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          doc.setFontSize(10);
          doc.setTextColor(128, 128, 128);
          doc.text(
            t('parent.academicReport.pdf.pageInfo', { current: i, total: pageCount }), 
            doc.internal.pageSize.width / 2, 
            doc.internal.pageSize.height - 10, 
            { align: 'center' }
          );
        }
      }
      
      // Speichere das PDF
      doc.save(fileName);
      
      setNotification({
        type: 'success',
        message: t('parent.academicReport.pdf.savedAs', { fileName })
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setNotification({
        type: 'error',
        message: error.message || t('parent.academicReport.pdf.generateError')
      });
    } finally {
      setIsGenerating(false);
      
      // Lösche Benachrichtigung nach 5 Sekunden
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  // Hilfsfunktion zum dynamischen Laden von jsPDF-Bibliotheken
  const loadJsPdfLibraries = () => {
    return new Promise((resolve, reject) => {
      // Überprüfe ob bereits geladen
      if (window.jspdf && window.jspdf.jsPDF) {
        resolve();
        return;
      }

      // Lade jsPDF Script
      const jsPdfScript = document.createElement('script');
      jsPdfScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      jsPdfScript.async = true;
      
      // Lade autoTable Plugin
      const autoTableScript = document.createElement('script');
      autoTableScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js';
      autoTableScript.async = true;
      
      // Behandle Ladeabschluss
      let loadedCount = 0;
      const handleLoad = () => {
        loadedCount++;
        if (loadedCount === 2) {
          // Beide Scripts geladen
          if (window.jspdf && window.jspdf.jsPDF) {
            resolve();
          } else {
            reject(new Error(t('parent.academicReport.pdf.loadError')));
          }
        }
      };
      
      // Behandle Fehler
      const handleError = () => {
        reject(new Error(t('parent.academicReport.pdf.loadLibrariesError')));
      };
      
      jsPdfScript.onload = handleLoad;
      jsPdfScript.onerror = handleError;
      
      autoTableScript.onload = handleLoad;
      autoTableScript.onerror = handleError;
      
      // Füge Scripts zum Dokument hinzu
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
            <span>{t('parent.academicReport.pdf.generating')}</span>
          </>
        ) : (
          <>
            <FaFilePdf className="mr-2" />
            <span>{t('parent.academicReport.pdf.saveButton')}</span>
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