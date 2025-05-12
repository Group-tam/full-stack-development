import { BaseModal, BaseModalProps } from './BaseModal';
import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface TermsModalProps extends BaseModalProps {} // We don't need any additional props

export default class TermsModal extends BaseModal<TermsModalProps> {
  private termsRef = React.createRef<HTMLDivElement>();
  private privacyRef = React.createRef<HTMLDivElement>();

  render() {
    const { show, onClose } = this.props;

    if (!show) return null;

    return (
      <div className={this.modalStyles.overlay}>
        <div className={this.modalStyles.backdrop} onClick={onClose} />
        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col relative z-10">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className={this.modalStyles.title}>Terms & Privacy</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex flex-1 overflow-hidden">
            {/* Scrollspy Navigation */}
            <div className="w-48 border-r p-4 space-y-2">
              <button
                onClick={() => document.getElementById('terms')?.scrollIntoView()}
                className="block w-full text-left p-2 rounded hover:bg-gray-100"
              >
                Terms of Use
              </button>
              <button
                onClick={() => document.getElementById('privacy')?.scrollIntoView()}
                className="block w-full text-left p-2 rounded hover:bg-gray-100"
              >
                Privacy Policy
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-8">
              <section id="terms" ref={this.termsRef} className="space-y-4">
                <h3 className="text-lg font-semibold">Terms of Use</h3>
                <div className={this.modalStyles.content}>
                  <p>Welcome to SeroMeet! By using our services, you agree to these terms:</p>
                  <p>1. You must be at least 13 years old to use this service</p>
                  <p>2. You are responsible for maintaining the security of your account</p>
                  <p>3. You agree not to misuse the service or help others do so</p>
                  <p>4. We may terminate service for violations of these terms</p>
                </div>
              </section>

              <section id="privacy" ref={this.privacyRef} className="space-y-4">
                <h3 className="text-lg font-semibold">Privacy Policy</h3>
                <div className={this.modalStyles.content}>
                  <p>Your privacy is important to us:</p>
                  <p>1. We collect minimal data needed to provide our services</p>
                  <p>2. We never sell your personal information to third parties</p>
                  <p>3. We use industry-standard security measures</p>
                  <p>4. You can request account deletion at any time</p>
                  <p>5. We may update this policy with notice to users</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  }
}