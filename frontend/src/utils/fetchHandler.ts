export async function fetchHandler(...args: [RequestInfo, RequestInit?]) { 
	console.log("SuperDebug")
	const response = await fetch(args[0], args[1])
	if (response.status === 401)  window.location.href = "/login"; // Redirect to login page if unauthorized	   
	return response;
}
