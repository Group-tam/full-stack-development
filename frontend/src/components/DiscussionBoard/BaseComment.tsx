/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component } from 'react';
import type { Message } from '../../dataTypes/type';

export interface BaseCommentProps {
  comment: Message;
  allMessages: Message[];
  canInteract: boolean;
  isOwner: boolean;
  activeReplyId: string | null;
  onReplyClick: (commentId: string | null) => void;
  dispatch: any; 
  currentUser: any; 
}

export interface BaseCommentState {
  isEditing: boolean;
  text: string;
  isCollapsed: boolean; 
}
//use the class component to use the inheritance feture
export default class BaseComment extends Component<BaseCommentProps, BaseCommentState> {
  constructor(props: BaseCommentProps) {
    super(props);
    this.state = {
      isEditing: false,
      text: props.comment.text,
      isCollapsed: false
    };
  }

  protected handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ text: e.target.value });
  };

  protected toggleEditing = () => {
    this.setState(prevState => ({ isEditing: !prevState.isEditing }));
  };

  protected renderAvatar() {
    const { comment } = this.props;
    return (
      <div className="h-8 w-8 rounded-full overflow-hidden mr-2">
        <img 
          src={(comment.user?.avatar != "000000000000000000000000") ? `/user/image/${comment.user?.avatar}` : '/avatar-default.svg'}
          className="w-full h-full object-cover"
          alt={comment.user?.username}
          style={{
        transform: `scale(${comment.user?.avatarZoom})`,
          }}
        />
      </div>
    );
  }

  protected renderUserInfo() {
    const { comment } = this.props;
    return (
      <div className="flex items-center gap-2 mb-1">
        <span className="font-medium">{comment.user?.username}</span>
        {comment.isOrganizer && (
          <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
            Moderator
          </span>
        )}
        <span className="text-sm text-gray-500">
          {new Date(comment.createdAt).toLocaleString()}
        </span>
      </div>
    );
  }
}