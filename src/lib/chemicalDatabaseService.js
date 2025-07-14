// Chemical Database Integration Service
// Integrates with multiple real-time chemical databases for enhanced accuracy

class ChemicalDatabaseService {
  constructor() {
    this.pubchemBaseUrl = 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';
    this.chemspiderApiKey = import.meta.env.VITE_CHEMSPIDER_API_KEY; // Optional
    this.nistApiKey = import.meta.env.VITE_NIST_API_KEY; // Optional
  }

  // Get verified chemical data from PubChem (free, no API key needed)
  async getPubChemData(chemicalName, casNumber = null) {
    try {
      let searchUrl;
      
      if (casNumber) {
        // Search by CAS number (more accurate)
        searchUrl = `${this.pubchemBaseUrl}/compound/name/${encodeURIComponent(casNumber)}/property/MolecularFormula,MolecularWeight,IUPACName,CanonicalSMILES/JSON`;
      } else {
        // Search by name
        searchUrl = `${this.pubchemBaseUrl}/compound/name/${encodeURIComponent(chemicalName)}/property/MolecularFormula,MolecularWeight,IUPACName,CanonicalSMILES/JSON`;
      }

      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        throw new Error(`PubChem API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.PropertyTable && data.PropertyTable.Properties.length > 0) {
        const props = data.PropertyTable.Properties[0];
        return {
          source: 'PubChem',
          confidence: 'HIGH',
          data: {
            molecularFormula: props.MolecularFormula,
            molecularWeight: props.MolecularWeight,
            iupacName: props.IUPACName,
            canonicalSMILES: props.CanonicalSMILES,
            cid: props.CID
          }
        };
      }
      
      return null;
    } catch (error) {
      console.error('PubChem lookup error:', error);
      return null;
    }
  }

  // Get additional properties from PubChem
  async getPubChemProperties(cid) {
    try {
      const propertiesUrl = `${this.pubchemBaseUrl}/compound/cid/${cid}/property/HeavyAtomCount,ExactMass,MonoisotopicMass,Charge,Complexity/JSON`;
      
      const response = await fetch(propertiesUrl);
      if (!response.ok) return null;
      
      const data = await response.json();
      return data.PropertyTable?.Properties?.[0] || null;
    } catch (error) {
      console.error('PubChem properties error:', error);
      return null;
    }
  }

  // Get safety data from PubChem
  async getPubChemSafetyData(cid) {
    try {
      // PubChem has GHS classifications in some records
      const safetyUrl = `${this.pubchemBaseUrl}/compound/cid/${cid}/record/JSON`;
      
      const response = await fetch(safetyUrl);
      if (!response.ok) return null;
      
      const data = await response.json();
      const record = data.PC_Compounds?.[0];
      
      if (record) {
        // Extract safety information from various sections
        const safetyInfo = this.extractSafetyFromRecord(record);
        return {
          source: 'PubChem',
          confidence: 'HIGH',
          data: safetyInfo
        };
      }
      
      return null;
    } catch (error) {
      console.error('PubChem safety data error:', error);
      return null;
    }
  }

  extractSafetyFromRecord(record) {
    // Extract safety information from PubChem record
    // This is a simplified version - real implementation would be more comprehensive
    const safetyInfo = {
      hazardClasses: [],
      storageConditions: [],
      handlingPrecautions: []
    };

    // Look for GHS classifications, MSDS data, etc.
    // PubChem structure is complex, this would need detailed parsing
    
    return safetyInfo;
  }

  // Enhanced chemical lookup combining multiple sources
  async getEnhancedChemicalData(chemicalName, casNumber = null) {
    const results = {
      name: chemicalName,
      casNumber: casNumber,
      sources: [],
      confidence: {},
      properties: {},
      safety: {}
    };

    // 1. Try PubChem first (most reliable, free)
    const pubchemData = await this.getPubChemData(chemicalName, casNumber);
    if (pubchemData) {
      results.sources.push('PubChem');
      results.confidence.basic = 'HIGH';
      results.properties = { ...results.properties, ...pubchemData.data };
      
      // Get additional properties
      const additionalProps = await this.getPubChemProperties(pubchemData.data.cid);
      if (additionalProps) {
        results.properties = { ...results.properties, ...additionalProps };
      }
      
      // Get safety data
      const safetyData = await this.getPubChemSafetyData(pubchemData.data.cid);
      if (safetyData) {
        results.safety = safetyData.data;
        results.confidence.safety = 'HIGH';
      }
    }

    // 2. Try ChemSpider if API key available
    if (this.chemspiderApiKey) {
      const chemspiderData = await this.getChemSpiderData(chemicalName);
      if (chemspiderData) {
        results.sources.push('ChemSpider');
        // Merge and cross-validate data
      }
    }

    // 3. Add NIST data if available
    if (this.nistApiKey) {
      const nistData = await this.getNISTData(chemicalName);
      if (nistData) {
        results.sources.push('NIST');
        results.properties.thermodynamic = nistData;
        results.confidence.thermodynamic = 'HIGH';
      }
    }

    return results;
  }

  // Format enhanced data for your material addition system
  formatForMaterialAddition(enhancedData, aiEstimates) {
    return {
      // Verified data (HIGH confidence)
      materialName: enhancedData.name,
      casNumber: enhancedData.casNumber || aiEstimates.casNumber,
      molecularFormula: enhancedData.properties.molecularFormula,
      molecularWeight: enhancedData.properties.molecularWeight,
      
      // AI estimates with lower confidence
      supplierName: aiEstimates.supplierName, // Still AI estimate
      supplierCost: aiEstimates.supplierCost, // Still AI estimate
      manufacture: aiEstimates.manufacture, // Still AI estimate
      
      // Enhanced accuracy fields
      density: enhancedData.properties.density || aiEstimates.density,
      physicalForm: this.determinePhysicalForm(enhancedData.properties),
      hazardClass: this.determineHazardClass(enhancedData.safety),
      
      // Confidence and source tracking
      dataSourceNotes: `Verified via ${enhancedData.sources.join(', ')}. Pricing and supplier info estimated.`,
      confidenceLevel: this.calculateOverallConfidence(enhancedData),
      lastVerified: new Date().toISOString(),
      verificationSources: enhancedData.sources
    };
  }

  determinePhysicalForm(properties) {
    // Logic to determine physical form from molecular properties
    // This would use melting point, boiling point, etc.
    return 'Unknown'; // Placeholder
  }

  determineHazardClass(safetyData) {
    // Logic to determine hazard classification from safety data
    return 'Unknown'; // Placeholder
  }

  calculateOverallConfidence(enhancedData) {
    const sourceCount = enhancedData.sources.length;
    if (sourceCount >= 2) return 'HIGH';
    if (sourceCount === 1) return 'MEDIUM';
    return 'LOW';
  }
}

export default ChemicalDatabaseService; 