import { useState, useEffect } from 'react';
import { FinancialSummary, MonthlyFinancialData, AgentPerformance, MONTH_NAMES } from '../../types/financial';
import { ConversionStats } from '../../types/lead';
import './FinancialDashboard.css';

export default function FinancialDashboard() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyFinancialData | null>(null);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([]);
  const [conversionStats, setConversionStats] = useState<ConversionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  useEffect(() => {
    fetchAllData();
  }, [selectedYear, selectedMonth]);

  const fetchAllData = async () => {
    setLoading(true);
    await Promise.all([
      fetchSummary(),
      fetchMonthlyData(),
      fetchAgentPerformance(),
      fetchConversionStats()
    ]);
    setLoading(false);
  };

  const fetchSummary = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/financial/summary');
      const data = await response.json();
      if (data.success) {
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchMonthlyData = async () => {
    try {
      const response = await fetch(
        `http://localhost:3001/api/financial/monthly?year=${selectedYear}&month=${selectedMonth}`
      );
      const data = await response.json();
      if (data.success) {
        setMonthlyData(data.data);
      }
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    }
  };

  const fetchAgentPerformance = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/financial/agent-performance');
      const data = await response.json();
      if (data.success) {
        setAgentPerformance(data.agents);
      }
    } catch (error) {
      console.error('Error fetching agent performance:', error);
    }
  };

  const fetchConversionStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/leads/stats/conversion');
      const data = await response.json();
      if (data.success) {
        setConversionStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching conversion stats:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading && !summary) {
    return (
      <div className="financial-dashboard">
        <div className="loading">Loading financial data...</div>
      </div>
    );
  }

  return (
    <div className="financial-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Financial Dashboard</h1>
        <button onClick={fetchAllData} className="refresh-button">
          Refresh
        </button>
      </div>

      {/* Overall Summary Cards */}
      {summary && (
        <div className="summary-cards">
          <div className="summary-card revenue">
            <div className="card-icon">💰</div>
            <div className="card-content">
              <div className="card-label">Total Revenue</div>
              <div className="card-value">{formatCurrency(summary.totalRevenue)}</div>
              <div className="card-detail">{summary.totalBookings} bookings</div>
            </div>
          </div>

          <div className="summary-card costs">
            <div className="card-icon">💸</div>
            <div className="card-content">
              <div className="card-label">Total Costs</div>
              <div className="card-value">{formatCurrency(summary.totalCosts)}</div>
              <div className="card-detail">Including commissions</div>
            </div>
          </div>

          <div className="summary-card profit">
            <div className="card-icon">📈</div>
            <div className="card-content">
              <div className="card-label">Total Profit</div>
              <div className="card-value profit-value">{formatCurrency(summary.totalProfit)}</div>
              <div className="card-detail">Margin: {formatPercent(summary.profitMargin)}</div>
            </div>
          </div>

          <div className="summary-card average">
            <div className="card-icon">📊</div>
            <div className="card-content">
              <div className="card-label">Avg Profit/Booking</div>
              <div className="card-value">{formatCurrency(summary.averageProfit)}</div>
              <div className="card-detail">{summary.completedBookings} completed</div>
            </div>
          </div>
        </div>
      )}

      {/* Lead Conversion Metrics */}
      {conversionStats && (
        <div className="conversion-section">
          <div className="section-header">
            <h2>Lead Conversion & Pipeline</h2>
          </div>

          <div className="conversion-content">
            <div className="conversion-funnel">
              <div className="funnel-step">
                <div className="funnel-number">{conversionStats.totalLeads}</div>
                <div className="funnel-label">Total Leads</div>
              </div>
              <div className="funnel-arrow">→</div>
              <div className="funnel-step">
                <div className="funnel-number">{conversionStats.quoteSentLeads}</div>
                <div className="funnel-label">Quotes Sent</div>
                <div className="funnel-rate">{conversionStats.quoteConversionRate.toFixed(1)}%</div>
              </div>
              <div className="funnel-arrow">→</div>
              <div className="funnel-step highlighted">
                <div className="funnel-number">{conversionStats.convertedLeads}</div>
                <div className="funnel-label">Converted</div>
                <div className="funnel-rate">{conversionStats.leadConversionRate.toFixed(1)}%</div>
              </div>
            </div>

            <div className="conversion-metrics">
              <div className="conversion-metric-card">
                <div className="metric-icon">🎯</div>
                <div className="metric-content">
                  <div className="metric-value">{formatPercent(conversionStats.quoteToBookingRate)}</div>
                  <div className="metric-label">Quote → Booking Rate</div>
                </div>
              </div>

              <div className="conversion-metric-card">
                <div className="metric-icon">💵</div>
                <div className="metric-content">
                  <div className="metric-value">{formatCurrency(conversionStats.averageQuoteValue)}</div>
                  <div className="metric-label">Avg Quote Value</div>
                </div>
              </div>

              <div className="conversion-metric-card">
                <div className="metric-icon">💰</div>
                <div className="metric-content">
                  <div className="metric-value">{formatCurrency(conversionStats.totalEstimatedRevenue)}</div>
                  <div className="metric-label">Pipeline Revenue</div>
                </div>
              </div>

              <div className="conversion-metric-card">
                <div className="metric-icon">⏱️</div>
                <div className="metric-content">
                  <div className="metric-value">{conversionStats.avgTimeToQuote.toFixed(1)} days</div>
                  <div className="metric-label">Avg Response Time</div>
                </div>
              </div>
            </div>

            <div className="source-breakdown">
              <h3>Conversion by Source</h3>
              <div className="source-table">
                <div className="source-row header">
                  <span>Source</span>
                  <span>Total</span>
                  <span>Converted</span>
                  <span>Rate</span>
                </div>
                {Object.entries(conversionStats.bySource).map(([source, data]) => (
                  data.total > 0 && (
                    <div key={source} className="source-row">
                      <span className="source-name">{source.replace('-', ' ')}</span>
                      <span>{data.total}</span>
                      <span>{data.converted}</span>
                      <span className="conversion-rate">
                        <div
                          className="rate-bar"
                          style={{ width: `${data.conversionRate}%` }}
                        />
                        {formatPercent(data.conversionRate)}
                      </span>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Breakdown */}
      <div className="monthly-section">
        <div className="section-header">
          <h2>Monthly Breakdown</h2>
          <div className="month-selector">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="month-select"
            >
              {MONTH_NAMES.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="year-select"
            >
              {[2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        {monthlyData && (
          <div className="monthly-content">
            <div className="monthly-metrics">
              <div className="metric-row">
                <span className="metric-label">Revenue:</span>
                <span className="metric-value">{formatCurrency(monthlyData.totalRevenue)}</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Costs:</span>
                <span className="metric-value">{formatCurrency(monthlyData.totalCosts)}</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Commissions:</span>
                <span className="metric-value">{formatCurrency(monthlyData.totalCommissions)}</span>
              </div>
              <div className="metric-row profit">
                <span className="metric-label">Profit:</span>
                <span className="metric-value profit-value">{formatCurrency(monthlyData.totalProfit)}</span>
              </div>
              <div className="metric-row">
                <span className="metric-label">Profit Margin:</span>
                <span className="metric-value">{formatPercent(monthlyData.profitMargin)}</span>
              </div>
            </div>

            <div className="cost-breakdown-card">
              <h3>Cost Breakdown</h3>
              <div className="breakdown-bars">
                <div className="breakdown-item">
                  <div className="breakdown-label">
                    <span>Guide Fees</span>
                    <span>{formatCurrency(monthlyData.costBreakdown.guideFees)}</span>
                  </div>
                  <div className="breakdown-bar">
                    <div
                      className="bar-fill"
                      style={{
                        width: monthlyData.totalCosts > 0
                          ? `${(monthlyData.costBreakdown.guideFees / monthlyData.totalCosts) * 100}%`
                          : '0%'
                      }}
                    />
                  </div>
                </div>

                <div className="breakdown-item">
                  <div className="breakdown-label">
                    <span>Transport</span>
                    <span>{formatCurrency(monthlyData.costBreakdown.transport)}</span>
                  </div>
                  <div className="breakdown-bar">
                    <div
                      className="bar-fill"
                      style={{
                        width: monthlyData.totalCosts > 0
                          ? `${(monthlyData.costBreakdown.transport / monthlyData.totalCosts) * 100}%`
                          : '0%'
                      }}
                    />
                  </div>
                </div>

                <div className="breakdown-item">
                  <div className="breakdown-label">
                    <span>Accommodation</span>
                    <span>{formatCurrency(monthlyData.costBreakdown.accommodation)}</span>
                  </div>
                  <div className="breakdown-bar">
                    <div
                      className="bar-fill"
                      style={{
                        width: monthlyData.totalCosts > 0
                          ? `${(monthlyData.costBreakdown.accommodation / monthlyData.totalCosts) * 100}%`
                          : '0%'
                      }}
                    />
                  </div>
                </div>

                <div className="breakdown-item">
                  <div className="breakdown-label">
                    <span>Attractions</span>
                    <span>{formatCurrency(monthlyData.costBreakdown.attractions)}</span>
                  </div>
                  <div className="breakdown-bar">
                    <div
                      className="bar-fill"
                      style={{
                        width: monthlyData.totalCosts > 0
                          ? `${(monthlyData.costBreakdown.attractions / monthlyData.totalCosts) * 100}%`
                          : '0%'
                      }}
                    />
                  </div>
                </div>

                <div className="breakdown-item">
                  <div className="breakdown-label">
                    <span>Food</span>
                    <span>{formatCurrency(monthlyData.costBreakdown.food)}</span>
                  </div>
                  <div className="breakdown-bar">
                    <div
                      className="bar-fill"
                      style={{
                        width: monthlyData.totalCosts > 0
                          ? `${(monthlyData.costBreakdown.food / monthlyData.totalCosts) * 100}%`
                          : '0%'
                      }}
                    />
                  </div>
                </div>

                <div className="breakdown-item">
                  <div className="breakdown-label">
                    <span>Other</span>
                    <span>{formatCurrency(monthlyData.costBreakdown.other)}</span>
                  </div>
                  <div className="breakdown-bar">
                    <div
                      className="bar-fill"
                      style={{
                        width: monthlyData.totalCosts > 0
                          ? `${(monthlyData.costBreakdown.other / monthlyData.totalCosts) * 100}%`
                          : '0%'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Agent Performance */}
      <div className="agent-performance-section">
        <h2>Top Performing Agents by Profit</h2>
        {agentPerformance.length > 0 ? (
          <div className="agent-performance-table">
            <table>
              <thead>
                <tr>
                  <th>Agent</th>
                  <th>Bookings</th>
                  <th>Revenue</th>
                  <th>Costs</th>
                  <th>Commission</th>
                  <th>Profit</th>
                  <th>Margin</th>
                </tr>
              </thead>
              <tbody>
                {agentPerformance.map((agent) => (
                  <tr key={agent.agentId}>
                    <td>
                      <div className="agent-name">{agent.agentName}</div>
                      {agent.company && <div className="agent-company">{agent.company}</div>}
                    </td>
                    <td>{agent.totalBookings}</td>
                    <td>{formatCurrency(agent.totalRevenue)}</td>
                    <td>{formatCurrency(agent.totalCosts)}</td>
                    <td>{formatCurrency(agent.totalCommissions)}</td>
                    <td className={agent.totalProfit >= 0 ? 'profit-positive' : 'profit-negative'}>
                      {formatCurrency(agent.totalProfit)}
                    </td>
                    <td>{formatPercent(agent.profitMargin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">No agent performance data available</div>
        )}
      </div>
    </div>
  );
}
