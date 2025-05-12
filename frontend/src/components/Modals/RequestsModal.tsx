import { Request, RequestStatus } from '../../dataTypes/type';
import { BaseModal, BaseModalProps } from './BaseModal';

interface RequestsModalProps extends BaseModalProps {
	requests: Request[];
	onRequestUpdate: (requestId: string, newState: RequestStatus) => void;
}

export default class RequestsModal extends BaseModal<RequestsModalProps> {
	render() {
		const { show, onClose, requests, onRequestUpdate } = this.props;

		if (!show) return null;

		return (
			<div className={this.modalStyles.overlay}>
				<div className={this.modalStyles.backdrop} onClick={onClose} />
				<div className={`${this.modalStyles.container} max-h-[80vh] overflow-y-auto`}>
					<div className="flex justify-between items-center mb-6">
						<h3 className={this.modalStyles.title}>Incoming Requests</h3>
						<button 
							onClick={onClose} 
							className="text-lg text-gray-500 hover:text-gray-700"
						>
							×
						</button>
					</div>

					<div className="space-y-4">
						{requests.map((request) => (
							<div key={request._id} className="p-4 bg-gray-50 rounded-lg shadow-sm">
								<div className="flex items-center justify-between">
									<div>
										<h4 className="font-medium">{request["Sender username"]}</h4>
										<p className="text-sm text-gray-600">Status: {request.state}</p>
									</div>
									{request.state === "Unanswered" && (
										<div className="flex gap-2">
											<button
												onClick={() => onRequestUpdate(request._id, "Accepted" as RequestStatus)}
												className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-1"
											>
												✓ Accept
											</button>
											<button
												onClick={() => onRequestUpdate(request._id, "Rejected" as RequestStatus)}
												className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 flex items-center gap-1"
											>
												× Reject
											</button>
										</div>
									)}
								</div>
							</div>
						))}
						
						{requests.length === 0 && (
							<p className="text-center text-gray-500 py-4">No pending requests</p>
						)}
					</div>
				</div>
			</div>
		);
	}
}