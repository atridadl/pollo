# Pollo

## Stack:
- Backend: Golang + Echo
- Rendering: Golang templates
- Style: TailwindCSS + DaisyUI
- Content format: Markdown

## Requirements:
- Golang 1.22.0

## Instructions:
1. Run go get
2. Duplicate the .env.example file and call it .env
3. Fill out the .env values
4. Run `go run main.go`

_Note that on MacOS, you need to right click and open the appropriate tailwind executable before you can run StyleGen. This is a limitation of running unsigned binaries in MacOS. Blame Tim Apple._

## Tests
Without Coverage: `go test pollo/lib`
With Coverage: `go test pollo/lib -cover`
