import { BaseModal, BaseModalProps } from './BaseModal';

type InformOption = 'accepted-public' | 'accepted-private' | 'pending-private' | 'all-private';

interface InformModalProps extends BaseModalProps {
	onSubmit: (message: string, option: InformOption, minutesBefore?: number) => Promise<void>;
	isPublicEvent: boolean;
	eventTime: Date; 
}

interface InformModalState {
	message: string;
	selectedOption: InformOption;
	minutesBefore: number; 
	isScheduled: boolean; 
	showSuccess: boolean;  
}

export default class InformModal extends BaseModal<InformModalProps> {
	state: InformModalState = {
		message: '',
		selectedOption: this.props.isPublicEvent ? 'accepted-public' : 'accepted-private',
		minutesBefore: 60,
		isScheduled: false,
		showSuccess: false,
	};

	//  Reset state when modal opens/closes
	componentDidUpdate(prevProps: InformModalProps) {
		if (this.props.show !== prevProps.show && this.props.show === true) {
			this.setState({
				message: '',
				selectedOption: this.props.isPublicEvent ? 'accepted-public' : 'accepted-private',
				minutesBefore: 60,
				isScheduled: false,
				showSuccess: false,
			});
		}
	}

	handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		const { message, selectedOption, minutesBefore, isScheduled } = this.state;
		await this.props.onSubmit(message, selectedOption, isScheduled ? minutesBefore : undefined);
		this.setState({ showSuccess: true });
		
		// Auto-close after 1 second
		setTimeout(() => {
			this.setState({ showSuccess: false });
			this.props.onClose();
		}, 1000);
	};

	render() {
		const { show, onClose, isPublicEvent, eventTime } = this.props;
		const { selectedOption, message, isScheduled, minutesBefore, showSuccess } = this.state;

		if (!show) return null;

		return (
			<div className={this.modalStyles.overlay}>
				<div className={this.modalStyles.backdrop} onClick={onClose}></div>
				<div className={this.modalStyles.container}>
					{showSuccess ? (
						<div className="text-center py-8">
							<div className="text-green-500 text-2xl mb-2">✓</div>
							<p className="text-lg font-medium text-gray-800">Message scheduled successfully!</p>
						</div>
					) : (
						<>
							<h2 className={this.modalStyles.title}>Inform Participants</h2>
							<div className="mb-4">
								<p className="text-sm text-gray-600">
									Event Time: {eventTime.toLocaleString()}
								</p>
							</div>
							<form onSubmit={this.handleSubmit} className="space-y-4">
								{!isPublicEvent && (
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Select who to inform:
										</label>
										<select
											value={selectedOption}
											onChange={(e) => this.setState({ 
												selectedOption: e.target.value as InformOption 
											})}
											className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
										>
											<option value="accepted-private">Accepted Invitees</option>
											<option value="pending-private">Pending Invitees</option>
											<option value="all-private">All Invitees</option>
										</select>
									</div>
								)}

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Message:
									</label>
									<textarea
										value={message}
										onChange={(e) => this.setState({ message: e.target.value })}
										className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
										rows={4}
										placeholder="Write your message here..."
										required
									/>
								</div>

								{/* Add scheduling option */}
								<div className="flex items-center gap-2 mb-4">
									<input
										type="checkbox"
										id="schedule"
										checked={isScheduled}
										onChange={(e) => this.setState({ isScheduled: e.target.checked })}
										className="rounded border-gray-300"
									/>
									<label htmlFor="schedule" className="text-sm text-gray-700">
										Schedule notification
									</label>
								</div>

								{isScheduled && (
									<div className="mb-4">
										<label className="block text-sm font-medium mb-2">Send Before</label>
										<select
											value={minutesBefore}
											onChange={(e) => this.setState({ minutesBefore: Number(e.target.value) })}
											className="w-full p-2 border rounded-lg"
										>
											 {/* The first three options can be used for testing
											 (they are also a part of the application) */}
											<option value={1}>1 minute</option>
											<option value={2}>2 minutes</option>
											<option value={5}>5 minutes</option>
											{/*Normal Options*/ }
											<option value={15}>15 minutes</option>
											<option value={30}>30 minutes</option>
											<option value={60}>1 hour</option>
											<option value={1440}>1 day</option>
											<option value={10080}>1 week</option>
										</select>
									</div>
								)}

								<div className="flex justify-end gap-2">
									<button
										type="button"
										onClick={onClose}
										className="px-4 py-2 text-gray-600 hover:text-gray-800"
									>
										Cancel
									</button>
									<button
										type="submit"
										className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
									>
										Send
									</button>
								</div>
							</form>
						</>
					)}
				</div>
			</div>
		);
	}
}