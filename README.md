# CS546-study-spot-finder

Project Name: Spot Scouter
Group Members:
● YiChin Ho
● Wanli Yang(comment)
● Jaycen Pagen
● Yuxi Chen

Description:
Our project is called Spot Scouter, helping students quickly find nearby places to study and connect with other students. The application allows users to search for nearby libraries and cafes, view study-related information such as WiFi stability, socket availability, and crowdedness, and share real-time reports with other users.
By combining open datasets with user-generated reports, the platform provides up-to-date information about study environments. In addition to helping users find suitable study spots, the application also allows students to connect with others in the same major to form study groups when needed.
The goal of this project is to make it easier for students to quickly locate suitable study environments and spend more time studying instead of searching for a place to work.

Dataset from NYC open data:
https://data.cityofnewyork.us/City-Government/NYC-Wi-Fi-Hotspot-Locations/yjub-udmw/about_data
https://data.cityofnewyork.us/d/ji82-xba5
https://data.cityofnewyork.us/Health/DOHMH-New-York-City-Restaurant-Inspection-Results/43nn-pn8j/about_data

Core Features:
Study Spot Management System
Manage study spot records imported from datasets and allow new locations to be created, updated, and deleted by an admin.
Each study spot will include:
Location name
Basic availability information
Basic description
Average rating
Locations in the system may come from:
Public datasets (use NYC WiFi and location datasets as seed)
Locations added manually by administrators
A registered user could suggest a good study spot in NYC. After an admin reviews the spot, it is either made a spot or denied.

Search and Discovery System
The Search and Discovery System allows users to find suitable study locations.
Users can search for locations based on:
Wi-Fi availability
Outlets
Crowdedness level
Open status.
The system will display a list of locations along with:
Average Rating
Recent reports

Rating and Real-Time Reporting System
Users can submit ratings, comments, and short-term real-time reports using a form.
Short-term real-time reports are managed within a defined time window.
For example, a report may stay active for 90 minutes before it expires.
Short-term real-time reports will be shown in aggregated status.
Real-time Wi-fi status include:
“Fast”
“Moderately Fast”
“Slow”
Real-time socket status include:
“Enough”
“Moderately Enough”
“Full”
Real-time spot status include:
“Quiet”
“Moderately busy”
“Crowded”
“Full”

Study Session System
Users can create new study sessions at specific study spots.
A new study session created should include:
The study spot
Course
Topic
Time
Group size
Users can search for study sessions using the session details.
Users can request to join a study session by sending a request to the session creator.
Users can join a study session after the request has been approved by the session creator.

Favorites System
Users can save their favorite study spots.
Users can manage and delete their favorite study spots.
Users can quickly access and check the availability of their favorite study spots.

Extra Features:
Smart Matching / Recommendations
Recommend study sessions, study partners, or study spots based on user major, interests, or activity history.

Map View
Based on users’ current location, display nearby study spots using a map view for easier location browsing.

Spot closure/Issue Report System
Users can report if a study spot is temporarily closed, under maintenance, or unsuitable for studying, and administrators can review and update the spot status.

Core Features:
● Landing Page
Introduces the purpose and functionality of the Study Spot Finder application.
Allows users to sign up or log in.

● User Profile Page
Displays user information including name and major.
Shows the user’s favorite study spots list.
Displays the user’s submitted reviews and reports.
Allows users to update their profile information.
Allows users to manage their favorite spots list.
Allows users to manage their submitted reviews and reports.

● Study Spots Page
Displays a list of nearby libraries and cafes.
Each location card will display:
Location name
Basic availability information
Basic description
Average rating
Users can search for locations based on their current area.
Users can add locations to their favorites list.

● Study Spot Detail Page (for a selected location)
Displays detailed information including:
Location information
Basic availability information
Cafe menu (if applicable)
WiFi stability reports
Socket availability reports
Crowdedness reports
Displays user reviews and comments.
Allows users to:
Submit ratings and comments
Report WiFi stability
Report socket availability
Report current crowdedness

● Rating and Reporting System
Users can:
Submit ratings and comments for study spots
Report WiFi stability
Report number or availability of sockets
Report whether a location is crowded
User reports will provide real-time information about study spot conditions.

● Favorite Spots List System
Users can:
Add study spots to a favorites list
Remove study spots from favorites list
Quickly access favorite study spots

Extra Features:
● Study Group Matching
After users enter their major in their profile, the system will allow users to:
Find other users with the same major
Connect with students who want to study together

CRUD
C
New user
New comments
New reports
New favorite spots

R
Check location
Check wifi
Check rate & comments
Check reports

U
Update user profile
Update rate & comments
Update favorite spots list

D
Delete user profile
Delete comments

DB Structure:
Users
The users collection stores all registered users of the application, including “user” and “admin”.
Users can create accounts, log in, save favorite spots, create/join study sessions, and submit reviews/reports. Admins can also view/confirm/reject the users’ reports.

Sample Document
{
"\_id": "1",
"firstName": "Wanli",
"lastName": "Yang",
"email": "wanliyang@example.com",
"hashedPassword": "123",
"major": "Computer Science",
"role": "user",
"favoriteSpotIds": [
"1",
"2"
],
"createdSessionIds": [
"1"
],
"joinedSessionIds": [
"1"
],
"createdAt": "1/1/2026"
}

Field Table
Field Name
Field Type
Description
\_id
string/ObjectId
Unique identifier for the user
firstName
string
User’s first name
lastName
string
User’s last name
email
string
User’s email address
hashedPassword
string
Hashed password for login
major
string
User’s major
role
string
Role of the user, such as user or admin
favoriteSpotIds
array
Array of study spot ids saved by the user
createdSessionIds
array
Array of study session ids created by the user
joinedSessionIds
array
Array of study session ids the user joined
createdAt
date
Date and time when the account was created
reviewedReportIds
array
(ADMIN ONLY) Array of report IDs the admin has reviewed
reviewedSpotIds
array
(ADMIN ONLY) Array of spot ids the admin has approved or rejected

studySpots
The studySpots collection stores all study spots stored in the system. The spots come from the public dataset/admin’s manual creation/users’ suggestion after admin’s approval. Each study spot contains basic location and study-related information. Availability information suggested by the users will also be contained after approved by the admin.

Sample Document
{
"\_id": "1",
"name": "Hoboken Public Library",
"category": "Library",
"address": "500 Park Ave, Hoboken, NJ",
"boroughOrCity": "Hoboken",
"state": "NJ",
"zipCode": "07030",
"coordinates": {
"latitude": 40.7448,
"longitude": -74.0324
},
"wifiAvailable": true,
"outletsAvailable": true,
"openStatus": "Open",
"description": "Quiet public library with reliable WiFi and many tables.",
"averageRating": 4.5,
"sourceType": "dataset",
"approved": true,
"reviewedBy": null,
"reviewNotes": "",
"createdBy": "admin",
"createdAt": "1/1/2026"
}
Coordinates (subdocument; not stored in a collection)
{
"latitude": 40.7448,
"longitude": -74.0324
}
Field Name
Field Type
Description
latitude
number
Latitude of the study spot
longitude
number
Longitude of the study spot

Field Table
Field Name
Field Type
Description
\_id
string/ObjectId
Unique identifier for the study spot
name
string
Name of the study spot
category
string
Type of study spot, such as library or cafe
address
string
Street address of the study spot
boroughOrCity
string
City or borough where the spot is located
state
string
State of the study spot
zipCode
string
ZIP code of the study spot
coordinates
Coordinates
Latitude and longitude of the study spot
wifiAvailable
boolean
Whether WiFi is available
outletsAvailable
boolean
Whether outlets are available
openStatus
string
Current open status such as Open or Closed
description
string
Basic description of the study spot
averageRating
number
Average rating based on user reviews
sourceType
string
Indicates whether the spot came from dataset, admin, or approved suggestion
approved
boolean
Indicates whether the study spot is approved
reviewedBy
string/ObjectId/null
Admin id of the reviewer, if reviewed
reviewNotes
string
Notes written by the admin reviewer
createdBy
string
Shows whether it was created by admin or imported
createdAt
date
Date and time when the spot was added

Reviews
The reviews collection stores users’ ratings and comments for each study spot. Each review belongs to one user and one study spot.
Sample Document
{
"\_id": "1",
"userId": "1",
"spotId": "1",
"rating": 5,
"comment": "Very quiet and the WiFi was stable during the afternoon.",
"createdAt": "1/1/2026"
}

Field Table
Field Name
Field Type
Description
\_id
string/ObjectId
Unique identifier for the review
userId
string/ObjectId
Id of the user who created the review
spotId
string/ObjectId
Id of the study spot being reviewed
rating
number
Numeric rating given by the user
comment
string
User’s review comment
createdAt
date
Date and time when the review was submitted

Reports
The reports collection stores immediate real-time reports for the study spots, such as WiFi speed/outlet availability/crowdedness/closure/other issues. Each report belongs to one user and one spot. Other than closure reports, the reports stay active for a limited period of time.
Sample Document
{
"\_id": "1",
"spotId": "1",
"userId": "1",
"wifiStatus": "Fast",
"socketStatus": "Enough",
"crowdednessStatus": "Quiet",
"expiresAt": "2/1/2026",
"createdAt": "1/1/2026",
"type": "status",
"status": "approved",
"approvedBy": "1”
}

Field Table
Field Name
Field Type
Description
\_id
string/ObjectId
Unique identifier for the report
spotId
string/ObjectId
Id of the study spot the report belongs to
userId
string/ObjectId
Id of the user who submitted the report
wifiStatus
string
Current WiFi condition such as Fast, Moderately Fast, or Slow
socketStatus
string
Current outlet condition such as Enough, Moderately Enough, or Full
crowdednessStatus
string
Current crowdedness such as Quiet, Moderately Busy, Crowded, or Full
expiresAt
date
Time when the report expires
createdAt
date
Time when the report was created
type
string
Type of report (status or closure)
status
string
Current state of the report (pending, approved, rejected)
resolvedBy
string/ObjectId
Id of the admin who confirmed/rejected the report

studySessions
The studySessions collection stores study sessions created by users. Users can create sessions within a specific study spot, including details such as course/topic/time/group size. Other users can send a request to join the created session while the number of participants has not exceeded the group size. The creator of the session can approve or reject the requests.
Sample Document
{
"\_id": "1",
"creatorId": "1",
"spotId": "1",
"course": "CS 546",
"topic": "MongoDB Review",
"sessionTime": "1/1/2026 12:00",
"groupSize": 4,
"approvedMemberIds": [
"2"
],
"pendingMemberIds": [
"3"
],
"status": "Open",
"createdAt": "1/1/2026"
}

Field Table
Field Name
Field Type
Description
\_id
string/ObjectId
Unique identifier for the study session
creatorId
string/ObjectId
Id of the user who created the session
spotId
string/ObjectId
Id of the study spot where the session will take place
course
string
Course related to the study session
topic
string
Topic of the session
sessionTime
date
Scheduled date and time of the study session
groupSize
number
Maximum number of participants
approvedMemberIds
array
Array of user ids approved to join
pendingMemberIds
array
Array of user ids waiting for approval
status
string
Indicates whether the session is open, full, or closed
createdAt
date
Date and time when the session was created

SpotSuggestions
Sample Document
{
"\_id": "1",
"submittedBy": "1",
"name": "Hidden Grounds Coffee",
"category": "Cafe",
"address": "79 Hudson St, Hoboken, NJ",
"description": "Small cafe with good coffee, decent WiFi, and some outlets.",
"status": "Pending",
"reviewedBy": null,
"reviewNotes": "",
"submittedAt": "1/1/2026"
}
Field Table
Field Name
Field Type
Description
\_id
string/ObjectId
Unique identifier for the suggestion
submittedBy
string/ObjectId
Id of the user who submitted the suggestion
name
string
Name of the suggested study spot
category
string
Suggested category such as library or cafe
address
string
Address of the suggested location
description
string
Short description of the location
status
string
Current review status such as Pending, Approved, or Denied
reviewedBy
string/ObjectId/null
Admin id of the reviewer, if reviewed
reviewNotes
string
Notes written by the admin reviewer
submittedAt
date
Date and time when the suggestion was submitted

File Structure:
/CS546-Spot-Scouter
│
├── app.js
├── package.json
│
├── /config
│ └── mongoConnection.js
│
├── /data
│ ├── users.js
│ ├── spots.js
│ ├── reviews.js
│ ├── reports.js
│ ├── sessions.js
│ └── favorites.js
│
├── /routes
│ ├── auth.js
│ ├── users.js
│ ├── spots.js
│ ├── reports.js
│ ├── sessions.js
│ └── index.js
│
├── /views
│ ├── layouts
│ │ └── main.handlebars
│ │
│ ├── auth
│ │ ├── login.handlebars
│ │ └── signup.handlebars
│ │
│ ├── spots
│ │ ├── list.handlebars
│ │ ├── detail.handlebars
│ │ └── create.handlebars
│ │
│ ├── sessions
│ │ ├── list.handlebars
│ │ └── detail.handlebars
│ │
│ ├── user
│ │ └── profile.handlebars
│ │
│ ├── partials
│ │ ├── navbar.handlebars
│ │ └── footer.handlebars
│ │
│ ├── error.handlebars
│ └── home.handlebars
│
├── /public
│ ├── css
│ │ └── styles.css
│ │
│ ├── js
│ │ └── client.js
│ │
│ └── images
│
├── /utils
│ ├── helpers.js
│ └── validators.js
│
└── README.md
