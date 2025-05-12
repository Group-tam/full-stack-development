import { useState, useEffect, useRef } from "react";
import {fetchHandler} from "../utils/fetchHandler.ts";


//previous state handling
export const usePrevious = function <T>(value: T): T | undefined {
	const currentRef = useRef<T>(value);
	const previousRef = useRef<T | undefined>(undefined);

	if (currentRef.current !== value) {
		previousRef.current = currentRef.current;
		currentRef.current = value;
	}

	return previousRef.current;
}
/* Example usage:
const [count, setCount] = useState(0);
const prevCount = usePrevious(count);

console.log(`Current: ${count}, Previous: ${prevCount ?? 'N/A'}`);
setCount(count + 1); */

// For API CALLS
export const useFetch = <T>(url: string) => {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error | null>(null);
	
	useEffect(() => {
		const fetchData = async () => {
		setLoading(true);
		try {
			const response = await fetchHandler(url);
			const result = await response.json();
			setData(result);
		} catch (err){ setError(err as Error);}
	 
		 finally { setLoading(false);}     
		};
	
		fetchData();
	}, [url]);
	
	return { data, loading, error };
}
	/* Example usage:
	const { data, loading, error } = useFetch<User[]>('/users');

if (loading) return <p>Loading...</p>;
if (error) return <p>Error: {error.message}</p>;

return <ul>{data?.map(user => <li key={user[.]id}>{user[.]name}</li>)}</ul>; */
