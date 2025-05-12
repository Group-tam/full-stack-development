import { Component } from 'react';

export interface BaseModalProps {
	show: boolean;
	onClose: () => void;
}
//Using class component for centralized styling and methods
export class BaseModal<P extends BaseModalProps = BaseModalProps> extends Component<P> {
	protected modalStyles = {
		overlay: "fixed inset-0 flex items-center justify-center z-50",
		backdrop: "fixed inset-0 backdrop-blur-sm",
		container: "bg-white rounded-lg p-6 w-full max-w-md relative z-10",
		title: "text-xl font-bold mb-4",
		content: "text-gray-600 whitespace-pre-wrap mb-4 break-words",
		button: "w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
	};
	//Handling the scrollbar visibility
	componentDidMount() {
		this.toggleBodyOverflow(this.props.show);
	}

	componentDidUpdate(prevProps: P) {
		if (this.props.show !== prevProps.show) {
			this.toggleBodyOverflow(this.props.show);
		}
	}

	componentWillUnmount() {
		this.toggleBodyOverflow(false);
	}

	private toggleBodyOverflow(show: boolean) {
		document.body.style.overflow = show ? 'hidden' : '';
	}
}