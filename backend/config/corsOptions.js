//Cross Origin Resource Sharing
const whitelist = ['https://www.google.com', 'http://localhost:5173']; //domains that can access the backend

//Checks if origin is in whitelist if not sends back error
const corsOptions = {
    origin: (origin, callback) => {
        if(whitelist.indexOf(origin) !== -1 || !origin){
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    optionsSuccessState: 200
}

module.exports = corsOptions;