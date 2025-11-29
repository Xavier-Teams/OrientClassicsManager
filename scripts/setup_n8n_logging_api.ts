// ============================================================================
// N8N LOGGING API ENDPOINTS
// ============================================================================
// API endpoints để N8N log workflow execution
// Add to server/routes.ts
// ============================================================================

import { Express } from 'express';
import { z } from 'zod';

const logEntrySchema = z.object({
  workflow_name: z.string(),
  execution_id: z.string().optional(),
  node_name: z.string(),
  node_type: z.string(),
  status: z.enum(['success', 'error', 'warning', 'info']),
  input_data: z.any().optional(),
  output_data: z.any().optional(),
  error_message: z.string().optional(),
  error_stack: z.string().optional(),
  execution_time_ms: z.number().optional(),
});

export function registerN8NLoggingRoutes(app: Express, storage: any) {
  // ============================================================================
  // LOG WORKFLOW EXECUTION
  // ============================================================================
  
  app.post('/api/n8n/logs', async (req, res) => {
    try {
      const validated = logEntrySchema.parse(req.body);
      
      const logId = await storage.query(`
        SELECT log_workflow_execution(
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
        ) as id
      `, [
        validated.workflow_name,
        validated.execution_id || null,
        validated.node_name,
        validated.node_type,
        validated.status,
        validated.input_data ? JSON.stringify(validated.input_data) : null,
        validated.output_data ? JSON.stringify(validated.output_data) : null,
        validated.error_message || null,
        validated.error_stack || null,
        validated.execution_time_ms || null,
      ]);
      
      res.status(201).json({ 
        success: true, 
        log_id: logId[0].id 
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // GET WORKFLOW LOGS
  // ============================================================================
  
  app.get('/api/n8n/logs', async (req, res) => {
    try {
      const {
        workflow_name,
        execution_id,
        status,
        node_name,
        limit = 100,
        offset = 0,
      } = req.query;

      const logs = await storage.query(`
        SELECT 
          id,
          workflow_name,
          execution_id,
          node_name,
          node_type,
          status,
          input_data,
          output_data,
          error_message,
          error_stack,
          execution_time_ms,
          created_at
        FROM n8n_workflow_logs
        WHERE 
          ($1::text IS NULL OR workflow_name = $1)
          AND ($2::text IS NULL OR execution_id = $2)
          AND ($3::text IS NULL OR status = $3)
          AND ($4::text IS NULL OR node_name = $4)
        ORDER BY created_at DESC
        LIMIT $5 OFFSET $6
      `, [
        workflow_name as string || null,
        execution_id as string || null,
        status as string || null,
        node_name as string || null,
        parseInt(limit as string),
        parseInt(offset as string),
      ]);

      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // GET EXECUTION SUMMARY
  // ============================================================================
  
  app.get('/api/n8n/logs/execution/:execution_id', async (req, res) => {
    try {
      const { execution_id } = req.params;

      const logs = await storage.query(`
        SELECT 
          id,
          workflow_name,
          node_name,
          node_type,
          status,
          error_message,
          execution_time_ms,
          created_at
        FROM n8n_workflow_logs
        WHERE execution_id = $1
        ORDER BY created_at ASC
      `, [execution_id]);

      const summary = await storage.query(`
        SELECT 
          COUNT(*) as total_nodes,
          COUNT(*) FILTER (WHERE status = 'success') as success_count,
          COUNT(*) FILTER (WHERE status = 'error') as error_count,
          SUM(execution_time_ms) as total_time_ms,
          MIN(created_at) as started_at,
          MAX(created_at) as completed_at
        FROM n8n_workflow_logs
        WHERE execution_id = $1
      `, [execution_id]);

      res.json({
        execution_id,
        logs,
        summary: summary[0],
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============================================================================
  // GET WORKFLOW STATISTICS
  // ============================================================================
  
  app.get('/api/n8n/logs/statistics', async (req, res) => {
    try {
      const { workflow_name, days = 7 } = req.query;

      const stats = await storage.query(`
        SELECT 
          workflow_name,
          COUNT(*) as total_executions,
          COUNT(DISTINCT execution_id) as unique_executions,
          COUNT(*) FILTER (WHERE status = 'success') as success_count,
          COUNT(*) FILTER (WHERE status = 'error') as error_count,
          AVG(execution_time_ms) as avg_execution_time_ms,
          MAX(created_at) as last_execution
        FROM n8n_workflow_logs
        WHERE 
          ($1::text IS NULL OR workflow_name = $1)
          AND created_at >= NOW() - INTERVAL '${days} days'
        GROUP BY workflow_name
        ORDER BY total_executions DESC
      `, [workflow_name as string || null]);

      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
}

