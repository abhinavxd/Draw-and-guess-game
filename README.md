# Draw-and-guess-game (v1.0.3)
[![Netlify Status](https://api.netlify.com/api/v1/badges/5ecedf27-ed37-4b09-ae16-ca07f69495b5/deploy-status)](https://app.netlify.com/sites/serene-jepsen-4741fc/deploys)

### How to play?

* When its your turn to draw, you will have to visualize the word and draw it in 90 seconds, alternatively when somebody else is drawing you have to type     your guess into the chat to gain points.
* Uses Socket.IO and Redis for game state management, supports multiple game lobbies.

# Frontend deployment steps <br>
* Create environment variable REACT_APP_API_URL=http://localhost:8283 
* npm install
* npm start

# Server deployment steps <br>
* Install redis for your operating system from https://redis.io/ <br>
* Create environment variable PORT=8283 
* npm install
* node index.js


![Home page](https://i.ibb.co/pvWfcLZ/Screenshot-from-2021-05-16-13-01-20.png)

![Word selection](https://project-bucket-be.s3.ap-south-1.amazonaws.com/Screenshot+from+2021-04-02+03-15-43.png)

![Game image](https://project-bucket-be.s3.ap-south-1.amazonaws.com/Screenshot+from+2021-04-02+03-17-09.png)
PS. Ignore my drawing skills

