// Exa AI API client for web search
const EXA_API_URL = 'https://api.exa.ai/search';
const exaApiKey = "563548e7-528f-47b9-a477-2d92d9c65260"; // In production, use environment variables

interface ExaSearchOptions {
  query: string;
  startPublishedDate?: string;
  numResults?: number;
}

interface ExaSearchResult {
  id: string;
  title: string;
  url: string;
  publishedDate?: string;
  author?: string;
  score: number;
  text: string;
  favicon?: string;
  image?: string;
  extras?: {
    links?: string[];
  };
}

interface ExaSearchResponse {
  requestId: string;
  autopromptString?: string;
  resolvedSearchType?: string;
  results: ExaSearchResult[];
  costDollars?: {
    total: number;
    search?: {
      neural?: number;
    };
    contents?: {
      text?: number;
    };
  };
}

/**
 * Search the web using Exa AI API
 * @param options Search options
 * @returns Search results
 */
export async function searchWithExa(options: ExaSearchOptions): Promise<ExaSearchResponse | null> {
  if (!exaApiKey) {
    console.error('Exa API key is not set');
    return null;
  }

  try {
    // Create a date 7 days ago as default if not provided
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 7);
    
    const payload = {
      query: options.query,

      numResults: options.numResults || 5,
      contents: {
        text: true,
        livecrawl: "always",
        extras: {
          links: 5
        }
      }
    };

    console.log('Exa search request payload:', JSON.stringify(payload));

    const response = await fetch(EXA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${exaApiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Exa API error: ${response.status} ${response.statusText}`, errorText);
      return null;
    }

    const data = await response.json();
    console.log('Exa search results count:', data?.results?.length || 0);
    
    // Return the actual data from the API
    return {...data, payload};
  } catch (error) {
    console.error('Error searching with Exa:', error);
    return null;
  }
}
