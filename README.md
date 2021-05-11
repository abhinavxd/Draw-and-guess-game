# Draw-and-guess-game (v1.0.3)
[![Netlify Status](https://api.netlify.com/api/v1/badges/5ecedf27-ed37-4b09-ae16-ca07f69495b5/deploy-status)](https://app.netlify.com/sites/serene-jepsen-4741fc/deploys)

Play here http://drawandguess.xyz/

Turn based multiplayer game, Each player gets a word and has to draw to it on the canvas, while other players guess that word by typing it in the chat.

Uses Socket.IO and Redis for game state management, supports multiple game lobbies.

Client deployment steps
Create environment variable REACT_APP_API_URL=http://localhost:8283

Server deployment steps
Install redis for your operating system from https://redis.io/
Create environment variable PORT=8283



![Home page](https://project-bucket-be.s3.ap-south-1.amazonaws.com/Screenshot+from+2021-04-02+03-15-17.png)

![Word selection](https://project-bucket-be.s3.ap-south-1.amazonaws.com/Screenshot+from+2021-04-02+03-15-43.png)

![Game image](https://project-bucket-be.s3.ap-south-1.amazonaws.com/Screenshot+from+2021-04-02+03-17-09.png)
PS. Ignore my drawing skills

