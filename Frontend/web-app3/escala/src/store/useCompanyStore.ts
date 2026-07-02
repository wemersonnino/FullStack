import { create } from 'zustand';
import { Company, getCompanies, createCompany, updateCompany, deleteCompany } from '@/services/company.service';
import { toast } from 'sonner';

interface CompanyState {
  companies: Company[];
  isLoading: boolean;
  fetchCompanies: () => Promise<void>;
  addCompany: (payload: any) => Promise<boolean>;
  editCompany: (id: string, payload: any) => Promise<boolean>;
  removeCompany: (id: string) => Promise<boolean>;
}

export const useCompanyStore = create<CompanyState>((set, get) => ({
  companies: [],
  isLoading: false,

  fetchCompanies: async () => {
    set({ isLoading: true });
    try {
      const data = await getCompanies();
      set({ companies: data });
    } catch (error) {
      toast.error('Erro ao carregar empresas.');
    } finally {
      set({ isLoading: false });
    }
  },

  addCompany: async (payload) => {
    try {
      const newCompany = await createCompany(payload);
      if (newCompany) {
        set((state) => ({ companies: [...state.companies, newCompany] }));
        toast.success('Empresa cadastrada com sucesso.');
        return true;
      }
      return false;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao cadastrar empresa.';
      toast.error(message);
      return false;
    }
  },

  editCompany: async (id, payload) => {
    try {
      const updated = await updateCompany(id, payload);
      if (updated) {
        set((state) => ({
          companies: state.companies.map((c) => (c.id === id ? updated : c)),
        }));
        toast.success('Empresa atualizada com sucesso.');
        return true;
      }
      return false;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao atualizar empresa.';
      toast.error(message);
      return false;
    }
  },

  removeCompany: async (id) => {
    try {
      await deleteCompany(id);
      set((state) => ({
        companies: state.companies.filter((c) => c.id !== id),
      }));
      toast.success('Empresa excluída.');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir empresa.';
      toast.error(message);
      return false;
    }
  },
}));
