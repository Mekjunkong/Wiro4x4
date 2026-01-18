import { useState, useEffect } from 'react';
import { Agent } from '../../types/agent';
import './AgentAssignment.css';

interface AgentAssignmentProps {
  bookingId: string;
  currentAgentId?: string | null;
  currentAgentName?: string;
  onAssigned: () => void;
}

export default function AgentAssignment({
  bookingId,
  currentAgentId,
  currentAgentName,
  onAssigned
}: AgentAssignmentProps) {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingAgents, setLoadingAgents] = useState(true);

  useEffect(() => {
    fetchActiveAgents();
  }, []);

  useEffect(() => {
    // Set initial selection to current agent
    if (currentAgentId) {
      setSelectedAgentId(currentAgentId);
    }
  }, [currentAgentId]);

  const fetchActiveAgents = async () => {
    try {
      setLoadingAgents(true);
      const response = await fetch('http://localhost:3001/api/agents?status=active');
      const data = await response.json();

      if (data.success) {
        setAgents(data.agents);
      }
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoadingAgents(false);
    }
  };

  const handleAssignAgent = async () => {
    if (!selectedAgentId) {
      alert('Please select an agent');
      return;
    }

    if (selectedAgentId === currentAgentId) {
      alert('This agent is already assigned');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3001/api/bookings/${bookingId}/assign-agent`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ agentId: selectedAgentId })
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('Agent assigned successfully');
        onAssigned();
      } else {
        alert(data.message || 'Failed to assign agent');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error assigning agent');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAgent = async () => {
    if (!confirm('Are you sure you want to remove the assigned agent?')) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:3001/api/bookings/${bookingId}/assign-agent`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ agentId: null })
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('Agent removed successfully');
        setSelectedAgentId('');
        onAssigned();
      } else {
        alert(data.message || 'Failed to remove agent');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error removing agent');
    } finally {
      setLoading(false);
    }
  };

  if (loadingAgents) {
    return (
      <div className="agent-assignment">
        <div className="loading-small">Loading agents...</div>
      </div>
    );
  }

  return (
    <div className="agent-assignment">
      {/* Current Assignment */}
      {currentAgentId && currentAgentName && (
        <div className="current-assignment">
          <label>Currently Assigned:</label>
          <div className="assigned-agent">
            <span className="agent-name">{currentAgentName}</span>
            <button
              onClick={handleRemoveAgent}
              disabled={loading}
              className="btn-remove"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Assignment Controls */}
      <div className="assignment-controls">
        <label htmlFor="agent-select">
          {currentAgentId ? 'Change Agent:' : 'Assign Agent:'}
        </label>
        <div className="assignment-input">
          <select
            id="agent-select"
            value={selectedAgentId}
            onChange={(e) => setSelectedAgentId(e.target.value)}
            disabled={loading}
            className="agent-select"
          >
            <option value="">-- Select Agent --</option>
            {agents.map((agent) => (
              <option key={agent._id} value={agent._id}>
                {agent.name} {agent.company ? `(${agent.company})` : ''} - {agent.commissionRate}%
              </option>
            ))}
          </select>
          <button
            onClick={handleAssignAgent}
            disabled={loading || !selectedAgentId}
            className="btn-assign"
          >
            {loading ? 'Assigning...' : 'Assign'}
          </button>
        </div>
      </div>

      {agents.length === 0 && (
        <div className="no-agents">
          No active agents available. Create an agent in the Agents section first.
        </div>
      )}
    </div>
  );
}
