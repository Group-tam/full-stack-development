export const cropToCircle = (imageSrc: string, scale: number): Promise<Blob> => {
	return new Promise((resolve) => {
		const canvas = document.createElement('canvas');
		const ctx = canvas.getContext('2d')!;
		const img = new Image();
		
		img.onload = () => {
			canvas.width = 256;
			canvas.height = 256;
			
			//dimensions
			const scaledWidth = img.width * scale;
			const scaledHeight = img.height * scale;
			
			// Draw image
			ctx.drawImage(
				img,
				(canvas.width - scaledWidth) / 2,
				(canvas.height - scaledHeight) / 2,
				scaledWidth,
				scaledHeight
			);

			// circular mask
			ctx.globalCompositeOperation = 'destination-in';
			ctx.beginPath();
			ctx.arc(128, 128, 128, 0, Math.PI * 2);
			ctx.fill();

			// Convert to Blob
			canvas.toBlob((blob) => {
				if (blob) resolve(blob);
			}, 'image/jpeg', 0.9);
		};		
		img.src = imageSrc;
	});
};