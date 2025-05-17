import * as React from 'react';
import { BaseModal, BaseModalProps } from './BaseModal';
import { User } from '../../dataTypes/type';
import { fetchHandler } from '../../utils/fetchHandler';

interface InviteMembersModalProps extends BaseModalProps {
	onSubmit: (emails: string[]) => Promise<void>;
	currentUserId: string;
}

interface InviteMembersModalState {
	searchTerm: string;
	searchResults: User[];
	selectedUsers: User[];
	error: ErrorState | null;
	isSubmitting: boolean;
	permanentDuplicates: string[];
}

interface ErrorState {
	message: string;
	duplicateIds?: string[];
	success?: boolean;
}

export default class InviteMembersModal extends BaseModal<InviteMembersModalProps> {
	private searchRef = React.createRef<HTMLDivElement>();
	private searchTimeout: NodeJS.Timeout | null = null;
	
	state: InviteMembersModalState = {
		searchTerm: '',
		searchResults: [],
		selectedUsers: [],
		error: null,
		isSubmitting: false,
		permanentDuplicates: []
	};

	private prevSearchTerm: string = '';
	
	componentDidUpdate(prevProps: InviteMembersModalProps) {
		super.componentDidUpdate(prevProps);
		
		const currentState = this.state as InviteMembersModalState;
		if (currentState.searchTerm !== this.prevSearchTerm) {
			this.prevSearchTerm = currentState.searchTerm;
			if (this.searchTimeout) {
				clearTimeout(this.searchTimeout);
			}

			this.searchTimeout = setTimeout(async () => {
				if (this.state.searchTerm.trim()) {
					try {
						const response = await fetchHandler(`/user/search?query=${encodeURIComponent(this.state.searchTerm)}`, {
							credentials: 'include'
						});
						const data = await response.json();
						const filteredData = data.filter((user: User) => 
							user._id !== this.props.currentUserId &&
							!this.state.selectedUsers.some(selected => selected._id === user._id)
						);
						this.setState({ searchResults: filteredData, error: null });
					} catch {
						this.setState({ error: { message: 'Failed to search users' } });
					}
				} else {
					this.setState({ searchResults: [] });
				}
			}, 200);
		}
	}

	componentWillUnmount() {
		if (this.searchTimeout) {
			clearTimeout(this.searchTimeout);
		}
	}

	handleAddUser = (user: User) => {
		if (user._id === this.props.currentUserId) return;
		if (!this.state.selectedUsers.find(u => u._id === user._id)) {
			this.setState((prev: InviteMembersModalState) => ({
				selectedUsers: [...prev.selectedUsers, user],
				searchTerm: '',
				error: null
			}));
		}
	};

	handleRemoveUser = (userId: string) => {
		this.setState((prev: InviteMembersModalState) => ({
			selectedUsers: prev.selectedUsers.filter(u => u._id !== userId),
			permanentDuplicates: prev.permanentDuplicates.filter(id => id !== userId)
		}), () => {
			if (this.state.permanentDuplicates.length === 0) {
				this.setState({ error: null });
			}
		});
	};

	handleSubmit = async () => {
		if (this.state.selectedUsers.length === 0) {
			this.setState({ error: { message: 'Please select at least one user' } });
			return;
		}

		this.setState({ isSubmitting: true });
		try {
			await this.props.onSubmit(this.state.selectedUsers.map(user => user._id));
		} catch (err) {
			const error = err as { duplicateUserIds?: string[], error?: string };
			if (error?.duplicateUserIds) {
				this.setState({
					permanentDuplicates: error.duplicateUserIds,
					error: {
						message: 'Some users have already been invited',
						duplicateIds: error.duplicateUserIds
					}
				});
			} else if (error?.error === "invlim") {
				this.setState({
					error: { 
						message: 'Cannot send invites. Would exceed invitation limit.',
					}
				});
			} else {
				this.setState({
					//This is just for the frontend display, because all of the errors are handled by the
					//previous ifs, the error here is just for displaying the success message
					error: { message: 'Invitations sent successfully!', success: true }
				});
			}
		} finally {
			this.setState({ isSubmitting: false });
		}
	};

	render() {
		const { show, onClose } = this.props;
		const { searchTerm, searchResults, selectedUsers, error, isSubmitting, permanentDuplicates } = this.state;

		if (!show) return null;

		return (
			<div data-testid="invitation-card" className={this.modalStyles.overlay}>
				<div className={this.modalStyles.backdrop} onClick={onClose} />
				
				<div className={this.modalStyles.container}>
					<button
						type="button"
						onClick={onClose}
						className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
					>
						✕
					</button>

					<h2 className={this.modalStyles.title}>Invite Members</h2>

					<div className="space-y-4" ref={this.searchRef}>
						<div className="relative">
							<input
								data-testid="invite-input"
								type="text"
								value={searchTerm}
								onChange={(e) => this.setState({ searchTerm: e.target.value })}
								placeholder="Search users..."
								className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
							/>
							
							{searchTerm && searchResults.length > 0 && (
								<div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
									{searchResults.map(user => (
										<button
											key={user._id}
											onClick={() => this.handleAddUser(user)}
											className="w-full px-4 py-2 text-left hover:bg-gray-100"
										>
											{user.username}
										</button>
									))}
								</div>
							)}
						</div>

						{error && (
							<div className={`border-l-4 p-4 rounded ${
								error.success 
									? 'bg-green-50 border-green-400' 
									: 'bg-red-50 border-red-400'
							}`}>
								<p className={`text-sm ${
									error.success 
										? 'text-green-700' 
										: 'text-red-700'
								}`}>
									{error.message}
								</p>
							</div>
						)}

						<div className="flex flex-wrap gap-2">
							{selectedUsers.map(user => (
								<div
									key={user._id}
									className={`flex items-center px-3 py-1 rounded-full transition-colors ${
										permanentDuplicates.includes(user._id) || error?.duplicateIds?.includes(user._id)
											? 'bg-red-100 text-red-800'
											: 'bg-green-100 text-green-800'
									}`}
								>
									{user.username}
									<button
										type="button"
										onClick={() => this.handleRemoveUser(user._id)}
										className={`ml-2 ${
											permanentDuplicates.includes(user._id) || error?.duplicateIds?.includes(user._id)
												? 'text-red-600 hover:text-red-800'
												: 'text-green-600 hover:text-green-800'
										}`}
									>
										×
									</button>
								</div>
							))}
						</div>
					</div>

					<div className="flex justify-end gap-4 pt-4 border-t">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 font-medium text-gray-700 hover:text-gray-900"
							disabled={isSubmitting}
						>
							Cancel
						</button>
						<button
							type="button"
							onClick={this.handleSubmit}
							disabled={isSubmitting}
							className={`px-6 py-2 text-white font-bold rounded-lg transition-colors bg-green-500`}
						>
							Send Invites
						</button>
					</div>
				</div>
			</div>
		);
	}
}