// Supplier Pricing Integration Service
// Integrates with major chemical supplier APIs for real-time pricing

class SupplierPricingService {
  constructor() {
    // API configuration
    this.suppliers = {
      fisher: {
        apiKey: process.env.FISHER_SCIENTIFIC_API_KEY,
        baseUrl: 'https://api.fishersci.com/v1',
        enabled: !!process.env.FISHER_SCIENTIFIC_API_KEY
      },
      sigma: {
        apiKey: process.env.SIGMA_ALDRICH_API_KEY,
        baseUrl: 'https://api.sigmaaldrich.com/v1',
        enabled: !!process.env.SIGMA_ALDRICH_API_KEY
      },
      vwr: {
        apiKey: process.env.VWR_API_KEY,
        baseUrl: 'https://api.vwr.com/v1',
        enabled: !!process.env.VWR_API_KEY
      }
    };
  }

  // Get pricing from Fisher Scientific
  async getFisherPricing(chemicalName, casNumber = null) {
    if (!this.suppliers.fisher.enabled) {
      return null;
    }

    try {
      const searchParams = new URLSearchParams({
        q: chemicalName,
        type: 'product',
        format: 'json'
      });

      if (casNumber) {
        searchParams.append('cas', casNumber);
      }

      const response = await fetch(
        `${this.suppliers.fisher.baseUrl}/search?${searchParams}`,
        {
          headers: {
            'Authorization': `Bearer ${this.suppliers.fisher.apiKey}`,
            'Accept': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Fisher API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseFisherResponse(data);
    } catch (error) {
      console.error('Fisher Scientific API error:', error);
      return null;
    }
  }

  parseFisherResponse(data) {
    // Parse Fisher Scientific API response
    if (!data.products || data.products.length === 0) {
      return null;
    }

    const products = data.products.slice(0, 3); // Top 3 matches
    return products.map(product => ({
      supplier: 'Fisher Scientific',
      productName: product.name,
      catalogNumber: product.catalogNumber,
      price: product.price,
      currency: product.currency || 'USD',
      packageSize: product.packageSize,
      purity: product.purity,
      availability: product.availability,
      leadTime: product.leadTime,
      confidence: 'HIGH'
    }));
  }

  // Get pricing from Sigma-Aldrich
  async getSigmaPricing(chemicalName, casNumber = null) {
    if (!this.suppliers.sigma.enabled) {
      return null;
    }

    try {
      // Sigma-Aldrich API implementation
      // Note: This is a simplified example - actual API may differ
      const searchUrl = `${this.suppliers.sigma.baseUrl}/catalog/search`;
      
      const response = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.suppliers.sigma.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: chemicalName,
          cas: casNumber,
          maxResults: 5
        })
      });

      if (!response.ok) {
        throw new Error(`Sigma-Aldrich API error: ${response.status}`);
      }

      const data = await response.json();
      return this.parseSigmaResponse(data);
    } catch (error) {
      console.error('Sigma-Aldrich API error:', error);
      return null;
    }
  }

  parseSigmaResponse(data) {
    if (!data.results || data.results.length === 0) {
      return null;
    }

    return data.results.map(product => ({
      supplier: 'Sigma-Aldrich',
      productName: product.productName,
      catalogNumber: product.productNumber,
      price: product.listPrice,
      currency: 'USD',
      packageSize: product.packSize,
      purity: product.purity,
      availability: product.availability,
      confidence: 'HIGH'
    }));
  }

  // Get comprehensive pricing from all suppliers
  async getComprehensivePricing(chemicalName, casNumber = null, options = {}) {
    const results = {
      chemical: chemicalName,
      casNumber: casNumber,
      suppliers: [],
      bestPrice: null,
      averagePrice: null,
      priceRange: null,
      timestamp: new Date().toISOString(),
      options: options
    };

    // Fetch from all enabled suppliers in parallel
    const promises = [];
    
    if (this.suppliers.fisher.enabled) {
      promises.push(this.getFisherPricing(chemicalName, casNumber));
    }
    
    if (this.suppliers.sigma.enabled) {
      promises.push(this.getSigmaPricing(chemicalName, casNumber));
    }
    
    if (this.suppliers.vwr.enabled) {
      promises.push(this.getVWRPricing(chemicalName, casNumber));
    }

    try {
      const supplierResults = await Promise.allSettled(promises);
      
      // Process results
      supplierResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value) {
          if (Array.isArray(result.value)) {
            results.suppliers.push(...result.value);
          } else {
            results.suppliers.push(result.value);
          }
        }
      });

      // Calculate pricing statistics
      if (results.suppliers.length > 0) {
        const prices = results.suppliers
          .map(s => parseFloat(s.price))
          .filter(p => !isNaN(p))
          .sort((a, b) => a - b);

        if (prices.length > 0) {
          results.bestPrice = prices[0];
          results.averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length;
          results.priceRange = {
            min: prices[0],
            max: prices[prices.length - 1]
          };
        }
      }

      return results;
    } catch (error) {
      console.error('Comprehensive pricing error:', error);
      return results; // Return partial results
    }
  }

  // Enhanced pricing with market analysis
  async getEnhancedPricingWithAnalysis(chemicalName, casNumber = null) {
    const pricing = await this.getComprehensivePricing(chemicalName, casNumber);
    
    // Add market analysis
    const analysis = {
      ...pricing,
      marketAnalysis: {
        priceVolatility: this.analyzePriceVolatility(pricing.suppliers),
        supplyChainRisk: this.assessSupplyChainRisk(pricing.suppliers),
        recommendedSuppliers: this.recommendSuppliers(pricing.suppliers),
        bulkDiscountPotential: this.estimateBulkDiscounts(pricing.suppliers),
        seasonalTrends: this.getSeasonalTrends(chemicalName)
      },
      recommendations: this.generatePricingRecommendations(pricing)
    };

    return analysis;
  }

  analyzePriceVolatility(suppliers) {
    if (suppliers.length < 2) return 'INSUFFICIENT_DATA';
    
    const prices = suppliers.map(s => parseFloat(s.price)).filter(p => !isNaN(p));
    if (prices.length < 2) return 'LOW';
    
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const variance = prices.reduce((acc, price) => acc + Math.pow(price - avg, 2), 0) / prices.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / avg;
    
    if (coefficientOfVariation > 0.3) return 'HIGH';
    if (coefficientOfVariation > 0.15) return 'MEDIUM';
    return 'LOW';
  }

  assessSupplyChainRisk(suppliers) {
    // Assess based on supplier diversity, availability, lead times
    const availableSuppliers = suppliers.filter(s => s.availability !== 'OUT_OF_STOCK').length;
    const avgLeadTime = suppliers.reduce((acc, s) => acc + (s.leadTime || 7), 0) / suppliers.length;
    
    if (availableSuppliers === 0) return 'CRITICAL';
    if (availableSuppliers === 1 || avgLeadTime > 14) return 'HIGH';
    if (availableSuppliers === 2 || avgLeadTime > 7) return 'MEDIUM';
    return 'LOW';
  }

  recommendSuppliers(suppliers) {
    return suppliers
      .filter(s => s.availability !== 'OUT_OF_STOCK')
      .sort((a, b) => {
        // Score based on price, availability, and supplier reputation
        const scoreA = this.calculateSupplierScore(a);
        const scoreB = this.calculateSupplierScore(b);
        return scoreB - scoreA;
      })
      .slice(0, 3);
  }

  calculateSupplierScore(supplier) {
    let score = 0;
    
    // Price factor (lower is better)
    score += 50 - (parseFloat(supplier.price) || 50);
    
    // Availability factor
    if (supplier.availability === 'IN_STOCK') score += 30;
    else if (supplier.availability === 'LIMITED') score += 15;
    
    // Lead time factor
    const leadTime = supplier.leadTime || 7;
    score += Math.max(0, 20 - leadTime);
    
    // Supplier reputation
    const reputationScores = {
      'Fisher Scientific': 25,
      'Sigma-Aldrich': 25,
      'VWR': 20,
      'Thermo Fisher': 25
    };
    score += reputationScores[supplier.supplier] || 10;
    
    return score;
  }

  estimateBulkDiscounts(suppliers) {
    // Estimate potential bulk discounts based on typical industry patterns
    return {
      tier1: { quantity: '5+ units', discount: '5-10%' },
      tier2: { quantity: '25+ units', discount: '10-20%' },
      tier3: { quantity: '100+ units', discount: '20-35%' }
    };
  }

  getSeasonalTrends(chemicalName) {
    // Basic seasonal trend analysis
    // In a real implementation, this would use historical data
    const seasonalChemicals = {
      'methanol': 'Higher demand in winter (antifreeze applications)',
      'chlorine': 'Peak demand in summer (pool season)',
      'fertilizer': 'Peak demand in spring (growing season)'
    };
    
    const name = chemicalName.toLowerCase();
    for (const [chemical, trend] of Object.entries(seasonalChemicals)) {
      if (name.includes(chemical)) {
        return trend;
      }
    }
    
    return 'No significant seasonal trends identified';
  }

  generatePricingRecommendations(pricing) {
    const recommendations = [];
    
    if (pricing.suppliers.length === 0) {
      recommendations.push({
        type: 'WARNING',
        message: 'No supplier pricing found. Consider manual supplier outreach.'
      });
    } else if (pricing.suppliers.length === 1) {
      recommendations.push({
        type: 'CAUTION',
        message: 'Limited supplier options. Consider finding alternative sources.'
      });
    }
    
    if (pricing.bestPrice && pricing.averagePrice) {
      const savings = ((pricing.averagePrice - pricing.bestPrice) / pricing.averagePrice * 100).toFixed(1);
      if (savings > 15) {
        recommendations.push({
          type: 'OPPORTUNITY',
          message: `Potential ${savings}% savings by choosing best-priced supplier.`
        });
      }
    }
    
    return recommendations;
  }

  // Placeholder for VWR API (similar structure to Fisher/Sigma)
  async getVWRPricing(chemicalName, casNumber = null) {
    // VWR API implementation would go here
    return null;
  }
}

export default SupplierPricingService; 