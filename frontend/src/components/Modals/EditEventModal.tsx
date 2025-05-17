import React from 'react';
import { CameraIcon } from '@heroicons/react/24/outline';
import { formatDateForInput } from '../../utils/dateUtils';
import { BaseModal, BaseModalProps } from './BaseModal';

type EditEventModalProps = {
	initialValues: {
		eventName: string;
		eventLocation: string;
		eventDescription: string;
		eventTime: Date;
		images: string;
	};
	onClose: () => void;
	onSubmit: (values: { 
		eventName: string;
		eventLocation: string;
		eventDescription: string;
		eventTime: Date;
		images: string;
		newImageFile?: File;
	}) => void;
} & BaseModalProps;

interface EditEventModalState {
	values: {
		eventName: string;
		eventLocation: string;
		eventDescription: string;
		eventTime: Date;
		images: string;
	};
	newImage?: File;
}

export default class EditEventModal extends BaseModal<EditEventModalProps> {
	fileInputRef = React.createRef<HTMLInputElement>();
	state: EditEventModalState = {
		values: this.props.initialValues,
		newImage: undefined
	};

	handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		this.setState({ newImage: file });
	};

	handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target;
		this.setState((prev: EditEventModalState) => ({
			values: { ...prev.values, [name]: value }
		}));
	};

	handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!window.confirm('Are you sure you want to submit the changes?')) return;
		this.props.onSubmit({
			...this.state.values,
			images: this.props.initialValues.images,
			newImageFile: this.state.newImage
		});
	};

	render() {
		const { show, onClose } = this.props;
		const { values, newImage } = this.state;

		if (!show) return null;

		return (
			<div className="fixed inset-0 flex items-center justify-center z-50" data-testid="event-edit-modal">
				<div className="fixed inset-0 backdrop-blur-sm" onClick={onClose} />
				<form
					onSubmit={this.handleSubmit}
					className="relative bg-white rounded-lg p-6 w-full max-w-lg space-y-4"
				>
					<button
						type="button"
						onClick={onClose}
						className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
					>
						✕
					</button>

					<h2 className="text-2xl font-bold">Edit Event Details</h2>

					<div>
						<label className="block text-sm font-medium text-gray-700">Event Name</label>
						<input
							type="text"
							name="eventName"
							value={values.eventName}
							onChange={this.handleChange}
							className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder={values.eventName}
							required
						/>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">Location</label>
						<input
							type="text"
							name="eventLocation"
							value={values.eventLocation}
							onChange={this.handleChange}
							className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder={values.eventLocation}
							required
						/>
					</div>

					<div className="flex gap-4 items-start">
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Select Date and Time</label>
							<input
								type="datetime-local"
								value={formatDateForInput(new Date(values.eventTime))}
								onChange={(e) => this.setState((prev: EditEventModalState) => ({
									values: { ...prev.values, eventTime: new Date(e.target.value) }
								}))}
							/>
						</div>

						<div className="shrink-0">
							<label className="block text-sm font-medium text-gray-700 mb-1">Event Image</label>
							<button
								type="button"
								onClick={() => this.fileInputRef.current?.click()}
								className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg font-medium transition-colors"
							>
								<CameraIcon className="h-6 w-6" />
								{newImage ? newImage.name : "Upload Image"}
							</button>
							<input
								ref={this.fileInputRef}
								type="file"
								accept="image/*"
								onChange={this.handleFileSelect}
								className="hidden"
							/>
						</div>
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700">Description</label>
						<textarea
							name="eventDescription"
							value={values.eventDescription}
							onChange={this.handleChange}
							rows={4}
							className="mt-1 w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder={values.eventDescription}
							required
						/>
					</div>

					<div className="flex justify-end gap-4 pt-4 border-t">
						<button
							type="button"
							onClick={onClose}
							className="px-4 py-2 font-medium text-gray-700 hover:text-gray-900"
						>
							Cancel
						</button>
						<button
							type="submit"
							className="px-6 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600"
						>
							Apply
						</button>
					</div>
				</form>
			</div>
		);
	}
}