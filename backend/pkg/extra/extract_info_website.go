package main

import (
	"fmt"
	"log"
	"net/http"
	"strings"

	"golang.org/x/net/html"
)

// Function to recursively traverse the HTML tree and extract visible text
// Function to recursively traverse the HTML tree and extract visible text
func extractText(n *html.Node) string {
	if n == nil {
		return ""
	}

	// Skip script, style, and all img elements and their content
	if (n.Type == html.ElementNode && n.Data == "script") ||
		(n.Type == html.ElementNode && n.Data == "style") ||
		(n.Type == html.ElementNode && n.Data == "img") {
		return ""
	}

	// Skip comments
	if n.Type == html.CommentNode {
		return ""
	}

	if n.Type == html.TextNode {
		return n.Data
	}

	var text string
	var placeholder string
	for c := n.FirstChild; c != nil; c = c.NextSibling {
		placeholder = extractText(c)
		if strings.Contains(placeholder, "img") {
			text += extractText(c)
		}
	}
	return text
}

func main() {
	fmt.Println("Start")
	// Replace this with the URL of the website you want to scrape
	url := "https://safetyculture.com"

	// Make an HTTP GET request
	response, err := http.Get(url)
	if err != nil {
		log.Fatal(err)
	}
	defer response.Body.Close()

	// Check if the response status code is 200 (OK)
	if response.StatusCode != 200 {
		log.Fatalf("Request failed with status code %d", response.StatusCode)
	}

	// Parse the HTML content
	doc, err := html.Parse(response.Body)
	if err != nil {
		log.Fatal(err)
	}

	var textContent strings.Builder

	// Recursive function to extract text
	var extract func(*html.Node)
	extract = func(n *html.Node) {
		if n == nil {
			return
		}

		// Extract text from the current node
		text := extractText(n)
		if text != "" {
			textContent.WriteString(text + " ")
		}

		// Recursively process child nodes
		extract(n.FirstChild)
		extract(n.NextSibling)
	}

	// Start the extraction with the root node
	extract(doc)

	// Extracted visible text from the website
	extractedText := textContent.String()

	// Print the extracted text (you can process it further as needed)
	fmt.Println(extractedText)
}
