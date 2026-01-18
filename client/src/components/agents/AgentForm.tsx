import { useForm } from 'react-hook-form';
import { Agent, AgentFormData } from '../../types/agent';
import './AgentForm.css';

interface AgentFormProps {
  agent?: Agent; // If provided, form is in edit mode
  onSuccess: () => void;
  onCancel: () => void;
}

export default function AgentForm({ agent, onSuccess, onCancel }: AgentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<AgentFormData>({
    defaultValues: agent ? {
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      company: agent.company || '',
      commissionRate: agent.commissionRate,
      notes: agent.notes || ''
    } : {
      name: '',
      email: '',
      phone: '',
      company: '',
      commissionRate: 10,
      notes: ''
    }
  });

  const onSubmit = async (data: AgentFormData) => {
    try {
      const url = agent
        ? `http://localhost:3001/api/agents/${agent._id}`
        : 'http://localhost:3001/api/agents';

      const method = agent ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        alert(agent ? 'Agent updated successfully!' : 'Agent created successfully!');
        onSuccess();
      } else {
        alert(result.message || 'Error saving agent');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error connecting to server. Please try again.');
    }
  };

  return (
    <div className="agent-form-container">
      <h2>{agent ? 'Edit Agent' : 'Create New Agent'}</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="agent-form">

        {/* Name */}
        <div className="form-group">
          <label htmlFor="name">Full Name *</label>
          <input
            id="name"
            type="text"
            {...register('name', {
              required: 'Name is required',
              minLength: { value: 2, message: 'Name must be at least 2 characters' }
            })}
          />
          {errors.name && <span className="error">{errors.name.message}</span>}
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            type="email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
          />
          {errors.email && <span className="error">{errors.email.message}</span>}
        </div>

        {/* Phone */}
        <div className="form-group">
          <label htmlFor="phone">Phone *</label>
          <input
            id="phone"
            type="tel"
            {...register('phone', {
              required: 'Phone is required',
              minLength: { value: 8, message: 'Phone must be at least 8 characters' }
            })}
          />
          {errors.phone && <span className="error">{errors.phone.message}</span>}
        </div>

        {/* Company (Optional) */}
        <div className="form-group">
          <label htmlFor="company">Company</label>
          <input
            id="company"
            type="text"
            {...register('company')}
          />
        </div>

        {/* Commission Rate */}
        <div className="form-group">
          <label htmlFor="commissionRate">Commission Rate (%) *</label>
          <input
            id="commissionRate"
            type="number"
            step="0.1"
            min="0"
            max="100"
            {...register('commissionRate', {
              required: 'Commission rate is required',
              min: { value: 0, message: 'Commission rate must be at least 0%' },
              max: { value: 100, message: 'Commission rate cannot exceed 100%' },
              valueAsNumber: true
            })}
          />
          {errors.commissionRate && <span className="error">{errors.commissionRate.message}</span>}
          <small>Percentage of revenue the agent will receive as commission</small>
        </div>

        {/* Notes */}
        <div className="form-group">
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            rows={4}
            {...register('notes')}
            placeholder="Additional information about the agent..."
          />
        </div>

        {/* Buttons */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-cancel"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (agent ? 'Update Agent' : 'Create Agent')}
          </button>
        </div>
      </form>
    </div>
  );
}
