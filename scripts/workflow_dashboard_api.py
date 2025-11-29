#!/usr/bin/env python3
"""
Workflow Monitoring Dashboard API
Provides REST API endpoints for monitoring N8N workflow executions
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import psycopg2
from psycopg2.extras import RealDictCursor
from datetime import datetime, timedelta
import os
from typing import Dict, List, Optional

app = Flask(__name__)
CORS(app)

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': os.getenv('DB_PORT', '5432'),
    'database': os.getenv('DB_NAME', 'translation_db'),
    'user': os.getenv('DB_USER', 'n8n_user'),
    'password': os.getenv('DB_PASSWORD', 'your_password_here')
}


def get_db_connection():
    """Get database connection"""
    return psycopg2.connect(**DB_CONFIG)


@app.route('/api/workflow/dashboard/summary', methods=['GET'])
def get_dashboard_summary():
    """Get dashboard summary statistics"""
    try:
        days_back = int(request.args.get('days', 7))
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT * FROM get_workflow_dashboard_summary(%s)
        """, (days_back,))
        
        result = cur.fetchone()
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': dict(result) if result else None
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/workflow/stats', methods=['GET'])
def get_workflow_stats():
    """Get workflow execution statistics"""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("SELECT * FROM v_workflow_execution_stats")
        results = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': [dict(row) for row in results]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/workflow/recent', methods=['GET'])
def get_recent_executions():
    """Get recent workflow executions"""
    try:
        limit = int(request.args.get('limit', 50))
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("""
            SELECT * FROM v_recent_workflow_executions 
            LIMIT %s
        """, (limit,))
        
        results = cur.fetchall()
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': [dict(row) for row in results]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/workflow/errors', methods=['GET'])
def get_workflow_errors():
    """Get workflow errors summary"""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("SELECT * FROM v_workflow_errors")
        results = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': [dict(row) for row in results]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/workflow/performance', methods=['GET'])
def get_workflow_performance():
    """Get workflow performance metrics"""
    try:
        workflow_name = request.args.get('workflow_name')
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if workflow_name:
            cur.execute("""
                SELECT * FROM v_workflow_performance 
                WHERE workflow_name = %s
            """, (workflow_name,))
        else:
            cur.execute("SELECT * FROM v_workflow_performance")
        
        results = cur.fetchall()
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': [dict(row) for row in results]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/workflow/notifications', methods=['GET'])
def get_notification_stats():
    """Get notification statistics"""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute("SELECT * FROM v_notification_stats")
        results = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': [dict(row) for row in results]
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/workflow/<workflow_name>/details', methods=['GET'])
def get_workflow_details(workflow_name: str):
    """Get detailed information for a specific workflow"""
    try:
        days_back = int(request.args.get('days', 7))
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Get workflow statistics
        cur.execute("""
            SELECT * FROM v_workflow_execution_stats 
            WHERE workflow_name = %s
        """, (workflow_name,))
        stats = cur.fetchone()
        
        # Get recent executions
        cur.execute("""
            SELECT * FROM v_recent_workflow_executions 
            WHERE workflow_name = %s
            ORDER BY started_at DESC
            LIMIT 20
        """, (workflow_name,))
        recent = cur.fetchall()
        
        # Get errors
        cur.execute("""
            SELECT * FROM v_workflow_errors 
            WHERE workflow_name = %s
        """, (workflow_name,))
        errors = cur.fetchall()
        
        # Get performance
        cur.execute("""
            SELECT * FROM v_workflow_performance 
            WHERE workflow_name = %s
        """, (workflow_name,))
        performance = cur.fetchall()
        
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'data': {
                'stats': dict(stats) if stats else None,
                'recent_executions': [dict(row) for row in recent],
                'errors': [dict(row) for row in errors],
                'performance': [dict(row) for row in performance]
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT 1")
        cur.close()
        conn.close()
        
        return jsonify({
            'success': True,
            'status': 'healthy',
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'status': 'unhealthy',
            'error': str(e)
        }), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

