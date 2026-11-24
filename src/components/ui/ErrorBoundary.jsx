import React, { Component } from 'react';
import ErrorState from './ErrorState';

/**
 * Standard React Error Boundary
 * Prevents full-app unmounting when a child component encounters an unexpected render crash.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('EmlakPro ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="p-margin-sm xl:p-margin max-w-[1200px] mx-auto w-full">
          <ErrorState
            title="Bu Sayfa Yüklenirken Bir Hata Oluştu"
            description="Beklenmeyen bir veri formatı veya sistem hatasıyla karşılaşıldı. Mevcut kayıtlarınız güvendedir."
            error={this.state.error}
            onRetry={this.handleReset}
            retryLabel="Sayfayı Yeniden Yükle"
            secondaryActionLabel="Ana Sayfaya Dön"
            onSecondaryAction={() => {
              window.location.href = '/';
            }}
          />
        </div>
      );
    }

    return this.props.children;
  }
}

