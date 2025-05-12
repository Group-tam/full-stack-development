import { useRef, useState } from 'react';
import { XMarkIcon, CheckIcon, TrashIcon, PencilSquareIcon,  ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Tooltip } from '../Tooltip';
import CommentList from './CommentList';
import ReplyForm from './ReplyForm';
import { Message } from '../../dataTypes/type';
import { Link } from 'react-router-dom';

interface DiscussionBoardProps {
  eventId: string;
  isOwner: boolean;
  canInteract: boolean;
  currentDescription: string;
  messages: Message[];
  onUpdateDescription: (description: string) => Promise<void>;
}

export default function DiscussionBoard({ 
  eventId,
  isOwner,
  canInteract,
  currentDescription,
  messages,
  onUpdateDescription
}: DiscussionBoardProps) {
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [tempDescription, setTempDescription] = useState('');
  const descriptionRef = useRef<HTMLDivElement>(null);

  const handleDescriptionUpdate = async () => {
    try {
      await onUpdateDescription(tempDescription);
      setIsEditingDescription(false);
    } catch (error) {
      console.error('Failed to update description:', error);
    }
  };

  return (
    <>
      <div className="mb-8">
        <Link 
          to={`/event-detail/${eventId}`}
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Event Details
        </Link>
    </div>
    <div className="mt-8 border-t pt-8">
      <h2 className="text-2xl font-bold mb-6">Discussion Board</h2>

      {/* Description Section */}
      {(isOwner || currentDescription) && (
        <div className="mb-6" ref={descriptionRef}>
          {isOwner ? (
            <>
              <div className="mb-4">
                <div className="text-sm text-gray-500 mb-2">Current Description:</div>
                <div className="p-4 bg-sky-100 border border-sky-200 rounded-lg shadow-inner">
                  <p className="text-gray-700">
                    {currentDescription || 'No description set'}
                  </p>
                </div>
              </div>
              <div 
                className={`relative p-4 ${
                  isEditingDescription 
                    ? 'bg-white border-2 border-blue-500' 
                    : 'bg-gray-50 hover:bg-gray-100 cursor-pointer'
                } rounded-lg transition-colors`}
                onClick={() => {
                  if (!isEditingDescription) {
                    setIsEditingDescription(true);
                    setTempDescription(currentDescription || '');
                  }
                }}
              >
                {isEditingDescription ? (
                  <>
                    <textarea
                      value={tempDescription}
                      onChange={(e) => setTempDescription(e.target.value)}
                      className="w-full bg-transparent resize-none focus:outline-none"
                      placeholder="Write a description for the discussion board..."
                      rows={3}
                      autoFocus
                    />
                    <div className="absolute top-2 right-2 flex gap-2">
                      <Tooltip content="Clear description">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setTempDescription('');
                          }}
                          className="p-1 hover:bg-gray-100 rounded-full"
                        >
                          <TrashIcon className="w-5 h-5 text-gray-500" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Save changes">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDescriptionUpdate();
                          }}
                          className="p-1 hover:bg-gray-100 rounded-full"
                        >
                          <CheckIcon className="w-5 h-5 text-green-500" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Cancel editing">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsEditingDescription(false);
                          }}
                          className="p-1 hover:bg-gray-100 rounded-full"
                        >
                          <XMarkIcon className="w-5 h-5 text-red-500" />
                        </button>
                      </Tooltip>
                    </div>
                  </>
                ) : (
                  <div className="flex justify-between items-start gap-4">
                    <p className="text-gray-700">
                      Click to edit description
                    </p>
                    <Tooltip content="Edit description">
                      <PencilSquareIcon className="w-5 h-5 text-gray-500" />
                    </Tooltip>
                  </div>
                )}
              </div>
            </>
          ) : (
            currentDescription && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-gray-700">{currentDescription}</p>
              </div>
            )
          )}
        </div>
      )}

      {/* Comments Section */}
      {canInteract && (
        <ReplyForm eventId={eventId} />
      )}

      {messages.length > 0 ? (
        <CommentList canInteract={canInteract} isOwner={isOwner} />
      ) : (
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
          <div className="text-4xl mb-4">💭</div>
          <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600 mb-2">
            Be the First to Comment!
          </h3>
          {canInteract ? (
            <p className="text-gray-600 text-center max-w-md animate-pulse">
              Start the conversation and share your thoughts about this event!
            </p>
          ) : (
            <p className="text-gray-600 text-center max-w-md">
              No comments yet. Join the event to participate in the discussion!
            </p>
          )}
        </div>
      )}
    </div>
    </>
  );
}