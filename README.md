## Getting Started

1) `npm install`
2) `npm start`

## What is required for the transcription demo ?

1) API token, which can be generated on https://dev.ins8.ai by signing up and generating one on the Dashboard page
2) Enter your API token in the input field and you can start Upload File or Record to obtain the STT transcript

## Environment variable (.env)

By default, the environment provided will be pointing to Ins8.ai deployed cloud environment.
For custom environment(on-prem deployment etc), change the url in the file(.env).

## Build Docker Image and runs it in a container (port 8080)
`sh build_image.sh`

Run this command in terminal- GIT Bash preferably.
Image of the project build will be served by nginx
1) Ensure that Docker is already running.
2) Ensure that terminal is pointing to the project directory (../ins8-demo)

## Documentation

You can access our documentation on the available API by
1) https://stt.ins8.ai/doc/
2) https://dev.ins8.ai Login and click on "Documentation" tab


### Others
`npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.