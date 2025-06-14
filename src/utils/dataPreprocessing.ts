
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
    'review_id',
    'listing_id', 
    'neighbourhood',
    'created_at',
    'language',
    'raw_text'
  ];

  static validateStructure(headers: string[]): string[] {
    const errors: string[] = [];
    
    if (headers.length !== 6) {
      errors.push(`Expected 6 columns, found ${headers.length}`);
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

  static cleanText(text: string): string {
    if (!text) return '';
    
    return text
      .trim()
      // Fix common encoding issues
      .replace(/â€™/g, "'")
      .replace(/â€œ/g, '"')
      .replace(/â€\u009d/g, '"')
      .replace(/â€"/g, '—')
      .replace(/Ã¡/g, 'á')
      .replace(/Ã©/g, 'é')
      .replace(/Ã­/g, 'í')
      .replace(/Ã³/g, 'ó')
      .replace(/Ãº/g, 'ú')
      .replace(/Ã±/g, 'ñ');
  }

  static validateDate(dateString: string): boolean {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2030;
  }

  static standardizeDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 19).replace('T', ' ');
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
      if (!row.review_id || !row.raw_text) {
        shouldRemove = true;
        removalReason = 'missing review_id or raw_text';
        report.missingDataRemoved++;
      }

      // Check for duplicates
      if (!shouldRemove && seenReviewIds.has(row.review_id)) {
        shouldRemove = true;
        removalReason = 'duplicate review_id';
        report.duplicatesRemoved++;
      }

      // Validate date
      if (!shouldRemove && !this.validateDate(row.created_at)) {
        shouldRemove = true;
        removalReason = 'invalid date format';
        report.invalidDatesRemoved++;
      }

      if (shouldRemove) {
        report.removedRows++;
        report.errors.push(`Row ${rawData.indexOf(row) + 1}: ${removalReason}`);
        continue;
      }

      // Clean and process the row
      const cleanedRow: CleanedRow = {
        review_id: row.review_id.toString().trim(),
        listing_id: row.listing_id.toString().trim(),
        neighbourhood: this.cleanText(row.neighbourhood || ''),
        created_at: this.standardizeDate(row.created_at),
        language: (row.language || 'en').toLowerCase().trim(),
        raw_text: this.cleanText(row.raw_text),
        needs_translation: (row.language || 'en').toLowerCase() !== 'en'
      };

      // Update language distribution
      const lang = cleanedRow.language;
      report.languageDistribution[lang] = (report.languageDistribution[lang] || 0) + 1;
      
      if (cleanedRow.needs_translation) {
        report.nonEnglishCount++;
      }

      seenReviewIds.add(cleanedRow.review_id);
      cleanedData.push(cleanedRow);
    }

    report.cleanedRows = cleanedData.length;
    return { cleanedData, report };
  }

  static generateReportSummary(report: PreprocessingReport): string {
    const lines = [
      `=== Data Preprocessing Report ===`,
      `Original rows: ${report.originalRows}`,
      `Cleaned rows: ${report.cleanedRows}`,
      `Removed rows: ${report.removedRows}`,
      ``,
      `Removal breakdown:`,
      `- Missing data: ${report.missingDataRemoved}`,
      `- Duplicates: ${report.duplicatesRemoved}`,
      `- Invalid dates: ${report.invalidDatesRemoved}`,
      ``,
      `Language distribution:`,
      ...Object.entries(report.languageDistribution).map(([lang, count]) => 
        `- ${lang}: ${count} (${((count / report.cleanedRows) * 100).toFixed(1)}%)`
      ),
      ``,
      `Non-English reviews: ${report.nonEnglishCount} (${((report.nonEnglishCount / report.cleanedRows) * 100).toFixed(1)}%)`
    ];

    return lines.join('\n');
  }
}
