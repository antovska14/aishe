package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

func main() {
	// Hints:
	// 1. Define structs to represent the API request and response
	// 2. Build a JSON payload with the question
	// 3. Make an HTTP POST request to the AISHE API endpoint
	// 4. Parse the JSON response
	// 5. Display the answer, sources, and processing time
	// 6. Display the total execution time using: time.Since(startTime).Seconds()
	// 7. Handle errors appropriately (connection, timeout, HTTP errors)

	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		// .env file is optional, continue with system environment variables
	}

	// Check if question was provided
	if len(os.Args) < 2 {
		fmt.Println("Usage: go run . <your question>")
		fmt.Println("Example: go run . 'What is the capital of France?'")
		os.Exit(1)
	}

	// Get question from command line arguments
	question := strings.Join(os.Args[1:], " ")

	// Start timing
	startTime := time.Now()

	fmt.Printf("Asking: %s\n", question)
	fmt.Println("Waiting for response...\n")

	requestBody := QuestionRequestBody{
		Question: question,
	}

	jsonRequestBody, err := json.Marshal(requestBody)

	if err != nil {
		panic(err)
	}

	url := os.Getenv("AISHE_URL")

	httpClient := &http.Client{
		Timeout: 10 * time.Second,
	}

	req, err := http.NewRequest("POST", url+"/api/v1/ask", bytes.NewBuffer(jsonRequestBody))
	if err != nil {
		panic(err)
	}
	defer req.Body.Close()

	req.Header.Set("Content-Type", "application/json")

	resp, err := httpClient.Do(req)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		panic(err)
	}

	var responseBody QuestionResponseBody
	if err := json.Unmarshal(body, &responseBody); err != nil {
		panic(err)
	}

	fmt.Printf("Answer: %s\n", responseBody.Answer)
	fmt.Println()
	fmt.Printf("Processing Time: %v seconds\n", responseBody.ProcessingTime)
	fmt.Println("Sources:")
	for _, source := range responseBody.Sources {
		fmt.Printf("  %d. %s - %s\n", source.Number, source.Title, source.URL)
	}

	fmt.Println()
	fmt.Printf("Total Execution Time: %v seconds \n", time.Since(startTime).Seconds())
}
