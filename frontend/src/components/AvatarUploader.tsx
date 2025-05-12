import { useState, useRef, useEffect } from 'react';
import { fetchHandler } from '../utils/fetchHandler';
import { AvatarUploaderProps } from '../dataTypes/type';

export default function AvatarUploader({ 
	onAvatarUpload, 
	defaultAvatarUrl,
	defaultAvatarId,
	initialZoom = 1,
	onZoomChange,
}: AvatarUploaderProps & { initialZoom?: number; onZoomChange?: (zoom: number) => void }) {
	const [preview, setPreview] = useState<string>(defaultAvatarUrl);
	const [scale, setScale] = useState(initialZoom);
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);

	useEffect(() => {
		setPreview(defaultAvatarUrl);
	}, [defaultAvatarUrl]);

	useEffect(() => {
		setScale(initialZoom);
	}, [initialZoom]);

	const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		
		setSelectedFile(file);
		const reader = new FileReader();
		reader.onload = (e) => {
			if (e.target?.result) setPreview(e.target.result as string);
		};
		reader.readAsDataURL(file);

		try {
			const formData = new FormData();
			formData.append('image', file);

			const response = await fetchHandler('/user/image', {
				method: 'POST',
				body: formData,
				credentials: 'include'
			});

			const { imageId } = await response.json();
			onAvatarUpload(imageId);
		} catch (error) {
			console.error('Avatar upload failed:', error);
		}
	};

	const handleUseDefault = () => {
		setSelectedFile(null);
		setPreview(defaultAvatarUrl);
		onAvatarUpload(defaultAvatarId);
		setScale(1)
	};

	const handleZoomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newZoom = parseFloat(e.target.value);
		setScale(newZoom);
		onZoomChange?.(newZoom);
	};

	return (
		<div className="w-96 space-y-6">
			<div className="relative h-64 w-64 mx-auto">
				<div className="absolute inset-0 rounded-full overflow-hidden shadow-lg">
					<img 
						src={preview}
						className="w-full h-full object-cover transform transition-transform"
						style={{ transform: `scale(${scale})` }}
						alt="Avatar preview"
					/>
				</div>
				<div className="absolute inset-0 border-2 border-white/30 rounded-full pointer-events-none" />
			</div>
			<div className="space-y-4">
				<input
					type="file"
					accept="image/*"
					onChange={handleFileSelect}
					ref={fileInputRef}
					className="hidden"
				/>
				
				<button
					type="button"
					onClick={() => fileInputRef.current?.click()}
					className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors"
				>
					{selectedFile ? 'Change Avatar' : 'Choose Avatar'}
				</button>

				{selectedFile && (
					<>
						<div className="space-y-2">
							<label className="text-sm font-medium text-gray-700">Zoom</label>
							<input
								type="range"
								min="0.5"
								max="3"
								step="0.1"
								value={scale}
								onChange={handleZoomChange}
								className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
							/>
						</div>

						<button
							type="button"
							onClick={handleUseDefault}
							className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
						>
							Use Default Avatar
						</button>
					</>
				)}
			</div>
		</div>
	);
}