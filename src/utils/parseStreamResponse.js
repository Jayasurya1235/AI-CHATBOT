/**
 * Parse streaming response chunks from Gemini API
 * @param {Array} chunks - Array of response chunks from streaming API
 * @returns {string} - Concatenated text from all chunks
 */
export const parseStreamResponse = (chunks) => {
  return chunks
    .map((chunk) => {
      try {
        if (chunk?.candidates?.[0]?.content?.parts?.[0]?.text) {
          return chunk.candidates[0].content.parts[0].text;
        }
      } catch (error) {
        console.error("Error parsing chunk:", error);
      }
      return "";
    })
    .join("");
};

/**
 * Handle streaming response from fetch API
 * Supports both streaming and regular JSON responses
 * @param {Response} response - The fetch response object
 * @returns {Promise<string>} - Complete concatenated response text
 */
export const handleStreamingResponse = async (response) => {
  try {
    // Read response as text to handle both JSON and streaming formats
    const responseText = await response.text();
    console.log("📝 Raw response:", responseText.substring(0, 200) + "...");
    
    // Try parsing as JSON first
    if (responseText.trim().startsWith("{") || responseText.trim().startsWith("[")) {
      try {
        const jsonData = JSON.parse(responseText);
        console.log("📦 Parsed as JSON:", jsonData);
        
        // Handle single response object
        if (jsonData?.candidates?.[0]?.content?.parts?.[0]?.text) {
          const text = jsonData.candidates[0].content.parts[0].text;
          console.log("✅ Extracted text from JSON object:", text);
          return text;
        }
        
        // Handle array of responses (streaming as JSON array)
        if (Array.isArray(jsonData)) {
          let fullResponse = "";
          jsonData.forEach((chunk, idx) => {
            if (chunk?.candidates?.[0]?.content?.parts?.[0]?.text) {
              const text = chunk.candidates[0].content.parts[0].text;
              fullResponse += text;
              console.log(`✅ Chunk ${idx}:`, text);
            }
          });
          if (fullResponse) return fullResponse;
        }
      } catch (jsonError) {
        console.log("JSON parse failed, trying NDJSON...", jsonError.message);
      }
    }
    
    // Handle newline-delimited JSON
    return parseNDJSON(responseText);
    
  } catch (error) {
    console.error("❌ Error handling response:", error);
    throw error;
  }
};

/**
 * Parse newline-delimited JSON
 * @param {string} text - The response text
 * @returns {string} - Combined text from all chunks
 */
const parseNDJSON = (text) => {
  const lines = text.split("\n").filter(line => line.trim());
  let fullResponse = "";
  
  console.log(`📋 Parsing ${lines.length} NDJSON lines...`);
  
  lines.forEach((line, idx) => {
    try {
      const parsed = JSON.parse(line);
      console.log(`Line ${idx}:`, {
        hasText: !!parsed?.candidates?.[0]?.content?.parts?.[0]?.text,
        text: parsed?.candidates?.[0]?.content?.parts?.[0]?.text,
        finishReason: parsed?.finishReason
      });
      
      if (parsed?.candidates?.[0]?.content?.parts?.[0]?.text) {
        const textChunk = parsed.candidates[0].content.parts[0].text;
        fullResponse += textChunk;
        console.log(`✅ Added chunk ${idx}:`, textChunk);
      }
    } catch (error) {
      console.warn(`⚠️ Failed to parse line ${idx}:`, line.substring(0, 50));
    }
  });
  
  console.log("✅ Final NDJSON response:", fullResponse);
  return fullResponse;
};
