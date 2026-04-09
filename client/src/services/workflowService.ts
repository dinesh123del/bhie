import api from '../lib/axios';

export interface WorkflowAction {
  type: 'cancel' | 'negotiate' | 'restructure';
  item: string;
  amount: number;
  rationale: string;
}

export interface OptimizationResult {
  potentialMonthlySavings: number;
  actions: WorkflowAction[];
}

export interface TaxCheck {
  task: string;
  status: 'complete' | 'pending' | 'ready';
}

export interface TaxReadiness {
  score: number;
  status: string;
  checklist: TaxCheck[];
  missingDocuments: string[];
}

export const workflowService = {
  getExpenseOptimization: async (): Promise<OptimizationResult> => {
    const response = await api.get('/workflow/optimize-expenses');
    return response.data;
  },

  getTaxReadiness: async (): Promise<TaxReadiness> => {
    const response = await api.get('/workflow/tax-readiness');
    return response.data;
  },

  generateBundle: async (): Promise<void> => {
    const response = await api.get('/workflow/generate-bundle', {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `BIZ PLUS_Audit_${new Date().toISOString().split('T')[0]}.zip`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
  }
};

export default workflowService;
