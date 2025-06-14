export interface PreprocessingReport {
  originalRows: number;
  cleanedRows: number;
  removedRows: number;
  duplicatesRemoved: number;
  invalidDatesRemoved: number;
  missingDataRemoved: number;
  languageDistribution: { [key: string]: number };
  nonEnglishCount: number;
  errors: string[];
}

export interface CleanedRow {
  review_id: string;
  listing_id: string;
  neighbourhood: string;
  created_at: string;
  language: string;
  raw_text: string;
  needs_translation: boolean;
}

export class DataPreprocessor {
  private static readonly REQUIRED_HEADERS = [
    'listing_id',
    'date', 
    'comments',
    'neighbourhood_cleansed'
  ];

  static validateStructure(headers: string[]): string[] {
    const errors: string[] = [];
    
    if (headers.length !== 4) {
      errors.push(`Expected 4 columns, found ${headers.length}`);
    }

    const normalizedHeaders = headers.map(h => h.trim().toLowerCase());
    const expectedHeaders = this.REQUIRED_HEADERS.map(h => h.toLowerCase());
    
    expectedHeaders.forEach((expected, index) => {
      if (normalizedHeaders[index] !== expected) {
        errors.push(`Column ${index + 1}: Expected '${expected}', found '${normalizedHeaders[index]}'`);
      }
    });

    return errors;
  }

  static validateDate(dateString: string): boolean {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    
    const currentDate = new Date();
    const minDate = new Date('2008-01-01'); // Airbnb founded in 2008
    
    return date >= minDate && date <= currentDate;
  }

  static standardizeDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  static cleanText(text: string): string {
    if (!text) return '';
    return text
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?;:()\-'"]/g, '');
  }

  static detectLanguage(text: string): string {
    if (!text) return 'en';
    
    // Simple language detection - you could integrate with a proper language detection library
    const germanWords = ['der', 'die', 'das', 'und', 'ist', 'war', 'sehr', 'gut', 'schön'];
    const frenchWords = ['le', 'la', 'les', 'et', 'est', 'était', 'très', 'bien', 'beau'];
    const spanishWords = ['el', 'la', 'los', 'y', 'es', 'era', 'muy', 'bien', 'bueno'];
    
    const lowerText = text.toLowerCase();
    
    let germanCount = 0;
    let frenchCount = 0;
    let spanishCount = 0;
    
    germanWords.forEach(word => {
      if (lowerText.includes(word)) germanCount++;
    });
    
    frenchWords.forEach(word => {
      if (lowerText.includes(word)) frenchCount++;
    });
    
    spanishWords.forEach(word => {
      if (lowerText.includes(word)) spanishCount++;
    });
    
    if (germanCount >= 2) return 'de';
    if (frenchCount >= 2) return 'fr';
    if (spanishCount >= 2) return 'es';
    
    return 'en'; // Default to English
  }

  static preprocessData(rawData: any[]): { cleanedData: CleanedRow[], report: PreprocessingReport } {
    const report: PreprocessingReport = {
      originalRows: rawData.length,
      cleanedRows: 0,
      removedRows: 0,
      duplicatesRemoved: 0,
      invalidDatesRemoved: 0,
      missingDataRemoved: 0,
      languageDistribution: {},
      nonEnglishCount: 0,
      errors: []
    };

    const cleanedData: CleanedRow[] = [];
    const seenReviewIds = new Set<string>();

    for (const row of rawData) {
      let shouldRemove = false;
      let removalReason = '';

      // Check for missing critical data
      if (!row.listing_id || !row.comments) {
        shouldRemove = true;
        removalReason = 'missing listing_id or comments';
        report.missingDataRemoved++;
      }

      // Generate unique review ID from listing_id + date + first 10 chars of comment
      const reviewId = `${row.listing_id}_${row.date}_${(row.comments || '').substring(0, 10).replace(/\s/g, '')}`;
      
      // Check for duplicates
      if (!shouldRemove && seenReviewIds.has(reviewId)) {
        shouldRemove = true;
        removalReason = 'duplicate review';
        report.duplicatesRemoved++;
      }

      // Validate date
      if (!shouldRemove && !this.validateDate(row.date)) {
        shouldRemove = true;
        removalReason = 'invalid or implausible date';
        report.invalidDatesRemoved++;
      }

      if (shouldRemove) {
        report.removedRows++;
        report.errors.push(`Row ${rawData.indexOf(row) + 1}: ${removalReason}`);
        continue;
      }

      // Detect language from comments
      const detectedLanguage = this.detectLanguage(row.comments);

      // Clean and process the row
      const cleanedRow: CleanedRow = {
        review_id: reviewId,
        listing_id: row.listing_id.toString().trim(),
        neighbourhood: row.neighbourhood_cleansed?.trim() || '',
        created_at: this.standardizeDate(row.date),
        language: detectedLanguage,
        raw_text: this.cleanText(row.comments),
        needs_translation: detectedLanguage !== 'en'
      };

      // Update language distribution
      const lang = cleanedRow.language;
      report.languageDistribution[lang] = (report.languageDistribution[lang] || 0) + 1;
      
      if (lang !== 'en') {
        report.nonEnglishCount++;
      }

      seenReviewIds.add(reviewId);
      cleanedData.push(cleanedRow);
    }

    report.cleanedRows = cleanedData.length;
    return { cleanedData, report };
  }

  static generateReportSummary(report: PreprocessingReport): string {
    return `
Data Preprocessing Report
========================

Input Data:
- Original rows: ${report.originalRows}
- Cleaned rows: ${report.cleanedRows}
- Removed rows: ${report.removedRows}

Removal Reasons:
- Missing data: ${report.missingDataRemoved}
- Duplicates: ${report.duplicatesRemoved}
- Invalid dates: ${report.invalidDatesRemoved}

Language Analysis:
- Non-English reviews: ${report.nonEnglishCount}
- Language distribution: ${JSON.stringify(report.languageDistribution, null, 2)}

Errors:
${report.errors.length > 0 ? report.errors.slice(0, 10).join('\n') : 'None'}
${report.errors.length > 10 ? `... and ${report.errors.length - 10} more` : ''}
    `.trim();
  }
}
