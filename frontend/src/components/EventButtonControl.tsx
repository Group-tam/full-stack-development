import { useState } from 'react';
import InviteMembersModal from './Modals/InviteMembersModal';
import type { Request, RequestStatus } from './../dataTypes/type';
import RequestsModal from './Modals/RequestsModal';
import InformModal from './Modals/InformModal';

interface EventButtonControlProps {
  isPublic: boolean;
  isOwner: boolean;
  currentUserId: string;
  request: { state: "Accepted" | "Unanswered" | "Rejected" } | null;
  requests: Request[];
  eventTime: Date;
  onEdit: () => void;
  onInvite: (userIds: string[]) => Promise<void>;
  onRequestToJoin: () => Promise<void>;
  onRequestUpdate: (requestId: string, newState: RequestStatus) => Promise<void>;
  onInform: (message: string, option: 'accepted-public' | 'accepted-private' | 'pending-private' | 'all-private') => Promise<void>;
}

export default function EventButtonControl({
  isPublic,
  isOwner,
  currentUserId,
  request,
  requests,
  eventTime,
  onEdit,
  onInvite,
  onRequestToJoin,
  onRequestUpdate,
  onInform
}: EventButtonControlProps) {
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [showInformModal, setShowInformModal] = useState(false);
  const pendingRequests = requests.filter(r => r.state === "Unanswered");

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      {isPublic && (
        isOwner ? (
          <div>
            <button
              onClick={onEdit}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-colors"
            >
              Edit Event Details
            </button>
            <>
             
              {pendingRequests.length >= 0 && (
                <button
                  onClick={() => setShowRequestsModal(true)}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-full transition-colors mt-4"
                >
                  Incoming Requests ({pendingRequests.length})
                </button>
              )}
              <button
                onClick={() => setShowInformModal(true)}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-full transition-colors mt-4"
              >
                Inform Participants
              </button>
             
              <RequestsModal
                requests={pendingRequests}
                show={showRequestsModal}
                onClose={() => setShowRequestsModal(false)}
                onRequestUpdate={onRequestUpdate}
              />
              <InformModal
                show={showInformModal}
                onClose={() => setShowInformModal(false)}
                onSubmit={onInform}
                isPublicEvent={isPublic}
                eventTime={eventTime} 
              />
            </>
          </div>
        ) : request ? (null
        ) : (
          <button
            onClick={onRequestToJoin}
            className="w-full bg-[#2ecc71] hover:bg-[#27ae60] text-white font-bold py-3 px-6 rounded-full transition-colors"
          >
            Request to join
          </button>
        )
      )}

      {!isPublic && isOwner && (
        <>
          {isInviting && (           
             <InviteMembersModal
              show={true}
              currentUserId={currentUserId}
              onClose={() => setIsInviting(false)}
              onSubmit={onInvite}
            />
          )}
          
          <>
            <button
              onClick={() => setIsInviting(true)}
              className="w-full bg-indigo-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-colors"
            >
              Invite members
            </button>
            <br />
            <br />
            <button
              onClick={onEdit}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-colors"
            >
              Edit Event Details
            </button>
          </>
          <>
          
        </>
        <button
          onClick={() => setShowInformModal(true)}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-full transition-colors mt-4"
        >
          Inform Participants
        </button>
        <InformModal
          show={showInformModal}
          onClose={() => setShowInformModal(false)}
          onSubmit={onInform}
          isPublicEvent={isPublic}
          eventTime={eventTime} 
        />
        </>
      )}
    </div>
  );
}