# Spot Scouter
Spot Scouter is a web application for students to find study-friendly locations, view spot details, submit reviews and real-time reports, save favorite spots, and manage study sessions.

## GitHub Repository
https://github.com/hyckis/CS546-study-spot-finder

## How to Set Up and Run the Project
### 1. Install Dependencies
After unzipping the project folder, open a terminal in the project directory and run: npm install

## 2. MongoDB
Make sure MongoDB is installed and running locally.
The project uses the following local MongoDB database by default: mongodb://localhost:27017/Group15_Project

## 3. Seed the Database
Before running the application, seed the database with sample study spots and other relevant data: npm run seed:spots.
This will populate the local MongoDB database with sample data needed to test the application, including seed study spots importing from NYC open data; and default admin account: email: admin@spotscouter.com / password: Admin123!

## 4. Start the Application
Run: npm start, and the server will start on: http://localhost:3000.
This project is intended to be tested locally, and no external deployment is required.

## How to use the application
## User Features
● Sign up and log in
● Browse study spots
● View detailed information for each study spot
● Suggest new study spots
● Save favorite study spots
● Submit reviews and ratings
● Submit real-time reports about Wi-Fi, outlet availability, and crowdedness
● Report a spot as closed
● Create, search, and manage study sessions

## Admin Features
● Can use all of the user features above
● Review suggested study spots
● Approve or deny submitted study spot suggestions
● Review closure reports
● Approve or reject closure reports