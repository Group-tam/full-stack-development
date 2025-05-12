import { useAppDispatch } from '../../hook/hooks';
import { createMessage, fetchMessages } from '../../redux/message/messageSlice';
import { useState } from 'react';

interface ReplyFormProps {
	parentId?: string;
	eventId: string;
	onReplyComplete?: () => void;
}

export default function ReplyForm({ parentId, eventId, onReplyComplete }: ReplyFormProps) {
	const dispatch = useAppDispatch();
	const [text, setText] = useState('');

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!text.trim() || !eventId) return;

		try {
			await dispatch(createMessage({
				text,
				parentMessageId: parentId,
				eventId 
			})).unwrap();
			
			setText('');
			await dispatch(fetchMessages(eventId));
			onReplyComplete?.(); // Close reply form after submission
		} catch (error) {
			console.error('Failed to post reply:', error);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="flex gap-2 p-2">
			<textarea
				value={text}
				onChange={(e) => setText(e.target.value)}
				placeholder="Write a reply..."
				className="flex-1 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
				rows={2}
			/>
			<button
				type="submit"
				disabled={!text.trim()}
				className="self-start px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
			>
				Post Reply
			</button>
		</form>
	);
}