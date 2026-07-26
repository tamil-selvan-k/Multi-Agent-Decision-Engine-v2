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

    let summary = 'Here is the current analysis from our domain agents:';
    const bullets: string[] = [];
    let impact = 'Maintains balanced supply chain flow and corporate compliance.';
    let reasoning = 'Corporate telemetry shows active inventory parameters and budget thresholds are in sync.';
    let status = 'Ready';
    let agentName = 'Enterprise Agent';

    try {
      const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:3001/api/v1/orchestrate';
      const sessionId = `chat_session_${Date.now()}`;
      const response = await fetch(pythonServiceUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          user_input: text,
          parameters: {}
        })
      });

      if (response.ok) {
        const result: any = await response.json();
        if (result && result.final_decision) {
          let decisionData: any = null;
          try {
            decisionData = typeof result.final_decision === 'string' 
              ? JSON.parse(result.final_decision) 
              : result.final_decision;
          } catch (e) {
            decisionData = { recommendation: result.final_decision };
          }

          if (decisionData) {
            agentName = 'Enterprise Decision Engine';
            status = `Confidence: ${Math.round((decisionData.confidence || 0.9) * 100)}%`;
            summary = decisionData.overall_situation || 'Orchestration and decision synthesis completed successfully.';
            
            // 1. Planner Plan
            if (result.agent_outputs && Array.isArray(result.agent_outputs)) {
              const selectedAgents = result.agent_outputs.map((a: any) => a.agent_name);
              if (selectedAgents.length > 0) {
                bullets.push(`[Planner Plan] Invoked and coordinated domain agents: ${selectedAgents.join(', ')}`);
              }
            }

            // 2. Domain Agent Outputs
            if (result.agent_outputs && Array.isArray(result.agent_outputs)) {
              result.agent_outputs.forEach((a: any) => {
                bullets.push(`[Agent Output] ${a.agent_name} (Confidence: ${Math.round((a.confidence || 0.9) * 100)}%): ${a.recommendation}`);
              });
            }

            // 3. Corporate Policies Applied
            if (decisionData.policies_applied && Array.isArray(decisionData.policies_applied) && decisionData.policies_applied.length > 0) {
              bullets.push(`Corporate Policies checked: ${decisionData.policies_applied.join(', ')}`);
            }

            // 4. Decision Risks
            if (decisionData.risks && Array.isArray(decisionData.risks)) {
              decisionData.risks.forEach((r: string) => {
                bullets.push(`[Risk Alert] ${r}`);
              });
            }

            // 5. Final Consensus Recommendation
            if (decisionData.recommendation) {
              bullets.push(`[Consensus Recommendation] ${decisionData.recommendation}`);
            }
            
            impact = decisionData.business_impact || 'Strategic alignment across Sales, Operations, and Finance.';
            reasoning = decisionData.reasoning || 'Synthesized across all domain insights to enforce optimal safety stock buffer limits.';
          }
        }
      } else {
        const errorText = await response.text();
        console.error('Python service error response:', errorText);
        throw new Error('Python service returned error status');
      }
    } catch (error: any) {
      console.error('Failed to query Python Decision Engine:', error.message);
      
      // Fallback: Fetch context from Database
      const prodRec = await prisma.production_recommendation.findFirst({ orderBy: { id: 'desc' } });
      const reorderRec = await prisma.reorder_recommendation.findFirst({ orderBy: { id: 'desc' } });
      const supplierRec = await prisma.supplier_recommendation.findFirst({ orderBy: { id: 'desc' } });
      const deliveryRisk = await prisma.delivery_risk.findFirst({ orderBy: { id: 'desc' } });
      const deliveryEta = await prisma.delivery_eta.findFirst({ orderBy: { id: 'desc' } });
      const financialRisk = await prisma.financial_risk.findFirst({ orderBy: { id: 'desc' } });
      const budgetImpactData = await prisma.budget_impact.findFirst({ orderBy: { id: 'desc' } });
      const roiData = await prisma.financial_roi.findFirst({ orderBy: { id: 'desc' } });

      if (query.includes('production') || query.includes('sales') || query.includes('recommendation')) {
        summary = 'Production Recommendation Analysis:';
        bullets.push(`Production Recommendation: ${prodRec?.recommendation || 'Maintain current production'}`);
        if (reorderRec?.reorder) {
          bullets.push(`Inventory indicates replenishment is needed (${reorderRec.quantity} units, priority: ${reorderRec.priority})`);
        }
        impact = 'Boosts sales capture rates and production velocity to align with forecasted market demand.';
        reasoning = 'Strong demand signals in sales forecast warrant active replenishment from optimal suppliers.';
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
        impact = 'Restores safety stock buffer while mitigating warehouse capacity bottlenecks.';
        reasoning = 'Reordering safety stock minimizes stockout probability for key regional distribution units.';
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
        impact = 'Optimizes freight carrier costs and shipment ETAs across critical routing lanes.';
        reasoning = 'Evaluating alternative logistics carrier lanes mitigates transit disruption risks during peak weather windows.';
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
        impact = 'Secures cashflow yield while enforcing operational department budget limits.';
        reasoning = 'Strategic capital reallocations are restricted to profitable, high-ROI business units.';
      } 
      else {
        bullets.push(`Sales/Production: ${prodRec?.recommendation || 'Maintain current production'}`);
        if (reorderRec?.reorder) {
          bullets.push(`Inventory replenishment: Reorder ${reorderRec.quantity} units from ${supplierRec?.supplier || 'Supplier A'} (${reorderRec.priority} priority)`);
        } else {
          bullets.push('Inventory replenishment: Not required at this time.');
        }
        bullets.push(`Logistics Delivery Risk: ${deliveryRisk?.risk_level || 'Low'} (Average duration: ${deliveryEta?.estimated_delivery_hours || 0}h)`);
        bullets.push(`Financial Risk: ${financialRisk?.risk_level || 'Low'} (Remaining budget: $${budgetImpactData?.remaining_budget?.toLocaleString() || '0'})`);
        
        impact = 'Ensures continuous supply chain alignment and prevents resource resource bottlenecks.';
        reasoning = 'Cross-functional telemetry checks are run routinely to enforce safety stock and budget limits.';
      }
    }

    const assistantReply = {
      id: Date.now() + 1,
      role: 'assistant',
      agentName,
      status,
      summary,
      bullets,
      impact,
      reasoning
    };

    messageHistory.push(assistantReply);

    return new ApiResponse(200, assistantReply, 'Reply generated successfully');
  });
}
