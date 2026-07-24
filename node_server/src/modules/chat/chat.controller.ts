import { Request } from 'express';
import { prisma } from '@utils/prisma';
import { asyncHandler } from '@utils/asyncHandler';
import { ApiResponse } from '@utils/ApiResponse';

const welcomeMessage = {
  id: 'welcome-msg',
  role: 'assistant',
  agentName: 'Enterprise Agent',
  status: 'Online',
  summary: 'Hello! I am your Enterprise Decision Assistant. How can I help you analyze your operations today?',
  bullets: [
    'Ask about current production recommendations',
    'Inquire about inventory levels & reorder alerts',
    'Check shipment logistics & transit times',
    'Examine budget utilization & financial risks'
  ]
};

// In-memory message store for the session to persist user conversations
const messageHistory: any[] = [welcomeMessage];

export class ChatController {
  public static getMessages = asyncHandler(async () => {
    return new ApiResponse(200, messageHistory, 'Chat messages retrieved successfully');
  });

  public static sendMessage = asyncHandler(async (req: Request) => {
    const { text } = req.body;
    const query = String(text || '').toLowerCase();

    // 1. Save user message to history
    messageHistory.push({
      id: Date.now(),
      role: 'user',
      text
    });

    // 2. Fetch context from Database
    const prodRec = await prisma.production_recommendation.findFirst({ orderBy: { id: 'desc' } });
    const reorderRec = await prisma.reorder_recommendation.findFirst({ orderBy: { id: 'desc' } });
    const supplierRec = await prisma.supplier_recommendation.findFirst({ orderBy: { id: 'desc' } });
    const deliveryRisk = await prisma.delivery_risk.findFirst({ orderBy: { id: 'desc' } });
    const deliveryEta = await prisma.delivery_eta.findFirst({ orderBy: { id: 'desc' } });
    const financialRisk = await prisma.financial_risk.findFirst({ orderBy: { id: 'desc' } });
    const budgetImpactData = await prisma.budget_impact.findFirst({ orderBy: { id: 'desc' } });
    const roiData = await prisma.financial_roi.findFirst({ orderBy: { id: 'desc' } });

    let summary = 'Here is the current analysis from our domain agents:';
    const bullets: string[] = [];
    let impact = 'Low Impact';

    // 3. Simple rule-based routing to provide domain specific answers
    if (query.includes('production') || query.includes('sales') || query.includes('recommendation')) {
      summary = 'Production Recommendation Analysis:';
      bullets.push(`Production Recommendation: ${prodRec?.recommendation || 'Maintain current production'}`);
      if (reorderRec?.reorder) {
        bullets.push(`Inventory indicates replenishment is needed (${reorderRec.quantity} units, priority: ${reorderRec.priority})`);
      }
      impact = 'Medium Impact';
    } 
    else if (query.includes('inventory') || query.includes('reorder') || query.includes('supplier')) {
      summary = 'Inventory and Supply Chain Status:';
      if (reorderRec?.reorder) {
        bullets.push(`Reorder Status: Recommended replenishing ${reorderRec.quantity} units.`);
        bullets.push(`Priority Level: ${reorderRec.priority}`);
        if (supplierRec) {
          bullets.push(`Recommended Supplier: ${supplierRec.supplier} (Score: ${supplierRec.score}/100, Reason: ${supplierRec.reason})`);
          bullets.push(`Estimated procurement cost: $${supplierRec.estimated_cost?.toLocaleString()}`);
        }
      } else {
        bullets.push('Reorder Status: No replenishment required at this time.');
      }
      impact = reorderRec?.priority === 'High' ? 'High Impact' : 'Medium Impact';
    } 
    else if (query.includes('logistics') || query.includes('shipment') || query.includes('delay') || query.includes('eta') || query.includes('delivery')) {
      summary = 'Logistics & Transit Performance:';
      bullets.push(`Overall Logistics Risk Level: ${deliveryRisk?.risk_level || 'Low'} (Score: ${deliveryRisk?.risk_score || 0}/100)`);
      if (deliveryRisk?.reason) {
        bullets.push(`Risk Factor: ${deliveryRisk.reason}`);
      }
      if (deliveryEta) {
        bullets.push(`Average Delivery Duration: ${deliveryEta.estimated_delivery_hours} hours`);
        bullets.push(`Expected Delay Risk: ${(deliveryEta.delay_probability || 0) * 100}%`);
      }
      impact = deliveryRisk?.risk_level === 'High' ? 'High Impact' : 'Medium Impact';
    } 
    else if (query.includes('finance') || query.includes('budget') || query.includes('cost') || query.includes('roi')) {
      summary = 'Financial Performance & Risk Assessment:';
      bullets.push(`Financial Risk Level: ${financialRisk?.risk_level || 'Low'} (Score: ${financialRisk?.risk_score || 0}/100)`);
      if (budgetImpactData) {
        bullets.push(`Budget Limit Exceeded: ${budgetImpactData.budget_exceeded ? 'Yes' : 'No'}`);
        bullets.push(`Remaining Cash Buffer: $${budgetImpactData.remaining_budget?.toLocaleString()}`);
      }
      if (roiData) {
        bullets.push(`Expected Investment Return: $${roiData.expected_return?.toLocaleString()}`);
        bullets.push(`ROI: ${roiData.roi}% (${roiData.profitable ? 'Profitable' : 'Not Profitable'})`);
      }
      impact = financialRisk?.risk_level === 'High' ? 'High Impact' : 'Medium Impact';
    } 
    else {
      // General overview
      bullets.push(`Sales/Production: ${prodRec?.recommendation || 'Maintain current production'}`);
      if (reorderRec?.reorder) {
        bullets.push(`Inventory replenishment: Reorder ${reorderRec.quantity} units from ${supplierRec?.supplier || 'Supplier A'} (${reorderRec.priority} priority)`);
      } else {
        bullets.push('Inventory replenishment: Not required at this time.');
      }
      bullets.push(`Logistics Delivery Risk: ${deliveryRisk?.risk_level || 'Low'} (Average duration: ${deliveryEta?.estimated_delivery_hours || 0}h)`);
      bullets.push(`Financial Risk: ${financialRisk?.risk_level || 'Low'} (Remaining budget: $${budgetImpactData?.remaining_budget?.toLocaleString() || '0'})`);
      
      if (financialRisk?.risk_level === 'High' || deliveryRisk?.risk_level === 'High' || reorderRec?.priority === 'High') {
        impact = 'High Impact';
      } else if (financialRisk?.risk_level === 'Medium' || deliveryRisk?.risk_level === 'Medium') {
        impact = 'Medium Impact';
      }
    }

    const assistantReply = {
      id: Date.now() + 1,
      role: 'assistant',
      agentName: 'Enterprise Agent',
      status: 'Ready',
      summary,
      bullets,
      impact
    };

    messageHistory.push(assistantReply);

    return new ApiResponse(200, assistantReply, 'Reply generated successfully');
  });
}
