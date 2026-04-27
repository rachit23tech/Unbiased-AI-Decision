import client from "./client";

export async function fetchAnalysisResults(jobId) {
  if (!jobId) {
    return { data: null, message: "No job selected yet." };
  }

  const response = await client.get(`/jobs/${jobId}/results`);
  return response.data;
}
