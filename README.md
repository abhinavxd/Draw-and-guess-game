# Draw-and-guess-game
[![Netlify Status](https://api.netlify.com/api/v1/badges/5ecedf27-ed37-4b09-ae16-ca07f69495b5/deploy-status)](https://app.netlify.com/sites/serene-jepsen-4741fc/deploys)

### How to play?

* When its your turn to draw, you will have to visualize the word and draw it in 90 seconds, alternatively when somebody else is drawing you have to type     your guess into the chat to gain points.
* Uses Socket.IO and Redis to manage game state, supports multiple game lobbies.

### Frontend deployment steps <br>
* Create following environment variables

      REACT_APP_API_URL=http://localhost:8283 
      REACT_APP_DOMAIN=http://localhost:3000
      REACT_APP_SOCKET_PATH=
     
* npm install
* npm start

### Backend deployment steps <br>
* Install redis for your operating system from https://redis.io/ <br>
* Create environment variable 

      PORT=8283 
     
* npm install
* node index.js


![draw-and-guess](https://user-images.githubusercontent.com/48166553/126893424-bd9d9a15-308c-415b-81b0-d15a640a117f.gif)

<!-- ![Home page](https://i.ibb.co/Fbs52DJ/Screenshot-from-2021-05-16-13-01-20.png) 

![Word selection](https://project-bucket-be.s3.ap-south-1.amazonaws.com/Screenshot+from+2021-04-02+03-15-43.png)

![Game image](https://project-bucket-be.s3.ap-south-1.amazonaws.com/Screenshot+from+2021-04-02+03-17-09.png) -->
PS. Ignore my drawing skills


Development
-----------

If you want to work on this application I’d love your pull requests and tickets on GitHub!
Please make sure it describes the problem or feature request fully.

