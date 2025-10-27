import React, { useState } from 'react';
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileJson,
  File,
  Calendar,
  Filter,
  ChevronDown,
  X,
  Check,
  AlertCircle
} from 'lucide-react';
import { dataExportService, ExportOptions } from '../services/dataExportService';

interface DataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataType: 'analytics' | 'inventory' | 'financial' | 'products' | 'customers' | 'sales';
  defaultFilename?: string;
}

export function DataExportModal({ isOpen, onClose, dataType, defaultFilename }: DataExportModalProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    filename: defaultFilename || `${dataType}_export`,
    includeHeaders: true,
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date()
    }
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const availableFormats = dataExportService.getAvailableFormats(dataType);

  const formatIcons = {
    csv: FileText,
    xlsx: FileSpreadsheet,
    json: FileJson,
    pdf: File
  };

  const formatLabels = {
    csv: 'CSV',
    xlsx: 'Excel',
    json: 'JSON',
    pdf: 'PDF'
  };

  const dataTypeLabels = {
    analytics: 'Аналитика',
    inventory: 'Склад',
    financial: 'Финансы',
    products: 'Товары',
    customers: 'Клиенты',
    sales: 'Продажи'
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      setExportStatus('idle');
      setErrorMessage('');

      switch (dataType) {
        case 'analytics':
          await dataExportService.exportAnalytics(exportOptions);
          break;
        case 'inventory':
          await dataExportService.exportInventory(exportOptions);
          break;
        case 'financial':
          await dataExportService.exportFinancial(exportOptions);
          break;
        case 'products':
          await dataExportService.exportProducts(exportOptions);
          break;
        case 'customers':
          await dataExportService.exportCustomers(exportOptions);
          break;
        case 'sales':
          await dataExportService.exportSales(exportOptions);
          break;
        default:
          throw new Error(`Unsupported data type: ${dataType}`);
      }

      setExportStatus('success');
      
      // Auto-close after success
      setTimeout(() => {
        onClose();
        setExportStatus('idle');
      }, 2000);

    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Произошла ошибка при экспорте');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFormatChange = (format: string) => {
    setExportOptions(prev => ({
      ...prev,
      format: format as any,
      filename: prev.filename?.replace(/\.[^.]+$/, `.${format}`) || `${dataType}_export.${format}`
    }));
  };

  const handleFilenameChange = (filename: string) => {
    setExportOptions(prev => ({
      ...prev,
      filename: filename
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Download size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                  Экспорт данных
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {dataTypeLabels[dataType]}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Формат файла
              </label>
              <div className="grid grid-cols-2 gap-3">
                {availableFormats.map((format) => {
                  const Icon = formatIcons[format as keyof typeof formatIcons];
                  return (
                    <button
                      key={format}
                      onClick={() => handleFormatChange(format)}
                      className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                        exportOptions.format === format
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                          : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                      }`}
                    >
                      <Icon size={16} />
                      <span className="text-sm font-medium">{formatLabels[format as keyof typeof formatLabels]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filename */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Имя файла
              </label>
              <input
                type="text"
                value={exportOptions.filename || ''}
                onChange={(e) => handleFilenameChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                placeholder={`${dataType}_export`}
              />
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Период данных
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">От</label>
                  <input
                    type="date"
                    value={exportOptions.dateRange?.start.toISOString().split('T')[0] || ''}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      dateRange: {
                        ...prev.dateRange!,
                        start: new Date(e.target.value)
                      }
                    }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">До</label>
                  <input
                    type="date"
                    value={exportOptions.dateRange?.end.toISOString().split('T')[0] || ''}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      dateRange: {
                        ...prev.dateRange!,
                        end: new Date(e.target.value)
                      }
                    }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>

            {/* Options */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Дополнительные опции
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={exportOptions.includeHeaders}
                    onChange={(e) => setExportOptions(prev => ({
                      ...prev,
                      includeHeaders: e.target.checked
                    }))}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Включить заголовки столбцов
                  </span>
                </label>
              </div>
            </div>

            {/* Status Messages */}
            {exportStatus === 'success' && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <Check size={16} className="text-green-600 dark:text-green-400" />
                <span className="text-sm text-green-700 dark:text-green-300">
                  Данные успешно экспортированы!
                </span>
              </div>
            )}

            {exportStatus === 'error' && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle size={16} className="text-red-600 dark:text-red-400" />
                <span className="text-sm text-red-700 dark:text-red-300">
                  {errorMessage}
                </span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting || !exportOptions.filename}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Экспортирую...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Экспортировать
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Quick export button component
interface QuickExportButtonProps {
  dataType: 'analytics' | 'inventory' | 'financial' | 'products' | 'customers' | 'sales';
  className?: string;
  variant?: 'primary' | 'secondary';
}

export function QuickExportButton({ dataType, className = '', variant = 'primary' }: QuickExportButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const buttonClasses = variant === 'primary' 
    ? 'px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2'
    : 'px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors flex items-center gap-2';

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`${buttonClasses} ${className}`}
      >
        <Download size={16} />
        Экспорт
      </button>

      <DataExportModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        dataType={dataType}
      />
    </>
  );
}
