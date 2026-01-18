import { useState, useEffect } from 'react';
import { Agent, AgentStatus } from '../../types/agent';
import AgentForm from './AgentForm';
import AgentDetail from './AgentDetail';
import './AgentDashboard.css';

export default function AgentDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/agents');
      const data = await response.json();

      if (data.success) {
        setAgents(data.agents);
        setError(null);
      } else {
        setError('Failed to fetch agents');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (agentId: string, newStatus: AgentStatus) => {
    if (!confirm(`Are you sure you want to change this agent's status to ${newStatus}?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/agents/${agentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        fetchAgents();
        // Update selected agent if it's the one being changed
        if (selectedAgent?._id === agentId) {
          setSelectedAgent(data.agent);
        }
        alert('Agent status updated successfully');
      } else {
        alert(data.message || 'Failed to update agent status');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error updating agent status');
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if (!confirm('Are you sure you want to delete this agent? This will fail if the agent has assigned bookings.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/agents/${agentId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        fetchAgents();
        if (selectedAgent?._id === agentId) {
          setSelectedAgent(null);
        }
        alert('Agent deleted successfully');
      } else {
        alert(data.message || 'Failed to delete agent');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error deleting agent');
    }
  };

  const handleCreateNew = () => {
    setEditingAgent(null);
    setShowForm(true);
  };

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingAgent(null);
    fetchAgents();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAgent(null);
  };

  const getFilteredAgents = (): Agent[] => {
    if (statusFilter === 'all') {
      return agents;
    }
    return agents.filter(agent => agent.status === statusFilter);
  };

  const getStatusColor = (status: AgentStatus) => {
    const colors = {
      active: '#27ae60',
      inactive: '#95a5a6',
      suspended: '#e74c3c'
    };
    return colors[status];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="agent-dashboard">
        <div className="loading">Loading agents...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="agent-dashboard">
        <div className="error">{error}</div>
        <button onClick={fetchAgents} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  const filteredAgents = getFilteredAgents();

  // Show form in overlay mode
  if (showForm) {
    return (
      <div className="agent-dashboard">
        <div className="form-overlay">
          <AgentForm
            agent={editingAgent || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="agent-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header">
        <h1>Agent Management</h1>
        <div className="header-actions">
          <button onClick={fetchAgents} className="refresh-button">
            Refresh
          </button>
          <button onClick={handleCreateNew} className="create-button">
            + Create New Agent
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <label>
          Filter by Status:
          <select
            className="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Agents</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </label>
        <span className="agent-count">
          Showing {filteredAgents.length} of {agents.length} agents
        </span>
      </div>

      {/* Dashboard Content - Two Column Layout */}
      <div className="dashboard-content">
        {/* Agents List */}
        <div className="agents-list-container">
          <h2>Agents</h2>
          {filteredAgents.length === 0 ? (
            <div className="empty-state">
              {statusFilter === 'all'
                ? 'No agents found. Create your first agent to get started.'
                : `No ${statusFilter} agents found.`}
            </div>
          ) : (
            <div className="agents-list">
              {filteredAgents.map((agent) => (
                <div
                  key={agent._id}
                  className={`agent-card ${selectedAgent?._id === agent._id ? 'selected' : ''}`}
                  onClick={() => setSelectedAgent(agent)}
                >
                  <div className="agent-card-header">
                    <h3>{agent.name}</h3>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(agent.status) }}
                    >
                      {agent.status}
                    </span>
                  </div>
                  <div className="agent-card-body">
                    <div className="agent-card-info">
                      <span className="info-label">Email:</span>
                      <span className="info-value">{agent.email}</span>
                    </div>
                    {agent.company && (
                      <div className="agent-card-info">
                        <span className="info-label">Company:</span>
                        <span className="info-value">{agent.company}</span>
                      </div>
                    )}
                    <div className="agent-card-metrics">
                      <div className="metric">
                        <span className="metric-label">Bookings:</span>
                        <span className="metric-value">{agent.totalBookings}</span>
                      </div>
                      <div className="metric">
                        <span className="metric-label">Commission:</span>
                        <span className="metric-value">{formatCurrency(agent.totalCommission)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="agent-card-footer">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(agent);
                      }}
                      className="btn-edit-small"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAgent(agent._id);
                      }}
                      className="btn-delete-small"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Agent Detail Panel */}
        <div className="agent-detail-container">
          {selectedAgent ? (
            <AgentDetail
              agent={selectedAgent}
              onEdit={() => handleEdit(selectedAgent)}
              onStatusChange={handleStatusChange}
              onRefresh={fetchAgents}
            />
          ) : (
            <div className="no-selection">
              <p>Select an agent to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
