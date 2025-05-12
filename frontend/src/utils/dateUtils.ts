export const formatDateForInput = (date: Date) => {
	const offset = date.getTimezoneOffset() * 60000;
	const localISOTime = new Date(date.getTime() - offset).toISOString().slice(0, 16);
	return localISOTime;
};