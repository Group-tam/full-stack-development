import { connect } from 'react-redux';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { deleteMessage, updateMessage, fetchMessages } from '../../redux/message/messageSlice';
import ReplyForm from './ReplyForm';
import BaseComment from './BaseComment';
import type { RootState } from '../../redux/store';

class Comment extends BaseComment {
  handleUpdate = async () => {
    try {
      await this.props.dispatch(updateMessage({ 
        messageId: this.props.comment._id, 
        text: this.state.text 
      })).unwrap();
      
      this.setState({ isEditing: false });
    } catch (error: unknown) {
      console.error('Update failed:', error);
    }
  };

  handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      this.props.dispatch(deleteMessage(this.props.comment._id))
        .unwrap()
        .then(() => {
          this.props.dispatch(fetchMessages(this.props.comment.eventId));
        })
        .catch((error: unknown) => {
          console.error('Deletion failed:', error);
        });
    }
  };

  handleReplyClick = () => {
    const { comment, activeReplyId, onReplyClick } = this.props;
    onReplyClick(activeReplyId === comment._id ? null : comment._id);
  };

  toggleCollapse = () => {
    this.setState(prevState => ({ isCollapsed: !prevState.isCollapsed }));
  };

  render() {
    const { comment, allMessages, activeReplyId, canInteract, isOwner, currentUser } = this.props;
    const { isEditing, text, isCollapsed } = this.state;

    const replies = allMessages.filter(m => 
      m.parentMessageId && m.parentMessageId.toString() === comment._id
    );

    return (
      <div className="group border-l-2 border-gray-100 pl-4">
        <div className="flex items-start gap-3">
          {this.renderAvatar()}
          <div className="flex-1">
            {this.renderUserInfo()}
            
            {isEditing ? (
              <textarea
                value={text}
                onChange={this.handleTextChange}
                className="w-full p-2 border rounded-lg"
              />
            ) : (
              <p className="text-gray-800 whitespace-pre-wrap">{comment.text}</p>
            )}

            <div className="flex items-center gap-4 mt-2">
              {canInteract ? (
                <button
                  onClick={this.handleReplyClick}
                  className="text-sm text-gray-600 hover:text-blue-600"
                >
                  {activeReplyId === comment._id ? 'Cancel Reply' : 'Reply'}
                </button>
              ) : (
                <div className="flex items-center text-gray-400 cursor-not-allowed">
                  <span className="text-sm">Cannot reply (you are not accepted)</span>
                </div>
              )}
              {/* collapse button*/}
              {replies.length > 0 && (
                <button
                  onClick={this.toggleCollapse}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  {isCollapsed ? (
                    <span className="flex items-center gap-1">
                      <span>▼</span> {replies.length} replies
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <span>▲</span> Hide
                    </span>
                  )}
                </button>
              )}
              <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {currentUser?._id === comment.senderId && canInteract && (
                  <>
                    {!isEditing ? (
                      <button 
                        onClick={() => this.setState({ isEditing: true })}
                        className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
                      >
                        <PencilIcon className="w-4 h-4" />
                        Edit
                      </button>
                    ) : (
                      <>
                        <button 
                          onClick={this.handleUpdate}
                          className="text-sm text-green-600 hover:text-green-700"
                        >
                          Save
                        </button>
                        <button 
                          onClick={() => this.setState({ isEditing: false })}
                          className="text-sm text-gray-600 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </>
                )}
                {/* Allow owner to delete any comment */}
                {((currentUser?._id === comment.senderId || isOwner) && canInteract) && (
                  <button 
                    onClick={this.handleDelete}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600"
                  >
                    <TrashIcon className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            </div>
            {activeReplyId === comment._id && canInteract && (
              <div className="mt-4 ml-4">
                <ReplyForm 
                  parentId={comment._id}
                  eventId={comment.eventId}
                  onReplyComplete={() => this.props.onReplyClick(null)}
                />
              </div>
            )}
          </div>
        </div>

        {/* render replies */}
        {replies.length > 0 && !isCollapsed && (
          <div className="mt-4 space-y-4 transition-all duration-300">
            {replies.map(reply => (
              <Comment 
                key={reply._id}
                comment={reply}
                allMessages={allMessages}
                activeReplyId={activeReplyId}
                onReplyClick={this.props.onReplyClick}
                canInteract={canInteract}
                isOwner={isOwner}
                currentUser={currentUser}
                dispatch={this.props.dispatch}
              />
            ))}
          </div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  currentUser: state.auth.user
});

export default connect(mapStateToProps)(Comment);