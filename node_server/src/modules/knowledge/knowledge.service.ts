import { randomUUID } from 'crypto';

const categoryStore: any[] = [
  { id: 'cat-ops', name: 'Operations', description: 'Operational procedures and guidelines', createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat-fin', name: 'Finance', description: 'Financial policies and budgeting', createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'cat-log', name: 'Logistics', description: 'Supply chain and delivery protocols', createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

const documentStore: any[] = [
  { id: 'doc-001', title: 'Inventory Management Best Practices', content: 'Guidelines for maintaining optimal stock levels...', categoryId: 'cat-ops', createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'doc-002', title: 'Q3 Budget Allocation Framework', content: 'Framework for distributing quarterly budgets...', categoryId: 'cat-fin', createdBy: 'system', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

export class KnowledgeService {
  public static async createCategory(data: { name: string; description?: string; createdBy: string; }) {
    const cat = { id: randomUUID(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    categoryStore.push(cat);
    return cat;
  }

  public static async getCategories() {
    return categoryStore.map(cat => {
      const count = documentStore.filter(doc => doc.categoryId === cat.id).length;
      return {
        ...cat,
        count
      };
    }).sort((a, b) => a.name.localeCompare(b.name));
  }

  public static async createDocument(data: { title: string; content?: string; categoryId: string; createdBy: string; }) {
    const doc = { id: randomUUID(), ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    documentStore.push(doc);
    return doc;
  }

  public static async getDocuments(filters: any = {}) {
    let docs = [...documentStore];
    if (filters.q) {
      const q = String(filters.q).toLowerCase();
      docs = docs.filter((d) => d.title.toLowerCase().includes(q) || (d.content && d.content.toLowerCase().includes(q)));
    }
    if (filters.categoryId) {
      docs = docs.filter((d) => d.categoryId === filters.categoryId);
    }
    
    return docs.map(doc => {
      const cat = categoryStore.find(c => c.id === doc.categoryId);
      return {
        id: doc.id,
        name: doc.title,
        type: cat ? cat.name : 'General',
        updated: new Date(doc.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        categoryId: doc.categoryId,
        content: doc.content
      };
    }).sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime());
  }

  public static async getDocumentById(id: string) {
    const doc = documentStore.find((d) => d.id === id);
    if (!doc) return null;
    const cat = categoryStore.find(c => c.id === doc.categoryId);
    return {
      id: doc.id,
      name: doc.title,
      type: cat ? cat.name : 'General',
      updated: new Date(doc.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      categoryId: doc.categoryId,
      content: doc.content
    };
  }
}
