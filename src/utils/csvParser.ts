/**
 * Proper CSV parser that handles quoted fields with commas, newlines, and other edge cases
 */
export class CSVParser {
  /**
   * Parse CSV text into an array of objects
   * @param csvText - The raw CSV text
   * @returns Array of objects where keys are column headers
   */
  static parse(csvText: string): any[] {
    const lines = this.splitCSVLines(csvText);
    if (lines.length === 0) return [];

    // Parse header row
    const headers = this.parseCSVLine(lines[0]);
    if (headers.length === 0) return [];

    // Parse data rows
    const data: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue; // Skip empty lines

      const values = this.parseCSVLine(line);
      if (values.length === 0) continue; // Skip empty rows

      // Create object with headers as keys
      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      data.push(row);
    }

    return data;
  }

  /**
   * Split CSV text into lines, handling quoted fields that may contain newlines
   */
  private static splitCSVLines(csvText: string): string[] {
    const lines: string[] = [];
    let currentLine = '';
    let inQuotes = false;
    let i = 0;

    while (i < csvText.length) {
      const char = csvText[i];
      
      if (char === '"') {
        // Handle escaped quotes ("")
        if (i + 1 < csvText.length && csvText[i + 1] === '"') {
          currentLine += '""';
          i += 2;
          continue;
        }
        inQuotes = !inQuotes;
        currentLine += char;
      } else if (char === '\n' || char === '\r') {
        if (inQuotes) {
          // Newline inside quotes - add to current line
          currentLine += char;
        } else {
          // End of line
          if (currentLine.trim()) {
            lines.push(currentLine);
          }
          currentLine = '';
          // Skip \r\n combination
          if (char === '\r' && i + 1 < csvText.length && csvText[i + 1] === '\n') {
            i++;
          }
        }
      } else {
        currentLine += char;
      }
      i++;
    }

    // Add the last line if it exists
    if (currentLine.trim()) {
      lines.push(currentLine);
    }

    return lines;
  }

  /**
   * Parse a single CSV line into an array of values
   */
  private static parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let currentValue = '';
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (char === '"') {
        // Handle escaped quotes ("")
        if (i + 1 < line.length && line[i + 1] === '"') {
          currentValue += '"';
          i += 2;
          continue;
        }
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        // End of field
        values.push(this.cleanValue(currentValue));
        currentValue = '';
      } else {
        currentValue += char;
      }
      i++;
    }

    // Add the last value
    values.push(this.cleanValue(currentValue));

    return values;
  }

  /**
   * Clean and normalize a CSV value
   */
  private static cleanValue(value: string): string {
    // Remove surrounding quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    
    // Unescape double quotes
    value = value.replace(/""/g, '"');
    
    // Trim whitespace
    return value.trim();
  }

  /**
   * Validate CSV structure and return any errors
   */
  static validateStructure(headers: string[], expectedHeaders?: string[]): string[] {
    const errors: string[] = [];

    if (headers.length === 0) {
      errors.push('No headers found in CSV file');
      return errors;
    }

    // Check for empty headers
    headers.forEach((header, index) => {
      if (!header.trim()) {
        errors.push(`Empty header found at column ${index + 1}`);
      }
    });

    // Check for duplicate headers
    const headerCounts = new Map<string, number>();
    headers.forEach(header => {
      const normalizedHeader = header.toLowerCase().trim();
      headerCounts.set(normalizedHeader, (headerCounts.get(normalizedHeader) || 0) + 1);
    });

    headerCounts.forEach((count, header) => {
      if (count > 1) {
        errors.push(`Duplicate header found: "${header}"`);
      }
    });

    // Check against expected headers if provided
    if (expectedHeaders && expectedHeaders.length > 0) {
      const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
      const normalizedExpected = expectedHeaders.map(h => h.toLowerCase().trim());

      normalizedExpected.forEach(expected => {
        if (!normalizedHeaders.includes(expected)) {
          errors.push(`Missing expected header: "${expected}"`);
        }
      });
    }

    return errors;
  }

  /**
   * Get basic statistics about the CSV data
   */
  static getStatistics(data: any[]): {
    totalRows: number;
    totalColumns: number;
    emptyRows: number;
    columnStats: { [key: string]: { empty: number; filled: number } };
  } {
    if (data.length === 0) {
      return {
        totalRows: 0,
        totalColumns: 0,
        emptyRows: 0,
        columnStats: {}
      };
    }

    const headers = Object.keys(data[0]);
    const columnStats: { [key: string]: { empty: number; filled: number } } = {};

    // Initialize column stats
    headers.forEach(header => {
      columnStats[header] = { empty: 0, filled: 0 };
    });

    let emptyRows = 0;

    data.forEach(row => {
      let hasData = false;
      headers.forEach(header => {
        const value = row[header];
        if (value && value.toString().trim()) {
          columnStats[header].filled++;
          hasData = true;
        } else {
          columnStats[header].empty++;
        }
      });

      if (!hasData) {
        emptyRows++;
      }
    });

    return {
      totalRows: data.length,
      totalColumns: headers.length,
      emptyRows,
      columnStats
    };
  }
} 