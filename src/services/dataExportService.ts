// Data Export Service for exporting various types of data
export interface ExportOptions {
  format: 'csv' | 'xlsx' | 'json' | 'pdf';
  filename?: string;
  includeHeaders?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  filters?: Record<string, any>;
}

export interface ExportData {
  type: 'analytics' | 'inventory' | 'financial' | 'products' | 'customers' | 'sales';
  data: any[];
  metadata?: Record<string, any>;
}

export class DataExportService {
  private static instance: DataExportService;

  private constructor() {}

  public static getInstance(): DataExportService {
    if (!DataExportService.instance) {
      DataExportService.instance = new DataExportService();
    }
    return DataExportService.instance;
  }

  // Export data to CSV format
  public async exportToCSV(data: ExportData, options: ExportOptions = { format: 'csv' }): Promise<void> {
    try {
      const csvContent = this.convertToCSV(data.data, options.includeHeaders);
      this.downloadFile(csvContent, 'text/csv', options.filename || `${data.type}_export.csv`);
    } catch (error) {
      console.error('CSV export failed:', error);
      throw error;
    }
  }

  // Export data to Excel format
  public async exportToExcel(data: ExportData, options: ExportOptions = { format: 'xlsx' }): Promise<void> {
    try {
      // For now, we'll use a simple CSV export as Excel
      // In a real implementation, you would use a library like xlsx
      const csvContent = this.convertToCSV(data.data, options.includeHeaders);
      this.downloadFile(csvContent, 'application/vnd.ms-excel', options.filename || `${data.type}_export.xlsx`);
    } catch (error) {
      console.error('Excel export failed:', error);
      throw error;
    }
  }

  // Export data to JSON format
  public async exportToJSON(data: ExportData, options: ExportOptions = { format: 'json' }): Promise<void> {
    try {
      const jsonContent = JSON.stringify({
        metadata: {
          exportDate: new Date().toISOString(),
          type: data.type,
          recordCount: data.data.length,
          ...options.filters,
          ...data.metadata
        },
        data: data.data
      }, null, 2);

      this.downloadFile(jsonContent, 'application/json', options.filename || `${data.type}_export.json`);
    } catch (error) {
      console.error('JSON export failed:', error);
      throw error;
    }
  }

  // Export analytics data
  public async exportAnalytics(options: ExportOptions = { format: 'csv' }): Promise<void> {
    try {
      // Mock analytics data - in real implementation, this would fetch from API
      const analyticsData: ExportData = {
        type: 'analytics',
        data: [
          { date: '2024-01-01', revenue: 150000, sales: 45, customers: 120 },
          { date: '2024-01-02', revenue: 180000, sales: 52, customers: 135 },
          { date: '2024-01-03', revenue: 165000, sales: 48, customers: 128 },
          { date: '2024-01-04', revenue: 200000, sales: 58, customers: 142 },
          { date: '2024-01-05', revenue: 175000, sales: 50, customers: 130 }
        ],
        metadata: {
          totalRevenue: 870000,
          totalSales: 253,
          totalCustomers: 655,
          averageRevenue: 174000,
          averageSales: 50.6
        }
      };

      await this.exportData(analyticsData, options);
    } catch (error) {
      console.error('Analytics export failed:', error);
      throw error;
    }
  }

  // Export inventory data
  public async exportInventory(options: ExportOptions = { format: 'csv' }): Promise<void> {
    try {
      const inventoryData: ExportData = {
        type: 'inventory',
        data: [
          { sku: 'IPH15P-001', name: 'iPhone 15 Pro', currentStock: 45, minStock: 20, maxStock: 100, cost: 80000, price: 120000 },
          { sku: 'SGS24-001', name: 'Samsung Galaxy S24', currentStock: 32, minStock: 15, maxStock: 80, cost: 70000, price: 100000 },
          { sku: 'APP-001', name: 'AirPods Pro', currentStock: 78, minStock: 30, maxStock: 150, cost: 15000, price: 25000 },
          { sku: 'MBA-M3-001', name: 'MacBook Air M3', currentStock: 12, minStock: 5, maxStock: 25, cost: 120000, price: 150000 },
          { sku: 'IPP-001', name: 'iPad Pro', currentStock: 28, minStock: 10, maxStock: 50, cost: 60000, price: 100000 }
        ],
        metadata: {
          totalItems: 5,
          totalValue: 1950000,
          lowStockItems: 1,
          outOfStockItems: 0
        }
      };

      await this.exportData(inventoryData, options);
    } catch (error) {
      console.error('Inventory export failed:', error);
      throw error;
    }
  }

  // Export financial data
  public async exportFinancial(options: ExportOptions = { format: 'csv' }): Promise<void> {
    try {
      const financialData: ExportData = {
        type: 'financial',
        data: [
          { date: '2024-01-01', type: 'income', amount: 150000, description: 'Продажа iPhone 15 Pro', marketplace: 'wildberries' },
          { date: '2024-01-01', type: 'expense', amount: 80000, description: 'Закупка товара', marketplace: 'wildberries' },
          { date: '2024-01-02', type: 'income', amount: 180000, description: 'Продажа Samsung Galaxy S24', marketplace: 'ozon' },
          { date: '2024-01-02', type: 'expense', amount: 70000, description: 'Закупка товара', marketplace: 'ozon' },
          { date: '2024-01-03', type: 'income', amount: 165000, description: 'Продажа AirPods Pro', marketplace: 'ym' }
        ],
        metadata: {
          totalRevenue: 495000,
          totalExpenses: 150000,
          netProfit: 345000,
          grossMargin: 69.7
        }
      };

      await this.exportData(financialData, options);
    } catch (error) {
      console.error('Financial export failed:', error);
      throw error;
    }
  }

  // Export products data
  public async exportProducts(options: ExportOptions = { format: 'csv' }): Promise<void> {
    try {
      const productsData: ExportData = {
        type: 'products',
        data: [
          { sku: 'IPH15P-001', name: 'iPhone 15 Pro', category: 'Электроника', price: 120000, sales: 234, revenue: 28080000 },
          { sku: 'SGS24-001', name: 'Samsung Galaxy S24', category: 'Электроника', price: 100000, sales: 189, revenue: 18900000 },
          { sku: 'APP-001', name: 'AirPods Pro', category: 'Аудио', price: 25000, sales: 156, revenue: 3900000 },
          { sku: 'MBA-M3-001', name: 'MacBook Air M3', category: 'Компьютеры', price: 150000, sales: 98, revenue: 14700000 },
          { sku: 'IPP-001', name: 'iPad Pro', category: 'Планшеты', price: 100000, sales: 87, revenue: 8700000 }
        ],
        metadata: {
          totalProducts: 5,
          totalSales: 764,
          totalRevenue: 74280000,
          averagePrice: 99000
        }
      };

      await this.exportData(productsData, options);
    } catch (error) {
      console.error('Products export failed:', error);
      throw error;
    }
  }

  // Export customers data
  public async exportCustomers(options: ExportOptions = { format: 'csv' }): Promise<void> {
    try {
      const customersData: ExportData = {
        type: 'customers',
        data: [
          { id: 'CUST-001', name: 'Иван Петров', email: 'ivan@example.com', totalOrders: 5, totalSpent: 450000, lastOrder: '2024-01-15' },
          { id: 'CUST-002', name: 'Мария Сидорова', email: 'maria@example.com', totalOrders: 3, totalSpent: 280000, lastOrder: '2024-01-12' },
          { id: 'CUST-003', name: 'Алексей Козлов', email: 'alex@example.com', totalOrders: 7, totalSpent: 650000, lastOrder: '2024-01-18' },
          { id: 'CUST-004', name: 'Елена Волкова', email: 'elena@example.com', totalOrders: 2, totalSpent: 150000, lastOrder: '2024-01-10' },
          { id: 'CUST-005', name: 'Дмитрий Соколов', email: 'dmitry@example.com', totalOrders: 4, totalSpent: 320000, lastOrder: '2024-01-16' }
        ],
        metadata: {
          totalCustomers: 5,
          totalOrders: 21,
          totalSpent: 1850000,
          averageOrderValue: 88100
        }
      };

      await this.exportData(customersData, options);
    } catch (error) {
      console.error('Customers export failed:', error);
      throw error;
    }
  }

  // Export sales data
  public async exportSales(options: ExportOptions = { format: 'csv' }): Promise<void> {
    try {
      const salesData: ExportData = {
        type: 'sales',
        data: [
          { date: '2024-01-01', product: 'iPhone 15 Pro', quantity: 5, revenue: 600000, marketplace: 'wildberries' },
          { date: '2024-01-01', product: 'Samsung Galaxy S24', quantity: 3, revenue: 300000, marketplace: 'ozon' },
          { date: '2024-01-02', product: 'AirPods Pro', quantity: 8, revenue: 200000, marketplace: 'ym' },
          { date: '2024-01-02', product: 'MacBook Air M3', quantity: 2, revenue: 300000, marketplace: 'wildberries' },
          { date: '2024-01-03', product: 'iPad Pro', quantity: 4, revenue: 400000, marketplace: 'ozon' }
        ],
        metadata: {
          totalSales: 22,
          totalRevenue: 1800000,
          averageOrderValue: 81818,
          topMarketplace: 'wildberries'
        }
      };

      await this.exportData(salesData, options);
    } catch (error) {
      console.error('Sales export failed:', error);
      throw error;
    }
  }

  // Generic export method
  private async exportData(data: ExportData, options: ExportOptions): Promise<void> {
    switch (options.format) {
      case 'csv':
        await this.exportToCSV(data, options);
        break;
      case 'xlsx':
        await this.exportToExcel(data, options);
        break;
      case 'json':
        await this.exportToJSON(data, options);
        break;
      case 'pdf':
        // PDF export would require additional library
        throw new Error('PDF export not implemented yet');
      default:
        throw new Error(`Unsupported export format: ${options.format}`);
    }
  }

  // Convert data to CSV format
  private convertToCSV(data: any[], includeHeaders: boolean = true): string {
    if (!data || data.length === 0) {
      return '';
    }

    const headers = Object.keys(data[0]);
    let csv = '';

    if (includeHeaders) {
      csv += headers.join(',') + '\n';
    }

    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csv += values.join(',') + '\n';
    });

    return csv;
  }

  // Download file to user's device
  private downloadFile(content: string, mimeType: string, filename: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  // Get available export formats for a data type
  public getAvailableFormats(dataType: string): string[] {
    const formatMap: Record<string, string[]> = {
      'analytics': ['csv', 'xlsx', 'json'],
      'inventory': ['csv', 'xlsx', 'json'],
      'financial': ['csv', 'xlsx', 'json'],
      'products': ['csv', 'xlsx', 'json'],
      'customers': ['csv', 'xlsx', 'json'],
      'sales': ['csv', 'xlsx', 'json']
    };

    return formatMap[dataType] || ['csv', 'json'];
  }

  // Get export history (stored in localStorage)
  public getExportHistory(): Array<{
    id: string;
    type: string;
    format: string;
    filename: string;
    timestamp: Date;
    recordCount: number;
  }> {
    try {
      const history = localStorage.getItem('marketos-export-history');
      return history ? JSON.parse(history).map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      })) : [];
    } catch (error) {
      console.error('Failed to load export history:', error);
      return [];
    }
  }

  // Add export to history
  private addToHistory(data: ExportData, options: ExportOptions): void {
    try {
      const history = this.getExportHistory();
      const newEntry = {
        id: Date.now().toString(),
        type: data.type,
        format: options.format,
        filename: options.filename || `${data.type}_export.${options.format}`,
        timestamp: new Date(),
        recordCount: data.data.length
      };

      history.unshift(newEntry);
      
      // Keep only last 50 exports
      if (history.length > 50) {
        history.splice(50);
      }

      localStorage.setItem('marketos-export-history', JSON.stringify(history));
    } catch (error) {
      console.error('Failed to save export history:', error);
    }
  }
}

// Export singleton instance
export const dataExportService = DataExportService.getInstance();
