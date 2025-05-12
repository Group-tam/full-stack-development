import { ReactNode } from 'react';

interface TooltipProps {
	children: ReactNode;
	content: string;
	direction?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ children, content, direction = 'top' }: TooltipProps) {
	const positionClasses = {
		top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
		bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
		left: 'right-full top-1/2 -translate-y-1/2 mr-2',
		right: 'left-full top-1/2 -translate-y-1/2 ml-2'
	};

	const arrowClasses = {
		top: 'top-full left-1/2 -translate-x-1/2 -mt-1 border-t-gray-700',
		bottom: 'bottom-full left-1/2 -translate-x-1/2 -mb-1 border-b-gray-700',
		left: 'left-full top-1/2 -translate-y-1/2 -ml-1 border-l-gray-700',
		right: 'right-full top-1/2 -translate-y-1/2 -mr-1 border-r-gray-700'
	};

	return (
		<div className="group relative inline-block">
			{children}
			<div 
				className={`
					absolute ${positionClasses[direction]}
					px-3 py-1 bg-gray-700 text-white text-sm rounded-lg
					opacity-0 invisible
					group-hover:opacity-100 group-hover:visible
					transition-all duration-200
					whitespace-nowrap z-[1000]
				`}
			>
				{content}
				<div 
					className={`
						absolute ${arrowClasses[direction]}
						border-4 border-transparent
					`}
				/>
			</div>
		</div>
	);
}