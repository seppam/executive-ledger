import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { error };
  }
  
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '16px', margin: '8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px' }}>
          <p style={{ color: '#dc2626', fontSize: '14px', fontWeight: 600 }}>Component unavailable in demo mode</p>
        </div>
      );
    }
    return this.props.children;
  }
}
