import { Component } from 'react';
import { connect } from 'react-redux';
import Comment from './Comment';
import type { RootState } from '../../redux/store';
import type { Message } from '../../dataTypes/type';

interface CommentListProps {
	canInteract: boolean;
	isOwner: boolean;
	messages: Message[];
}

interface CommentListState {
	activeReplyId: string | null;
}

class CommentList extends Component<CommentListProps, CommentListState> {
	state = {
		activeReplyId: null
	};

	handleReplyClick = (commentId: string | null) => {
		this.setState({ activeReplyId: commentId });
	};

	render() {
		const { messages, canInteract, isOwner } = this.props;
		const rootComments = messages.filter(m => !m.parentMessageId);

		return (
			<div className="space-y-6">
				{rootComments.map(comment => (
					<Comment 
						key={comment._id}
						comment={comment}
						allMessages={messages}
						activeReplyId={this.state.activeReplyId}
						onReplyClick={this.handleReplyClick}
						canInteract={canInteract}
						isOwner={isOwner}
					/>
				))}
			</div>
		);
	}
}

const mapStateToProps = (state: RootState) => ({
	messages: state.messages.messages
});

export default connect(mapStateToProps)(CommentList);