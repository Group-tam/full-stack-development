import { BaseModal } from './BaseModal';
import { BaseModalProps } from './BaseModal';


interface MessageModalProps extends BaseModalProps {
  message: {
    text: string;
    eventName: string;
  } | null;
}

export default class MessageViewModal extends BaseModal<MessageModalProps> {
  render() {
    const { show, onClose, message } = this.props;

    if (!show || !message) return null;

    return (
      <div className={this.modalStyles.overlay} onClick={e => e.stopPropagation()}>
        <div className={this.modalStyles.backdrop} onClick={onClose}></div>
        <div className={this.modalStyles.container}>
          <h2 className={this.modalStyles.title}>{message.eventName}</h2>
          <div className={this.modalStyles.content}>
            {message.text}
          </div>
          <button
            onClick={onClose}
            className={this.modalStyles.button}
          >
            Close
          </button>
        </div>
      </div>
    );
  }
}