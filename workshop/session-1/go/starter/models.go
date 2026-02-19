package main

type QuestionRequestBody struct {
	Question string `json:"question"`
}

type Source struct {
	Number int    `json:"number"`
	Title  string `json:"title"`
	URL    string `json:"url"`
}

type QuestionResponseBody struct {
	Answer         string   `json:"answer"`
	Sources        []Source `json:"sources"`
	ProcessingTime float64  `json:"processing_time"`
}
