# angular-sails-wiring
Angular and sails application boilerplate.  
It implements clear project structure with separate `frontend/` and `backend/` folder structure.  
Gruntfile.js at project root the provides:

**serve* task for development. It starts frontend and backend development servers and proxies requests to them.

*build* task that compiles both parts, and links them into `dist/` folder.


*Why angular-sails-wiring?*  
Another solutions like [sails-generate-frontend-angular](https://github.com/chiefy/sails-generate-frontend-angular) and [simple-angular-rails-app](https://github.com/EmmanuelOga/simple-angular-rails-app) are either putting frontend inside of backend folder or backend inside frontend. Such approach leads to mixup of frontend and backend files and limits generators usage.

# Project sturcutre
Having separate frontend and backend folders makes project structure clear. They are being wired together by upper-level grunt file. 

frontend/  
--> app/ (raw source)  
--> dist/ (compiled source)  
--> Gruntfile.js (frontend: config with tasks 'watch', 'serve' and 'build')  

backend/  
--> api/ (raw source)  
--> assets/ (folder for compiled frontend source)  
--> Gruntfile.js (backend: config with tasks 'watch', 'serve' and 'build' )  


Gruntfile (subgrunt that relies on upper files, and links frontend/dist to backend/assets when needed)


# Set-up
You are free to choose what generator use for both frontend and backend

## 1. Frontend (Angularjs)
One of the ways to generate angularjs app is [yeoman angular generator](https://github.com/yeoman/generator-angular), but you are not limited to it. Run the following command after installation complete.

```
cd frontend && yo angular && cd ..
```
It will create AngularJS app in frontend folder. It's assumed that you build is configured to frontend/dist folder (default setting in yeoman generator). You can use generator to add more models to it.

## 2. Backend (Sails)
Create new SailsJS application in your backend folder. 
```
cd backend
rm .gitkeep && sails new && cd ..
```

## 3. Check config
angular-sails-wiring sets up a new connect server at port 3000. It proxies requests to frontend and backend parts (checks frontend for 404 and falls back to backend).

```
	var wiringConfig = {   
        port: 3000,

        backend: {
            dir: 'backend',
            port: 1338
        },

        frontend: {
            dir: 'frontend',
            port: 9000
        },

        distFolder: 'distFolder'
    };
```

## 4. Start development

```
npm install
grunt serve
```

It is recommended to change ```open: true``` to ```open: false``` on frontend/Gruntfile.js, it will prevent extra window (localhost:9000 on start)

## 5. Deploy
```
grunt build
```
