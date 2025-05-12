export type ValidationState = 'valid' | 'invalid' | 'neutral';

export const getInputStyles = (state: ValidationState) => {
    const baseStyles = 'w-full p-2 border rounded-md focus:ring-2 pr-10';  
    switch(state) {
        case 'valid':
            return `${baseStyles} border-green-500 bg-green-50 focus:ring-green-500 focus:border-green-500`;
        case 'invalid':
            return `${baseStyles} border-red-500 bg-red-50 focus:ring-red-500 focus:border-red-500`;
        default:
            return `${baseStyles} border-gray-300 focus:ring-blue-500 focus:border-blue-500`;
    }
};