import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCHEMES_FILE_PATH = path.join(__dirname, '..', 'data', 'schemes.json');

export class Scheme {
  static async readData() {
    try {
      const content = await fs.readFile(SCHEMES_FILE_PATH, 'utf-8');
      return JSON.parse(content || '[]');
    } catch (err) {
      if (err.code === 'ENOENT') {
        await fs.mkdir(path.dirname(SCHEMES_FILE_PATH), { recursive: true });
        await fs.writeFile(SCHEMES_FILE_PATH, '[]', 'utf-8');
        return [];
      }
      throw err;
    }
  }

  static async writeData(data) {
    const tempFile = `${SCHEMES_FILE_PATH}.tmp`;
    await fs.writeFile(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    await fs.rename(tempFile, SCHEMES_FILE_PATH);
  }

  static async findAll() {
    return await this.readData();
  }

  static async findByCode(code) {
    const list = await this.readData();
    return list.find((s) => s.schemeCode.toUpperCase() === code.toUpperCase()) || null;
  }

  static async create(payload) {
    const list = await this.readData();
    const existing = list.find((s) => s.schemeCode.toUpperCase() === payload.schemeCode.toUpperCase());
    if (existing) {
      throw new Error(`Scheme with code ${payload.schemeCode} already exists.`);
    }

    const newScheme = {
      schemeCode: payload.schemeCode.trim().toUpperCase(),
      schemeName: payload.schemeName.trim(),
      description: payload.description || '',
      eligibility: {
        degreeLevels: payload.eligibility?.degreeLevels || ['PhD'],
        minMarks: payload.eligibility?.minMarks !== undefined ? parseFloat(payload.eligibility.minMarks) : null,
        incomeCeiling: payload.eligibility?.incomeCeiling !== undefined && payload.eligibility.incomeCeiling !== null && payload.eligibility.incomeCeiling !== ''
          ? parseFloat(payload.eligibility.incomeCeiling)
          : null,
        category: payload.eligibility?.category || 'ST',
        specialPreferences: payload.eligibility?.specialPreferences || []
      },
      selectionMethod: payload.selectionMethod === 'interview' ? 'interview' : 'merit',
      selectionMethodDescription: payload.selectionMethodDescription || '',
      requiredDocuments: payload.requiredDocuments || [],
      quotaRules: payload.quotaRules || [],
      benefitAmount: payload.benefitAmount || {
        type: 'monthly_fellowship',
        currency: 'INR',
        rates: {},
        display: ''
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    list.push(newScheme);
    await this.writeData(list);
    return newScheme;
  }

  static async update(code, payload) {
    const list = await this.readData();
    const index = list.findIndex((s) => s.schemeCode.toUpperCase() === code.toUpperCase());
    if (index === -1) {
      return null;
    }

    const current = list[index];
    const updated = {
      ...current,
      ...payload,
      schemeCode: current.schemeCode, // code immutable
      eligibility: {
        ...current.eligibility,
        ...(payload.eligibility || {})
      },
      quotaRules: payload.quotaRules !== undefined ? payload.quotaRules : current.quotaRules,
      requiredDocuments: payload.requiredDocuments !== undefined ? payload.requiredDocuments : current.requiredDocuments,
      benefitAmount: payload.benefitAmount !== undefined ? payload.benefitAmount : current.benefitAmount,
      updatedAt: new Date().toISOString()
    };

    list[index] = updated;
    await this.writeData(list);
    return updated;
  }
}
